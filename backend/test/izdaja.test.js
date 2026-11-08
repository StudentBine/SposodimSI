import 'dotenv/config'; // mora biti prvi, preden se ustvari bazen povezav
import { test, after } from 'node:test';
import assert from 'node:assert';
import { oddajZahtevek, odobri, izdaj, podrobnostiIzposoje } from '../src/services/izposoje.js';
import { pool } from '../src/db.js';
import { ustvariOpremo, pocisti, cez } from './pomocnik.js';

after(pocisti);

const SKRBNIK = 2;
const CLAN = 3;

// Ustvari odobreno izposojo za novo testno opremo
async function odobrenaIzposoja() {
  const opremaId = await ustvariOpremo();
  const zahtevek = await oddajZahtevek(CLAN, { opremaId, od: cez(1), do: cez(2), namen: 'Testni namen' });
  await odobri(zahtevek.id, SKRBNIK);
  return { id: zahtevek.id, opremaId };
}

test('izdaja ustvari zapis "izdaja" in prestavi izposojo v "izdana"', async () => {
  const { id } = await odobrenaIzposoja();
  const izdana = await izdaj(id, SKRBNIK, { ocena: 'brez_poskodb', opomba: 'Vključena torba' });
  assert.strictEqual(izdana.status, 'izdana');
  assert.ok(izdana.izdana_ob);

  const podrobnosti = await podrobnostiIzposoje(id);
  assert.strictEqual(podrobnosti.zapisi.length, 1);
  assert.strictEqual(podrobnosti.zapisi[0].tip, 'izdaja');
  assert.strictEqual(podrobnosti.zapisi[0].opomba, 'Vključena torba');
});

test('izdaja čakajočega zahtevka vrne 409', async () => {
  const opremaId = await ustvariOpremo();
  const zahtevek = await oddajZahtevek(CLAN, { opremaId, od: cez(1), do: cez(2), namen: 'Testni namen' });
  await assert.rejects(izdaj(zahtevek.id, SKRBNIK, { ocena: 'brez_poskodb' }), { status: 409 });
});

test('izdaja opreme, ki je medtem šla v popravilo, vrne 409', async () => {
  const { id, opremaId } = await odobrenaIzposoja();
  await pool.query("UPDATE oprema SET status = 'v_popravilu' WHERE id = $1", [opremaId]);
  await assert.rejects(izdaj(id, SKRBNIK, { ocena: 'brez_poskodb' }), { status: 409, koda: 'OPREMA_NI_IZPOSODLJIVA' });
});

test('zapisa stanja ni mogoče spremeniti ali izbrisati niti neposredno v bazi', async () => {
  const { id } = await odobrenaIzposoja();
  await izdaj(id, SKRBNIK, { ocena: 'brez_poskodb' });

  await assert.rejects(
    pool.query("UPDATE zapis_stanja SET ocena = 'poskodovano' WHERE izposoja_id = $1", [id]),
    /ni dovoljeno/
  );
  await assert.rejects(pool.query('DELETE FROM zapis_stanja WHERE izposoja_id = $1', [id]), /ni dovoljeno/);
});