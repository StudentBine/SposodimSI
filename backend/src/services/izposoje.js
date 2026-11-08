import { pool, vTransakciji } from '../db.js';
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

// Seznam izposoj v izbranem stanju za skrbnika, od najstarejšega zahtevka
export async function seznamIzposoj(status) {
  const rezultat = await pool.query(
    `SELECT i.id, i.termin_od, i.termin_do, i.namen, i.status, i.ustvarjena_ob,
            u.ime || ' ' || u.priimek AS clan,
            o.naziv AS oprema, o.inventarna_st
     FROM izposoja i
     JOIN uporabnik u ON u.id = i.clan_id
     JOIN oprema o ON o.id = i.oprema_id
     WHERE i.status = $1
     ORDER BY i.ustvarjena_ob`,
    [status]
  );
  return rezultat.rows;
}

// Izposoje prijavljenega člana, najnovejše najprej
export async function mojeIzposoje(clanId) {
  const rezultat = await pool.query(
    `SELECT i.id, i.termin_od, i.termin_do, i.namen, i.status, i.razlog_zavrnitve, i.ustvarjena_ob,
            o.naziv AS oprema, o.inventarna_st
     FROM izposoja i
     JOIN oprema o ON o.id = i.oprema_id
     WHERE i.clan_id = $1
     ORDER BY i.ustvarjena_ob DESC`,
    [clanId]
  );
  return rezultat.rows;
}

// Prebere izposojo in jo zaklene do konca transakcije (FOR UPDATE).
// Vrže 404, če ne obstaja, in 409, če ni v pričakovanem stanju.
async function zakleniIzposojo(odjemalec, id, pricakovanoStanje) {
  const rezultat = await odjemalec.query('SELECT * FROM izposoja WHERE id = $1 FOR UPDATE', [id]);
  const izposoja = rezultat.rows[0];
  if (!izposoja) {
    throw new ApiNapaka(404, 'NI_NAJDENO', 'Izposoja ne obstaja');
  }
  if (izposoja.status !== pricakovanoStanje) {
    throw new ApiNapaka(
      409,
      'NEDOVOLJEN_PREHOD',
      `Izposoja je v stanju "${izposoja.status}", pričakovano je "${pricakovanoStanje}"`
    );
  }
  return izposoja;
}

// US-04: odobritev. Prekrivanje se preveri znova (US-03, kriterij 3).
export async function odobri(id, skrbnikId) {
  return vTransakciji(async (odjemalec) => {
    const izposoja = await zakleniIzposojo(odjemalec, id, 'zahtevana');

    // Zaklep opreme poskrbi, da dve hkratni odobritvi iste opreme potekata ena za drugo,
    // zato druga vidi prvo in vrne 409 (US-03, kriterij 4).
    const oprema = await odjemalec.query('SELECT status FROM oprema WHERE id = $1 FOR UPDATE', [izposoja.oprema_id]);
    if (oprema.rows[0].status !== 'na_voljo') {
      throw new ApiNapaka(409, 'OPREMA_NI_IZPOSODLJIVA', 'Oprema trenutno ni izposodljiva');
    }

    await preveriPrekrivanje(odjemalec, izposoja.oprema_id, izposoja.termin_od, izposoja.termin_do, izposoja.id);

    const rezultat = await odjemalec.query(
      `UPDATE izposoja SET status = 'odobrena', odobril_id = $2
       WHERE id = $1 RETURNING id, status, odobril_id`,
      [id, skrbnikId]
    );
    return rezultat.rows[0];
  });
}

// US-04: zavrnitev z obveznim razlogom
export async function zavrni(id, skrbnikId, razlog) {
  return vTransakciji(async (odjemalec) => {
    await zakleniIzposojo(odjemalec, id, 'zahtevana');
    const rezultat = await odjemalec.query(
      `UPDATE izposoja SET status = 'zavrnjena', odobril_id = $2, razlog_zavrnitve = $3
       WHERE id = $1 RETURNING id, status, odobril_id, razlog_zavrnitve`,
      [id, skrbnikId, razlog]
    );
    return rezultat.rows[0];
  });
}

// Podrobnosti ene izposoje z zapisi stanja (za obrazca izdaje in vrnitve)
export async function podrobnostiIzposoje(id) {
  const rezultat = await pool.query(
    `SELECT i.id, i.termin_od, i.termin_do, i.namen, i.status, i.izdana_ob, i.vrnjena_ob,
            u.ime || ' ' || u.priimek AS clan,
            o.naziv AS oprema, o.inventarna_st, o.status AS status_opreme
     FROM izposoja i
     JOIN uporabnik u ON u.id = i.clan_id
     JOIN oprema o ON o.id = i.oprema_id
     WHERE i.id = $1`,
    [id]
  );
  const izposoja = rezultat.rows[0];
  if (!izposoja) {
    throw new ApiNapaka(404, 'NI_NAJDENO', 'Izposoja ne obstaja');
  }

  const zapisi = await pool.query(
    `SELECT z.tip, z.ocena, z.opomba, z.zapisano_ob, u.ime || ' ' || u.priimek AS zapisal
     FROM zapis_stanja z
     JOIN uporabnik u ON u.id = z.zapisal_id
     WHERE z.izposoja_id = $1
     ORDER BY z.zapisano_ob`,
    [id]
  );
  izposoja.zapisi = zapisi.rows;
  return izposoja;
}

// US-05: izdaja opreme z zapisom stanja
export async function izdaj(id, skrbnikId, { ocena, opomba }) {
  return vTransakciji(async (odjemalec) => {
    const izposoja = await zakleniIzposojo(odjemalec, id, 'odobrena');

    const oprema = await odjemalec.query('SELECT status FROM oprema WHERE id = $1', [izposoja.oprema_id]);
    if (oprema.rows[0].status !== 'na_voljo') {
      throw new ApiNapaka(409, 'OPREMA_NI_IZPOSODLJIVA', 'Oprema trenutno ni izposodljiva');
    }

    await odjemalec.query(
      `INSERT INTO zapis_stanja (izposoja_id, zapisal_id, tip, ocena, opomba)
       VALUES ($1, $2, 'izdaja', $3, $4)`,
      [id, skrbnikId, ocena, opomba || null]
    );
    const rezultat = await odjemalec.query(
      `UPDATE izposoja SET status = 'izdana', izdana_ob = now()
       WHERE id = $1 RETURNING id, status, izdana_ob`,
      [id]
    );
    return rezultat.rows[0];
  });
}