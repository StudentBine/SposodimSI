import 'dotenv/config'; // mora biti prvi, preden se ustvari bazen povezav
import { test, after } from 'node:test';
import assert from 'node:assert';
import { oddajZahtevek } from '../src/services/izposoje.js';
import { pool } from '../src/db.js';
import { ustvariOpremo, pocisti, cez } from './pomocnik.js';

after(pocisti);

const CLAN = 3; // clan@sposodimsi.si
const MAJA = 4; // maja@sposodimsi.si

// Za teste namesto skrbnika neposredno odobrimo izposojo v bazi
async function odobri(id) {
  await pool.query("UPDATE izposoja SET status = 'odobrena', odobril_id = 2 WHERE id = $1", [id]);
}

test('zahtevek dobi stanje "zahtevana" in je vezan na člana', async () => {
  const opremaId = await ustvariOpremo();
  const izposoja = await oddajZahtevek(CLAN, { opremaId, od: cez(1), do: cez(2), namen: 'Testni namen' });
  assert.strictEqual(izposoja.status, 'zahtevana');

  const vBazi = await pool.query('SELECT clan_id FROM izposoja WHERE id = $1', [izposoja.id]);
  assert.strictEqual(vBazi.rows[0].clan_id, CLAN);
});

test('neizposodljiva oprema vrne 409 OPREMA_NI_IZPOSODLJIVA', async () => {
  const opremaId = await ustvariOpremo('v_popravilu');
  await assert.rejects(
    oddajZahtevek(CLAN, { opremaId, od: cez(1), do: cez(2), namen: 'Testni namen' }),
    { status: 409, koda: 'OPREMA_NI_IZPOSODLJIVA' }
  );
});

test('več čakajočih zahtevkov za isti termin je dovoljenih', async () => {
  const opremaId = await ustvariOpremo();
  await oddajZahtevek(CLAN, { opremaId, od: cez(1), do: cez(2), namen: 'Prvi zahtevek' });
  const drugi = await oddajZahtevek(MAJA, { opremaId, od: cez(1), do: cez(2), namen: 'Drugi zahtevek' });
  assert.strictEqual(drugi.status, 'zahtevana');
});

test('prekrivanje z odobreno izposojo vrne 409 TERMIN_ZASEDEN', async () => {
  const opremaId = await ustvariOpremo();
  const prva = await oddajZahtevek(CLAN, { opremaId, od: cez(1), do: cez(3), namen: 'Prvi zahtevek' });
  await odobri(prva.id);

  await assert.rejects(
    oddajZahtevek(MAJA, { opremaId, od: cez(2), do: cez(4), namen: 'Drugi zahtevek' }),
    (napaka) => {
      assert.strictEqual(napaka.status, 409);
      assert.strictEqual(napaka.koda, 'TERMIN_ZASEDEN');
      assert.match(napaka.message, /zasedena \(od .+ do .+\)/);
      return true;
    }
  );
});

test('termin takoj po odobreni izposoji ni konflikt', async () => {
  const opremaId = await ustvariOpremo();
  const konec = cez(2);
  const prva = await oddajZahtevek(CLAN, { opremaId, od: cez(1), do: konec, namen: 'Prvi zahtevek' });
  await odobri(prva.id);

  const druga = await oddajZahtevek(MAJA, { opremaId, od: konec, do: cez(3), namen: 'Drugi zahtevek' });
  assert.strictEqual(druga.status, 'zahtevana');
});