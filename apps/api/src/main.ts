import express from 'express';
import dotenv from 'dotenv';
import { LoggingInterceptor, AuditLogInterceptor } from './common/interceptors/logging.interceptor';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { authRouter } from './modules/auth/auth.router';
import { postsRouter } from './modules/posts/posts.router';
import { documentsRouter } from './modules/documents/documents.router';
import { submissionsRouter } from './modules/submissions/submissions.router';
import {
  usersRouter,
  mediaRouter,
  contactsRouter,
  inquiriesRouter,
  utilitiesRouter,
  notificationsRouter,
  analyticsRouter,
  auditLogsRouter,
} from './modules/system-modules.router';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Global Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(LoggingInterceptor);
app.use(AuditLogInterceptor);

// CORS Headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'MBS Core API Server',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 12 Core Business Modules Routing
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/posts', postsRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/submissions', submissionsRouter);
app.use('/api/media', mediaRouter);
app.use('/api/contacts', contactsRouter);
app.use('/api/inquiries', inquiriesRouter);
app.use('/api/utilities', utilitiesRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/audit-logs', auditLogsRouter);

// Global Error Exception Handling
app.use(GlobalExceptionFilter);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 MBS Core Backend API Server running on port ${PORT}`);
    console.log(`👉 Health check: http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
  });
}

export default app;
