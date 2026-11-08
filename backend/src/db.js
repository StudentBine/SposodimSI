import pg from 'pg';

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});
// Izvede funkcijo v transakciji: ob napaki se vse spremembe razveljavijo
export async function vTransakciji(funkcija) {
  const odjemalec = await pool.connect();
  try {
    await odjemalec.query('BEGIN');
    const rezultat = await funkcija(odjemalec);
    await odjemalec.query('COMMIT');
    return rezultat;
  } catch (napaka) {
    await odjemalec.query('ROLLBACK');
    throw napaka;
  } finally {
    odjemalec.release();
  }
}