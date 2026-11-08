import 'dotenv/config';
import { test, after } from 'node:test';
import assert from 'node:assert';
import { katalog } from '../src/services/oprema.js';
import { pool } from '../src/db.js';

after(() => pool.end());

const privzeto = { samoProsto: false, stran: 1 };

function poisci(rezultat, inventarna) {
  return rezultat.zadetki.find((o) => o.inventarna_st === inventarna);
}

test('iskanje po nazivu ne razlikuje velikih in malih črk', async () => {
  const r = await katalog({ ...privzeto, iskanje: 'ARDU' });
  assert.deepStrictEqual(r.zadetki.map((o) => o.inventarna_st), ['INV-010']);
});

test('arhivirana oprema ni v katalogu', async () => {
  const r = await katalog(privzeto);
  assert.strictEqual(poisci(r, 'INV-031'), undefined);
});

test('izdana oprema po roku je še vedno zasedena', async () => {
  const r = await katalog(privzeto);
  assert.strictEqual(poisci(r, 'INV-020').zaseden, true);
});

test('čakajoč zahtevek ne zasede opreme', async () => {
  const r = await katalog(privzeto);
  assert.strictEqual(poisci(r, 'INV-001').zaseden, false);
});

test('odobrena izposoja zasede opremo samo v svojem terminu', async () => {
  const jutri = Date.now() + 24 * 60 * 60 * 1000;
  const vTerminu = await katalog({
    ...privzeto,
    od: new Date(jutri + 60 * 60 * 1000).toISOString(),
    do: new Date(jutri + 2 * 60 * 60 * 1000).toISOString(),
  });
  assert.strictEqual(poisci(vTerminu, 'INV-002').zaseden, true);

  const cezTeden = await katalog({
    ...privzeto,
    od: new Date(jutri + 7 * 24 * 60 * 60 * 1000).toISOString(),
    do: new Date(jutri + 8 * 24 * 60 * 60 * 1000).toISOString(),
  });
  assert.strictEqual(poisci(cezTeden, 'INV-002').zaseden, false);
});

test('samo prosto skrije zasedeno in neizposodljivo opremo', async () => {
  const r = await katalog({ ...privzeto, samoProsto: true });
  assert.strictEqual(poisci(r, 'INV-020'), undefined); // zasedena
  assert.strictEqual(poisci(r, 'INV-003'), undefined); // v popravilu
  assert.ok(poisci(r, 'INV-001'));
});

test('filter kategorije in število zadetkov', async () => {
  const r = await katalog({ ...privzeto, kategorija: 1 });
  assert.strictEqual(r.skupaj, 3); // Kamere: Canon, Sony, GoPro
  assert.ok(r.zadetki.every((o) => o.kategorija === 'Kamere'));
});