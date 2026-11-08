import { pool } from '../db.js';
import { ApiNapaka } from '../napake.js';

// Datum v berljivi obliki za sporočila, npr. "8. 11. 2026, 10:00"
function lepDatum(datum) {
  return new Date(datum).toLocaleString('sl-SI', {
    timeZone: 'Europe/Ljubljana',
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

// Vrže 409, če se termin prekriva z odobreno ali izdano izposojo iste opreme.
// "db" je lahko pool ali odjemalec znotraj transakcije.
export async function preveriPrekrivanje(db, opremaId, od, doCas, brezIzposojeId = null) {
  const rezultat = await db.query(
    `SELECT termin_od, termin_do FROM izposoja
     WHERE oprema_id = $1
       AND status IN ('odobrena', 'izdana')
       AND termin_od < $3
       -- izdana oprema je zasedena, dokler ni vrnjena, tudi po roku
       AND (termin_do > $2 OR status = 'izdana')
       AND ($4::int IS NULL OR id <> $4)
     ORDER BY termin_od
     LIMIT 1`,
    [opremaId, od, doCas, brezIzposojeId]
  );

  const zasedena = rezultat.rows[0];
  if (zasedena) {
    throw new ApiNapaka(
      409,
      'TERMIN_ZASEDEN',
      `Oprema je v tem terminu že zasedena (od ${lepDatum(zasedena.termin_od)} do ${lepDatum(zasedena.termin_do)})`
    );
  }
}

// US-02 in US-03: član odda zahtevek, ki dobi stanje "zahtevana"
export async function oddajZahtevek(clanId, { opremaId, od, do: doCas, namen }) {
  const oprema = await pool.query('SELECT status FROM oprema WHERE id = $1', [opremaId]);
  if (oprema.rows.length === 0) {
    throw new ApiNapaka(404, 'NI_NAJDENO', 'Oprema ne obstaja');
  }
  if (oprema.rows[0].status !== 'na_voljo') {
    throw new ApiNapaka(409, 'OPREMA_NI_IZPOSODLJIVA', 'Oprema trenutno ni izposodljiva');
  }

  // Čakajoči zahtevki ne povzročijo konflikta, zato zaklepanje tukaj ni potrebno;
  // prekrivanje se ponovno preveri ob odobritvi.
  await preveriPrekrivanje(pool, opremaId, od, doCas);

  const rezultat = await pool.query(
    `INSERT INTO izposoja (clan_id, oprema_id, termin_od, termin_do, namen)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, oprema_id, termin_od, termin_do, namen, status, ustvarjena_ob`,
    [clanId, opremaId, od, doCas, namen]
  );
  return rezultat.rows[0];
}