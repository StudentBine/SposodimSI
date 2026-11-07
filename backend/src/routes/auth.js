import { Router } from 'express';
import { body } from 'express-validator';
import { prijava } from '../services/auth.js';
import { preveriVnos } from '../middleware/validacija.js';
import { zahtevajPrijavo } from '../middleware/avtentikacija.js';

const router = Router();

// POST /api/auth/prijava  { email, geslo }
router.post(
  '/prijava',
  body('email').isEmail().withMessage('Vnesi veljaven e-naslov'),
  body('geslo').isString().notEmpty().withMessage('Vnesi geslo'),
  preveriVnos,
  async (req, res) => {
    const uporabnik = await prijava(req.body.email, req.body.geslo);

    // Nova seja ob prijavi (zaščita pred prevzemom seje)
    await new Promise((resolve, reject) => {
      req.session.regenerate((err) => (err ? reject(err) : resolve()));
    });
    req.session.uporabnik = uporabnik;

    res.json(uporabnik);
  }
);

// POST /api/auth/odjava
router.post('/odjava', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.status(204).end();
  });
});

// GET /api/auth/me – kdo je prijavljen
router.get('/me', zahtevajPrijavo, (req, res) => {
  res.json(req.session.uporabnik);
});

export default router;