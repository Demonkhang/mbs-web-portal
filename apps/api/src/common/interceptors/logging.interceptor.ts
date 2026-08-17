import { Request, Response, NextFunction } from 'express';

export function LoggingInterceptor(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const { method, originalUrl, ip } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[MBS-API] ${method} ${originalUrl} ${res.statusCode} - ${duration}ms - IP: ${ip}`);
  });

  next();
}

export function AuditLogInterceptor(req: Request & { user?: any }, res: Response, next: NextFunction) {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    res.on('finish', () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log(`[MBS-AUDITLOG] Action: ${req.method} ${req.originalUrl} | User: ${req.user?.username || 'ANONYMOUS'} | IP: ${req.ip}`);
      }
    });
  }
  next();
}
