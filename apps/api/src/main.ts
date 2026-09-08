import express from 'express';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables without overwriting explicitly set variables like NODE_ENV
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

import { LoggingInterceptor, AuditLogInterceptor } from './common/interceptors/logging.interceptor';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { authRouter } from './modules/auth/auth.router';
import { usersRouter } from './modules/users/users.router';
import { postsRouter } from './modules/posts/posts.router';
import { categoriesRouter } from './modules/categories/categories.router';
import { documentsRouter } from './modules/documents/documents.router';
import { submissionsRouter } from './modules/submissions/submissions.router';
import { inquiriesRouter } from './modules/inquiries/inquiries.router';
import { mediaRouter } from './modules/media/media.router';
import { utilitiesRouter } from './modules/utilities/utilities.router';
import { analyticsRouter, auditLogsRouter } from './modules/audit-logs/audit-logs.router';
import { rolesRouter } from './modules/roles/roles.router';
import { pagesRouter } from './modules/pages/pages.router';

const app = express();
const PORT = process.env.PORT || 4000;

// Body parser configuration
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

import { StorageService } from './common/services/storage.service';

// Serve uploaded static files from configured uploads directory
app.use('/uploads', express.static(StorageService.getUploadDir()));


// Enterprise Security Headers Defense-in-Depth
app.use((_req, res, next) => {
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'SAMEORIGIN');
  res.header('X-XSS-Protection', '1; mode=block');
  res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.header('Content-Security-Policy', "default-src 'self'");
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  if (_req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Global Interceptors
app.use(LoggingInterceptor);
app.use(AuditLogInterceptor);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'MBS Core Enterprise API Server',
    version: '1.0.0',
    compliance: 'Quyết định 05/2024/QĐ-UBND TP.HCM',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Standard Enterprise API v1 Module Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/posts', postsRouter);
app.use('/api/v1/categories', categoriesRouter);
app.use('/api/v1/documents', documentsRouter);
app.use('/api/v1/submissions', submissionsRouter);
app.use('/api/v1/forms', submissionsRouter);
app.use('/api/v1/inquiries', inquiriesRouter);
app.use('/api/v1/media', mediaRouter);
app.use('/api/v1/utilities', utilitiesRouter);
app.use('/api/v1/schedules', utilitiesRouter);
app.use('/api/v1/polls', utilitiesRouter);
app.use('/api/v1/analytics', analyticsRouter);
app.use('/api/v1/audit-logs', auditLogsRouter);
app.use('/api/v1/roles', rolesRouter);
app.use('/api/v1/pages', pagesRouter);

// Legacy route aliases for backwards compatibility
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/posts', postsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/submissions', submissionsRouter);
app.use('/api/media', mediaRouter);
app.use('/api/inquiries', inquiriesRouter);
app.use('/api/utilities', utilitiesRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/audit-logs', auditLogsRouter);
app.use('/api/pages', pagesRouter);

// Global Error Exception Handling (RFC 7807 Problem Details)
app.use(GlobalExceptionFilter);

if (process.env.APP_TEST !== 'true') {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 MBS Core Enterprise Backend API Server running on port ${PORT}`);
    console.log(`👉 Health check: http://localhost:${PORT}/api/health`);
    console.log(`👉 API v1 Base: http://localhost:${PORT}/api/v1`);
    console.log(`====================================================`);
  });
}

export default app;
