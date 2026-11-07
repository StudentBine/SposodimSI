import { validationResult } from 'express-validator';
import { ApiNapaka } from '../napake.js';

// Postavi se za pravila express-validator; ob napaki vrne 400 s prvo napako
export function preveriVnos(req, res, next) {
  const napake = validationResult(req);
  if (!napake.isEmpty()) {
    throw new ApiNapaka(400, 'NEVELJAVEN_VNOS', napake.array()[0].msg);
  }
  next();
}