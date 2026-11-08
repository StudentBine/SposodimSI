import express from 'express';
import helmet from 'helmet';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { pool } from './db.js';
import healthRouter from './routes/health.js';
import authRouter from './routes/auth.js';
import opremaRouter from './routes/oprema.js';
import izposojeRouter from './routes/izposoje.js';
import { niNajdeno, obdelajNapako } from './napake.js';

const app = express();
const PgStore = connectPgSimple(session);

app.use(helmet());
app.use(express.json());

app.use(
  session({
    store: new PgStore({ pool, createTableIfMissing: true }),
    secret: process.env.SESSION_SECRET || 'samo-za-razvoj',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 8, // 8 ur
    },
  })
);

app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/oprema', opremaRouter);
app.use('/api/izposoje', izposojeRouter);

app.use(niNajdeno);
app.use(obdelajNapako);

export default app;