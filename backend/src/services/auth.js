import bcrypt from 'bcrypt';
import { pool } from '../db.js';
import { ApiNapaka } from '../napake.js';

// Preveri e-pošto in geslo; vrne podatke uporabnika brez gesla
export async function prijava(email, geslo) {
  const rezultat = await pool.query(
    'SELECT id, email, ime, priimek, geslo_hash, vloga, aktiven FROM uporabnik WHERE email = $1',
    [email.toLowerCase()]
  );
  const uporabnik = rezultat.rows[0];

  // Enako sporočilo za napačen e-naslov in geslo, da ne izdamo, kateri računi obstajajo
  if (!uporabnik || !(await bcrypt.compare(geslo, uporabnik.geslo_hash))) {
    throw new ApiNapaka(401, 'NAPACNI_PODATKI', 'Napačen e-naslov ali geslo');
  }

  if (!uporabnik.aktiven) {
    throw new ApiNapaka(403, 'RACUN_BLOKIRAN', 'Račun je blokiran');
  }

  return {
    id: uporabnik.id,
    email: uporabnik.email,
    ime: uporabnik.ime,
    priimek: uporabnik.priimek,
    vloga: uporabnik.vloga,
  };
}