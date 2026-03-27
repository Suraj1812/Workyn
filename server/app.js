import cors from 'cors';
import cookieParser from 'cookie-parser';
import express from 'express';
import dotenv from 'dotenv';
import compression from 'compression';
import helmet from 'helmet';
import morgan from 'morgan';

import authRoutes from './routes/authRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import billingRoutes from './routes/billingRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import crmRoutes from './routes/crmRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import notificationsRoutes from './routes/notificationsRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import userRoutes from './routes/userRoutes.js';
import workspaceRoutes from './routes/workspaceRoutes.js';
import { handleBillingWebhook } from './controllers/billingController.js';
import { attachRequestContext } from './middleware/requestContext.js';
import { apiLimiter } from './middleware/rateLimitMiddleware.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import { sanitizeRequestPayload } from './middleware/validateMiddleware.js';
import { logger, morganStream } from './services/logger.js';

dotenv.config();

const app = express();
const allowedOrigins = (
  process.env.CLIENT_URLS ||
  process.env.CLIENT_URL ||
  'http://localhost:5173'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable('x-powered-by');
app.use(attachRequestContext);
app.post('/api/billing/webhook', express.raw({ type: 'application/json' }), handleBillingWebhook);
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  }),
);
app.use(compression());
app.use(morgan('combined', { stream: morganStream }));

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      logger.warn('Blocked CORS origin', { origin });
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(sanitizeRequestPayload);
app.use('/api', apiLimiter);

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Workyn API is healthy.' });
});

app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/crm', crmRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/workspace', workspaceRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/uploads', uploadRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
