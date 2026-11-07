import { test } from 'node:test';
import assert from 'node:assert';
import { zahtevajPrijavo, zahtevajVlogo } from '../src/middleware/avtentikacija.js';

// Ponaredek zahteve z (ali brez) prijavljenim uporabnikom
function zahteva(uporabnik) {
  return { session: { uporabnik } };
}

test('brez prijave vrne 401', () => {
  assert.throws(() => zahtevajPrijavo(zahteva(undefined), {}, () => {}), { status: 401 });
});

test('prijavljen uporabnik gre naprej', () => {
  let naprej = false;
  zahtevajPrijavo(zahteva({ vloga: 'clan' }), {}, () => { naprej = true; });
  assert.ok(naprej);
});

test('član nima dostopa do poti skrbnika (403)', () => {
  const preveri = zahtevajVlogo('skrbnik', 'admin');
  assert.throws(() => preveri(zahteva({ vloga: 'clan' }), {}, () => {}), { status: 403 });
});

test('admin ima dostop do poti skrbnika', () => {
  const preveri = zahtevajVlogo('skrbnik', 'admin');
  let naprej = false;
  preveri(zahteva({ vloga: 'admin' }), {}, () => { naprej = true; });
  assert.ok(naprej);
});