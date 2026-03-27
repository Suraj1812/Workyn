import cors from 'cors';
import cookieParser from 'cookie-parser';
import express from 'express';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import crmRoutes from './routes/crmRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  }),
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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

app.use(notFound);
app.use(errorHandler);

export default app;
