import { pool } from '../db.js';

const NA_STRAN = 20;

// Katalog opreme z iskanjem, filtri in paginacijo.
// Če termin (od, do) ni podan, se zasedenost preverja za trenutni čas.
export async function katalog({ iskanje, kategorija, od, do: doCas, samoProsto, stran }) {
  const rezultat = await pool.query(
    `WITH katalog AS (
       SELECT o.id, o.naziv, o.inventarna_st, o.status, k.naziv AS kategorija,
              EXISTS (
                SELECT 1 FROM izposoja i
                WHERE i.oprema_id = o.id
                  AND i.status IN ('odobrena', 'izdana')
                  AND i.termin_od < COALESCE($3::timestamptz, now())
                  -- izdana oprema je zasedena, dokler ni vrnjena, tudi po roku
                  AND (i.termin_do > COALESCE($2::timestamptz, now()) OR i.status = 'izdana')
              ) AS zaseden
       FROM oprema o
       JOIN kategorija k ON k.id = o.kategorija_id
       WHERE o.status <> 'arhivirana'
         AND ($1::text IS NULL OR o.naziv ILIKE '%' || $1 || '%')
         AND ($4::int IS NULL OR o.kategorija_id = $4)
     )
     SELECT *, count(*) OVER () AS skupaj
     FROM katalog
     WHERE NOT $5 OR (status = 'na_voljo' AND NOT zaseden)
     ORDER BY naziv
     LIMIT ${NA_STRAN} OFFSET $6`,
    [iskanje || null, od || null, doCas || null, kategorija || null, samoProsto, (stran - 1) * NA_STRAN]
  );

  return {
    zadetki: rezultat.rows.map(({ skupaj, ...oprema }) => oprema),
    skupaj: Number(rezultat.rows[0]?.skupaj || 0),
    stran,
    naStran: NA_STRAN,
  };
}

export async function seznamKategorij() {
  const rezultat = await pool.query('SELECT id, naziv FROM kategorija ORDER BY naziv');
  return rezultat.rows;
}