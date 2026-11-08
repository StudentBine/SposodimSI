import 'dotenv/config'; // mora biti prvi, preden se ustvari bazen povezav
import { test, after } from 'node:test';
import assert from 'node:assert';
import { zamude } from '../src/services/izposoje.js';
import { pool } from '../src/db.js';
import { ustvariOpremo, pocisti, cez } from './pomocnik.js';

after(pocisti);

const CLAN = 3;

// Izdano izposojo vpišemo neposredno v bazo, ker oddaja zahtevka v preteklosti ni dovoljena
async function izdanaIzposoja(od, doCas) {
  const opremaId = await ustvariOpremo();
  const rezultat = await pool.query(
    `INSERT INTO izposoja (clan_id, oprema_id, odobril_id, termin_od, termin_do, namen, status, izdana_ob)
     VALUES ($1, $2, 2, $3, $4, 'Testni namen', 'izdana', $3) RETURNING id`,
    [CLAN, opremaId, od, doCas]
  );
  return rezultat.rows[0].id;
}

test('zamujene so samo izdane izposoje po roku, razvrščene od največje zamude', async () => {
  const zamudaEnDan = await izdanaIzposoja(cez(-3), cez(-0.5));
  const zamudaPetDni = await izdanaIzposoja(cez(-10), cez(-4.5));
  const vRoku = await izdanaIzposoja(cez(-1), cez(1));

  const seznam = await zamude();
  const idji = seznam.map((z) => z.id);

  assert.ok(!idji.includes(vRoku));
  assert.ok(idji.indexOf(zamudaPetDni) < idji.indexOf(zamudaEnDan));

  const petDni = seznam.find((z) => z.id === zamudaPetDni);
  assert.strictEqual(petDni.dni_zamude, 5);
  assert.strictEqual(petDni.email, 'clan@sposodimsi.si');
});