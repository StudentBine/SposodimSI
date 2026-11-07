import { pool } from '../db.js';

export async function preveriBazo() {
  const rezultat = await pool.query('SELECT now() AS cas');
  return rezultat.rows[0].cas;
}