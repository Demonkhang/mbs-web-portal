import { Request, Response, NextFunction } from 'express';
import { prisma } from '@mbs/database';

export function LoggingInterceptor(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const { method, originalUrl, ip } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[MBS-API] ${method} ${originalUrl} ${res.statusCode} - ${duration}ms - IP: ${ip}`);
  });

  next();
}

export function AuditLogInterceptor(req: Request, res: Response, next: NextFunction) {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    res.on('finish', () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const userId = req.user?.id || null;
        const action = `${req.method} ${req.originalUrl}`;
        const moduleName = req.originalUrl.split('/')[3]?.toUpperCase() || 'SYSTEM';
        const ipAddress = (req.ip || req.headers['x-forwarded-for'] || '127.0.0.1').toString();
        const details = JSON.stringify({
          userAgent: req.headers['user-agent'],
          body: req.body ? Object.keys(req.body) : [],
        });

        prisma.auditLog
          .create({
            data: {
              action,
              module: moduleName,
              userId,
              ipAddress,
              details,
            },
          })
          .catch((err) => {
            console.error('[AUDIT LOG ERROR]', err);
          });
      }
    });
  }
  next();
}
