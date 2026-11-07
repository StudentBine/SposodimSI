import { ApiNapaka } from '../napake.js';

// Spusti naprej samo prijavljene uporabnike
export function zahtevajPrijavo(req, res, next) {
  if (!req.session.uporabnik) {
    throw new ApiNapaka(401, 'NI_PRIJAVE', 'Za to dejanje se moraš prijaviti');
  }
  next();
}

// Spusti naprej samo uporabnike z eno od naštetih vlog, npr. zahtevajVlogo('skrbnik', 'admin')
export function zahtevajVlogo(...vloge) {
  return (req, res, next) => {
    if (!req.session.uporabnik) {
      throw new ApiNapaka(401, 'NI_PRIJAVE', 'Za to dejanje se moraš prijaviti');
    }
    if (!vloge.includes(req.session.uporabnik.vloga)) {
      throw new ApiNapaka(403, 'NI_DOVOLJENJA', 'Za to dejanje nimaš pravic');
    }
    next();
  };
}