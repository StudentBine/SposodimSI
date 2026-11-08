import { Router } from 'express';
import { body, matchedData } from 'express-validator';
import { oddajZahtevek } from '../services/izposoje.js';
import { preveriVnos } from '../middleware/validacija.js';
import { zahtevajPrijavo } from '../middleware/avtentikacija.js';

const router = Router();

// POST /api/izposoje  { opremaId, od, do, namen } – oddaja zahtevka
router.post(
  '/',
  zahtevajPrijavo,
  body('opremaId').isInt({ min: 1 }).toInt().withMessage('Izberi opremo'),
  body('od')
    .isISO8601().withMessage('Vnesi čas Od')
    // minuta tolerance, ker uporabnik obrazec izpolnjuje nekaj časa
    .custom((od) => new Date(od) >= new Date(Date.now() - 60 * 1000))
    .withMessage('Termin Od ne sme biti v preteklosti'),
  body('do')
    .isISO8601().withMessage('Vnesi čas Do')
    .custom((doCas, { req }) => new Date(doCas) > new Date(req.body.od))
    .withMessage('Termin Do mora biti za terminom Od'),
  body('namen').isString().trim().isLength({ min: 5 }).withMessage('Namen mora imeti vsaj 5 znakov'),
  preveriVnos,
  async (req, res) => {
    const izposoja = await oddajZahtevek(req.session.uporabnik.id, matchedData(req));
    res.status(201).json(izposoja);
  }
);

export default router;