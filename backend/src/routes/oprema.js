import { Router } from 'express';
import { query, matchedData } from 'express-validator';
import { katalog, seznamKategorij } from '../services/oprema.js';
import { preveriVnos } from '../middleware/validacija.js';
import { zahtevajPrijavo } from '../middleware/avtentikacija.js';

const router = Router();

// GET /api/oprema?iskanje=&kategorija=&od=&do=&samoProsto=true&stran=1
router.get(
  '/',
  zahtevajPrijavo,
  query('iskanje').optional({ values: 'falsy' }).trim().isLength({ min: 3 }).withMessage('Vnesi vsaj 3 znake'),
  query('kategorija').optional({ values: 'falsy' }).isInt({ min: 1 }).toInt(),
  query('od')
    .optional({ values: 'falsy' })
    .isISO8601().withMessage('Neveljaven čas Od')
    .custom((od, { req }) => Boolean(req.query.do)).withMessage('Vnesi tudi čas Do'),
  query('do')
    .optional({ values: 'falsy' })
    .isISO8601().withMessage('Neveljaven čas Do')
    .custom((doCas, { req }) => req.query.od && new Date(doCas) > new Date(req.query.od))
    .withMessage('Čas Do mora biti za časom Od'),
  query('samoProsto').optional().isBoolean().toBoolean(),
  query('stran').optional().isInt({ min: 1 }).toInt(),
  preveriVnos,
  async (req, res) => {
    // matchedData vrne že preverjene in pretvorjene vrednosti (npr. stran kot število)
    const { iskanje, kategorija, od, do: doCas, samoProsto, stran } = matchedData(req);
    res.json(await katalog({
      iskanje,
      kategorija,
      od,
      do: doCas,
      samoProsto: samoProsto || false,
      stran: stran || 1,
    }));
  }
);

// GET /api/oprema/kategorije
router.get('/kategorije', zahtevajPrijavo, async (req, res) => {
  res.json(await seznamKategorij());
});

export default router;