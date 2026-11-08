import { pool } from '../src/db.js';

const ustvarjeneKategorije = [];

export const DAN = 24 * 60 * 60 * 1000;

// Čas čez "dni" dni kot ISO niz, npr. cez(1) = jutri ob tej uri
export function cez(dni) {
  return new Date(Date.now() + dni * DAN).toISOString();
}

export async function ustvariOpremo(status = 'na_voljo') {
  const oznaka = 'TEST-' + Math.random().toString(36).slice(2, 10);
  const kategorija = await pool.query(
    'INSERT INTO kategorija (naziv) VALUES ($1) RETURNING id',
    [oznaka]
  );
  ustvarjeneKategorije.push(kategorija.rows[0].id);

  const oprema = await pool.query(
    'INSERT INTO oprema (kategorija_id, naziv, inventarna_st, status) VALUES ($1, $2, $2, $3) RETURNING id',
    [kategorija.rows[0].id, oznaka, status]
  );
  return oprema.rows[0].id;
}

// Pobriše vse, kar so ustvarili testi v tej datoteki, in zapre bazen povezav
export async function pocisti() {
  const odjemalec = await pool.connect();
  // Zapisi stanja so zaščiteni s sprožilcem. "replica" izklopi sprožilce samo za to
  // povezavo (le za čiščenje testnih podatkov; uporabnik baze v Dockerju to sme).
  await odjemalec.query("SET session_replication_role = 'replica'");
  for (const id of ustvarjeneKategorije) {
    await odjemalec.query(
      `DELETE FROM zapis_stanja WHERE izposoja_id IN (
         SELECT i.id FROM izposoja i JOIN oprema o ON o.id = i.oprema_id WHERE o.kategorija_id = $1)`,
      [id]
    );
    await odjemalec.query(
      'DELETE FROM izposoja WHERE oprema_id IN (SELECT id FROM oprema WHERE kategorija_id = $1)',
      [id]
    );
    await odjemalec.query('DELETE FROM oprema WHERE kategorija_id = $1', [id]);
    await odjemalec.query('DELETE FROM kategorija WHERE id = $1', [id]);
  }
  odjemalec.release();
  await pool.end();
}