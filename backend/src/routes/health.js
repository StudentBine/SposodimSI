import { Router } from 'express';
import { preveriBazo } from '../services/health.js';

const router = Router();

router.get('/', async (req, res) => {
  const casBaze = await preveriBazo();
  res.json({ status: 'ok', casBaze });
});

export default router;