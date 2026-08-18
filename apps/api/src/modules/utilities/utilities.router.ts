import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '@mbs/database';
import { sendApiResponse } from '../../common/interceptors/response.interceptor';
import { redisService } from '../../common/services/redis.service';
import { OptionalJwtAuthGuard } from '../../common/guards/roles.guard';

export const utilitiesRouter = Router();

function syncWeatherData() {
  const weatherPayload = {
    location: 'TP. Hồ Chí Minh',
    temperature: 31.5,
    humidity: 75,
    aqi: 42,
    aqiCategory: 'Tốt (Good)',
    weatherDesc: 'Nắng nhẹ, mây rải rác',
    updatedAt: new Date().toISOString(),
  };
  redisService.set('weather:tphcm', weatherPayload, 1800);
}
syncWeatherData();
setInterval(syncWeatherData, 30 * 60 * 1000);

utilitiesRouter.get('/weather-aqi', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    let data = redisService.get<any>('weather:tphcm');
    if (!data) {
      syncWeatherData();
      data = redisService.get<any>('weather:tphcm');
    }
    return sendApiResponse(res, data, 'Dữ liệu thời tiết và chỉ số chất lượng không khí (AQI) TP.HCM');
  } catch (error) {
    next(error);
  }
});

const handleWeeklySchedule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isInternalUser = req.user && ['SUPER_ADMIN', 'ADMIN', 'EDITOR_LEAD', 'EDITOR', 'OFFICER'].includes(req.user.role);
    const week = req.query.week ? parseInt(req.query.week as string) : undefined;
    const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();

    const whereClause: any = {};
    if (!isInternalUser) whereClause.isPublic = true;
    if (week) whereClause.weekNumber = week;
    if (year) whereClause.year = year;

    const schedules = await prisma.weeklySchedule.findMany({
      where: whereClause,
      orderBy: [{ date: 'asc' }, { timeSlot: 'asc' }],
    });

    return sendApiResponse(
      res,
      schedules,
      'Lịch công tác tuần Lãnh đạo Ban Quản lý MBS từ CSDL PostgreSQL'
    );
  } catch (error) {
    next(error);
  }
};

utilitiesRouter.get('/schedules/weekly', OptionalJwtAuthGuard, handleWeeklySchedule);
utilitiesRouter.get('/weekly', OptionalJwtAuthGuard, handleWeeklySchedule);

const handlePollVote = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { optionIndex } = req.body;
    const ip = (req.ip || req.headers['x-forwarded-for'] || '127.0.0.1').toString();
    const userId = req.user?.id || 'anon';

    if (optionIndex === undefined || typeof optionIndex !== 'number') {
      return res.status(400).json({
        type: 'https://mbs.hochiminhcity.gov.vn/errors/bad-request',
        title: 'Bad Request',
        status: 400,
        detail: 'Vui lòng chọn tùy chọn bình chọn hợp lệ (optionIndex).',
        instance: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }

    const lockKey = `pollvote:${id}:${userId}:${ip}`;
    if (redisService.get(lockKey)) {
      return res.status(429).json({
        type: 'https://mbs.hochiminhcity.gov.vn/errors/too-many-requests',
        title: 'Already Voted',
        status: 429,
        detail: 'Bạn đã thực hiện bình chọn cho khảo sát này. Mỗi IP/Tài khoản chỉ được vote 1 lần trong 24 giờ.',
        instance: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }

    redisService.set(lockKey, true, 86400);

    return sendApiResponse(
      res,
      { pollId: id, optionIndex, votedAt: new Date().toISOString() },
      'Cảm ơn bạn đã tham gia bình chọn khảo sát ý kiến!'
    );
  } catch (error) {
    next(error);
  }
};

utilitiesRouter.post('/polls/:id/vote', OptionalJwtAuthGuard, handlePollVote);
utilitiesRouter.post('/:id/vote', OptionalJwtAuthGuard, handlePollVote);
