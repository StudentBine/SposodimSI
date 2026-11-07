import express from 'express';
import helmet from 'helmet';
import zdravjeRouter from './routes/health.js';
import { niNajdeno, obdelajNapako } from './napake.js';

const app = express();

app.use(helmet());
app.use(express.json());

app.use('/api/health', zdravjeRouter);

app.use(niNajdeno);
app.use(obdelajNapako);

export default app;