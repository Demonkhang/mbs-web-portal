import { Request, Response, NextFunction } from 'express';
import { redisService } from '../services/redis.service';

export function RateLimiterMiddleware(limit: number, windowSeconds = 60) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
    const key = `ratelimit:${req.path}:${ip}`;

    const { allowed, remaining } = redisService.checkRateLimit(key, limit, windowSeconds);

    res.header('X-RateLimit-Limit', limit.toString());
    res.header('X-RateLimit-Remaining', remaining.toString());

    if (!allowed) {
      return res.status(429).json({
        type: 'https://mbs.hochiminhcity.gov.vn/errors/too-many-requests',
        title: 'Too Many Requests',
        status: 429,
        detail: `Bạn đã vượt quá giới hạn ${limit} lượt yêu cầu trong ${windowSeconds} giây. Vui lòng thử lại sau.`,
        instance: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }

    next();
  };
}
