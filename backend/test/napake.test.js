import { test } from 'node:test';
import assert from 'node:assert';
import app from '../src/app.js';

// Zažene app na naključnih vratih, pošlje zahtevo in vrne odgovor
async function poslji(pot, moznosti) {
  const streznik = app.listen(0);
  const port = streznik.address().port;
  try {
    return await fetch(`http://localhost:${port}${pot}`, moznosti);
  } finally {
    streznik.close();
  }
}

test('neobstoječa pot vrne 404 v enotnem formatu', async () => {
  const odgovor = await poslji('/api/ne-obstaja');
  assert.strictEqual(odgovor.status, 404);
  const telo = await odgovor.json();
  assert.strictEqual(telo.napaka.koda, 'NI_NAJDENO');
});

test('neveljaven JSON vrne 400', async () => {
  const odgovor = await poslji('/api/zdravje', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{ to ni json',
  });
  assert.strictEqual(odgovor.status, 400);
  const telo = await odgovor.json();
  assert.strictEqual(telo.napaka.koda, 'NEVELJAVEN_JSON');
});