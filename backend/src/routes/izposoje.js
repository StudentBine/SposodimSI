import { Router } from 'express';
import { body, param, query, matchedData } from 'express-validator';
import {
  oddajZahtevek, seznamIzposoj, mojeIzposoje, odobri, zavrni, podrobnostiIzposoje, izdaj,
} from '../services/izposoje.js';
import { preveriVnos } from '../middleware/validacija.js';
import { zahtevajPrijavo, zahtevajVlogo } from '../middleware/avtentikacija.js';

const router = Router();
const SKRBNIK = zahtevajVlogo('skrbnik', 'admin');
const preveriId = param('id').isInt({ min: 1 }).toInt().withMessage('Neveljaven id');

// Pravila za oceno in opombo, enaka pri izdaji in vrnitvi
const preveriZapis = [
  body('ocena')
    .isIn(['brez_poskodb', 'manjse_poskodbe', 'poskodovano'])
    .withMessage('Izberi oceno stanja'),
  body('opomba').optional({ values: 'falsy' }).isString().trim().isLength({ max: 500 })
    .withMessage('Opomba ima lahko največ 500 znakov'),
];

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

// GET /api/izposoje?status=zahtevana – seznam za skrbnika
router.get(
  '/',
  SKRBNIK,
  query('status')
    .isIn(['zahtevana', 'odobrena', 'zavrnjena', 'preklicana', 'izdana', 'vrnjena'])
    .withMessage('Neveljavno stanje'),
  preveriVnos,
  async (req, res) => {
    res.json(await seznamIzposoj(matchedData(req).status));
  }
);

// GET /api/izposoje/moje – izposoje prijavljenega uporabnika
router.get('/moje', zahtevajPrijavo, async (req, res) => {
  res.json(await mojeIzposoje(req.session.uporabnik.id));
});

// POST /api/izposoje/:id/odobritev
router.post('/:id/odobritev', SKRBNIK, preveriId, preveriVnos, async (req, res) => {
  res.json(await odobri(matchedData(req).id, req.session.uporabnik.id));
});

// POST /api/izposoje/:id/zavrnitev  { razlog }
router.post(
  '/:id/zavrnitev',
  SKRBNIK,
  preveriId,
  body('razlog').isString().trim().isLength({ min: 1, max: 500 }).withMessage('Vnesi razlog zavrnitve (1–500 znakov)'),
  preveriVnos,
  async (req, res) => {
    const { id, razlog } = matchedData(req);
    res.json(await zavrni(id, req.session.uporabnik.id, razlog));
  }
);

// GET /api/izposoje/:id – podrobnosti z zapisi stanja
router.get('/:id', SKRBNIK, preveriId, preveriVnos, async (req, res) => {
  res.json(await podrobnostiIzposoje(matchedData(req).id));
});

// POST /api/izposoje/:id/izdaja  { ocena, opomba }
router.post('/:id/izdaja', SKRBNIK, preveriId, preveriZapis, preveriVnos, async (req, res) => {
  const { id, ocena, opomba } = matchedData(req);
  res.json(await izdaj(id, req.session.uporabnik.id, { ocena, opomba }));
});

export default router;