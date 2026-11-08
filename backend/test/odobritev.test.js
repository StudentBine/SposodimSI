import 'dotenv/config'; // mora biti prvi, preden se ustvari bazen povezav
import { test, after } from 'node:test';
import assert from 'node:assert';
import { oddajZahtevek, odobri, zavrni, mojeIzposoje } from '../src/services/izposoje.js';
import { pool } from '../src/db.js';
import { ustvariOpremo, pocisti, cez } from './pomocnik.js';

after(pocisti);

const SKRBNIK = 2;
const CLAN = 3;
const MAJA = 4;

test('odobritev prestavi zahtevek v "odobrena" in zabeleži skrbnika', async () => {
  const opremaId = await ustvariOpremo();
  const zahtevek = await oddajZahtevek(CLAN, { opremaId, od: cez(1), do: cez(2), namen: 'Testni namen' });
  const odobrena = await odobri(zahtevek.id, SKRBNIK);
  assert.strictEqual(odobrena.status, 'odobrena');
  assert.strictEqual(odobrena.odobril_id, SKRBNIK);
});

test('že odobrene izposoje ni mogoče odobriti še enkrat (409)', async () => {
  const opremaId = await ustvariOpremo();
  const zahtevek = await oddajZahtevek(CLAN, { opremaId, od: cez(1), do: cez(2), namen: 'Testni namen' });
  await odobri(zahtevek.id, SKRBNIK);
  await assert.rejects(odobri(zahtevek.id, SKRBNIK), { status: 409, koda: 'NEDOVOLJEN_PREHOD' });
});

test('odobritev prekrivajočega zahtevka vrne 409, zahtevek ostane "zahtevana"', async () => {
  const opremaId = await ustvariOpremo();
  const prvi = await oddajZahtevek(CLAN, { opremaId, od: cez(1), do: cez(3), namen: 'Prvi zahtevek' });
  const drugi = await oddajZahtevek(MAJA, { opremaId, od: cez(2), do: cez(4), namen: 'Drugi zahtevek' });
  await odobri(prvi.id, SKRBNIK);

  await assert.rejects(odobri(drugi.id, SKRBNIK), { status: 409, koda: 'TERMIN_ZASEDEN' });
  const majine = await mojeIzposoje(MAJA);
  assert.strictEqual(majine.find((i) => i.id === drugi.id).status, 'zahtevana');
});

test('pri hkratni odobritvi dveh prekrivajočih zahtevkov uspe natanko ena', async () => {
  const opremaId = await ustvariOpremo();
  const prvi = await oddajZahtevek(CLAN, { opremaId, od: cez(1), do: cez(3), namen: 'Prvi zahtevek' });
  const drugi = await oddajZahtevek(MAJA, { opremaId, od: cez(2), do: cez(4), namen: 'Drugi zahtevek' });

  // Najprej odpremo dve povezavi, da se odobritvi res izvajata hkrati
  const povezavi = await Promise.all([pool.connect(), pool.connect()]);
  povezavi.forEach((p) => p.release());

  // Obe odobritvi sprožimo hkrati in počakamo na obe
  const izida = await Promise.allSettled([odobri(prvi.id, SKRBNIK), odobri(drugi.id, SKRBNIK)]);

  const uspeli = izida.filter((i) => i.status === 'fulfilled');
  const zavrnjeni = izida.filter((i) => i.status === 'rejected');
  assert.strictEqual(uspeli.length, 1);
  assert.strictEqual(zavrnjeni.length, 1);
  assert.strictEqual(zavrnjeni[0].reason.koda, 'TERMIN_ZASEDEN');
});

test('zavrnitev shrani razlog, ki ga član vidi med svojimi izposojami', async () => {
  const opremaId = await ustvariOpremo();
  const zahtevek = await oddajZahtevek(CLAN, { opremaId, od: cez(1), do: cez(2), namen: 'Testni namen' });
  await zavrni(zahtevek.id, SKRBNIK, 'Oprema je rezervirana za dogodek');

  const moje = await mojeIzposoje(CLAN);
  const izposoja = moje.find((i) => i.id === zahtevek.id);
  assert.strictEqual(izposoja.status, 'zavrnjena');
  assert.strictEqual(izposoja.razlog_zavrnitve, 'Oprema je rezervirana za dogodek');
});