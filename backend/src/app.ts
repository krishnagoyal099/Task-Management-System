import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import config from './config';
import { apiLimiter } from './middleware/rateLimiter';
import { globalErrorHandler, notFoundHandler } from './middleware/errorHandler';
import { setupSwagger } from './config/swagger';
import v1Routes from './routes';
import logger from './utils/logger';

const app = express();

// ─── Security ──────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  }),
);

// ─── Parsing ───────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Logging ───────────────────────────────────────────
if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// ─── Rate Limiting ─────────────────────────────────────
app.use('/api/', apiLimiter);

// ─── API Documentation ────────────────────────────────
setupSwagger(app);

// ─── Health Check ──────────────────────────────────────
app.get('/api/v1/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
    },
  });
});

// ─── API Routes ────────────────────────────────────────
app.use('/api/v1', v1Routes);

// ─── 404 Handler ───────────────────────────────────────
app.use(notFoundHandler);

// ─── Global Error Handler ──────────────────────────────
app.use(globalErrorHandler);

export default app;