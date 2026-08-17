import { Request, Response, NextFunction } from 'express';

export function GlobalExceptionFilter(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('[MBS-API ERROR]', err);

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Hệ thống đã xảy ra sự cố kỹ thuật. Vui lòng thử lại sau.';

  res.status(statusCode).json({
    statusCode,
    message,
    error: err.name || 'InternalServerError',
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
  });
}
