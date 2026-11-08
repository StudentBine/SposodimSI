import 'dotenv/config'; // mora biti prvi, preden se ustvari bazen povezav
import { test, after } from 'node:test';
import assert from 'node:assert';
import { oddajZahtevek, odobri, izdaj, vrni, podrobnostiIzposoje, mojeIzposoje } from '../src/services/izposoje.js';
import { ustvariOpremo, pocisti, cez } from './pomocnik.js';

after(pocisti);

const SKRBNIK = 2;
const CLAN = 3;

// Ustvari izdano izposojo z izbrano oceno ob izdaji
async function izdanaIzposoja(ocenaObIzdaji) {
  const opremaId = await ustvariOpremo();
  const zahtevek = await oddajZahtevek(CLAN, { opremaId, od: cez(1), do: cez(2), namen: 'Testni namen' });
  await odobri(zahtevek.id, SKRBNIK);
  await izdaj(zahtevek.id, SKRBNIK, { ocena: ocenaObIzdaji });
  return zahtevek.id;
}

test('vrnitev ustvari zapis "vrnitev" in prestavi izposojo v "vrnjena"', async () => {
  const id = await izdanaIzposoja('brez_poskodb');
  const vrnjena = await vrni(id, SKRBNIK, { ocena: 'brez_poskodb' });
  assert.strictEqual(vrnjena.status, 'vrnjena');
  assert.ok(vrnjena.vrnjena_ob);
  assert.strictEqual(vrnjena.poskodba, false);

  const podrobnosti = await podrobnostiIzposoje(id);
  assert.deepStrictEqual(podrobnosti.zapisi.map((z) => z.tip), ['izdaja', 'vrnitev']);
});

test('slabša ocena ob vrnitvi označi poškodbo, tudi med izposojami člana', async () => {
  const id = await izdanaIzposoja('brez_poskodb');
  const vrnjena = await vrni(id, SKRBNIK, { ocena: 'manjse_poskodbe', opomba: 'Opraskano ohišje' });
  assert.strictEqual(vrnjena.poskodba, true);

  const moje = await mojeIzposoje(CLAN);
  assert.strictEqual(moje.find((i) => i.id === id).poskodba, true);
});

test('enaka ali boljša ocena ni poškodba', async () => {
  const id = await izdanaIzposoja('manjse_poskodbe');
  const vrnjena = await vrni(id, SKRBNIK, { ocena: 'brez_poskodb' });
  assert.strictEqual(vrnjena.poskodba, false);
});

test('vrnitev neizdane izposoje vrne 409', async () => {
  const opremaId = await ustvariOpremo();
  const zahtevek = await oddajZahtevek(CLAN, { opremaId, od: cez(1), do: cez(2), namen: 'Testni namen' });
  await odobri(zahtevek.id, SKRBNIK);
  await assert.rejects(vrni(zahtevek.id, SKRBNIK, { ocena: 'brez_poskodb' }), { status: 409 });
});