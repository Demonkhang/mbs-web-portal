import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { prisma } from '@mbs/database';
import { sendApiResponse } from '../../common/interceptors/response.interceptor';
import { redisService } from '../../common/services/redis.service';
import { OptionalJwtAuthGuard } from '../../common/guards/roles.guard';
import { parseWeeklyScheduleExcel } from './weekly-schedule-parser.service';

export const utilitiesRouter = Router();

const excelUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

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

// GET /api/v1/schedules/weekly - Get list of weekly schedules
const handleWeeklySchedule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isInternalUser = req.user && ['SUPER_ADMIN', 'ADMIN', 'EDITOR_LEAD', 'EDITOR', 'OFFICER'].includes(req.user.role);
    const week = req.query.week ? parseInt(req.query.week as string) : undefined;
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;

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

// Map multiple path aliases so whether mounted on /api/v1/schedules or /api/v1/utilities, routes work cleanly
utilitiesRouter.get(['/', '/schedules', '/schedules/weekly', '/weekly'], OptionalJwtAuthGuard, handleWeeklySchedule);

// POST /api/v1/schedules/import OR /api/v1/utilities/schedules/import - Import and Parse Excel file
utilitiesRouter.post(['/import', '/schedules/import'], OptionalJwtAuthGuard, excelUpload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        type: 'https://mbs.hochiminhcity.gov.vn/errors/bad-request',
        title: 'Bad Request',
        status: 400,
        detail: 'Vui lòng chọn file Excel (.xlsx hoặc .xls) để import.',
        instance: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }

    const parsedBatch = parseWeeklyScheduleExcel(req.file.buffer);

    // If autoSave query parameter is set to true
    if (req.query.autoSave === 'true' || req.body.autoSave === 'true') {
      const mode = (req.query.mode || req.body.mode || 'overwrite') as string;

      if (mode === 'overwrite') {
        await prisma.weeklySchedule.deleteMany({
          where: {
            weekNumber: parsedBatch.weekNumber,
            year: parsedBatch.year,
          },
        });
      }

      const createdItems = await Promise.all(
        parsedBatch.items.map((item) =>
          prisma.weeklySchedule.create({
            data: {
              weekNumber: parsedBatch.weekNumber,
              year: parsedBatch.year,
              startDate: parsedBatch.startDate,
              endDate: parsedBatch.endDate,
              dayOfWeek: item.dayOfWeek,
              date: item.date,
              timeSlot: item.timeSlot,
              isAllDay: item.isAllDay,
              eventTitle: item.eventTitle,
              leaderName: item.leaderName,
              attendees: item.attendees,
              location: item.location,
              notes: item.notes,
              isPublic: true,
              createdById: req.user?.id || null,
            },
          })
        )
      );

      return sendApiResponse(
        res,
        {
          weekNumber: parsedBatch.weekNumber,
          year: parsedBatch.year,
          startDate: parsedBatch.startDate,
          endDate: parsedBatch.endDate,
          savedCount: createdItems.length,
          items: createdItems,
        },
        `Đã bóc tách và lưu thành công ${createdItems.length} sự kiện lịch tuần ${parsedBatch.weekNumber}/${parsedBatch.year} vào CSDL.`
      );
    }

    // Default: Return Preview Data
    return sendApiResponse(
      res,
      parsedBatch,
      `Bóc tách dữ liệu file Excel thành công! Tìm thấy ${parsedBatch.items.length} sự kiện cho tuần ${parsedBatch.weekNumber}/${parsedBatch.year}.`
    );
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/schedules/batch-save - Save parsed batch from frontend preview
utilitiesRouter.post(['/batch-save', '/schedules/batch-save'], OptionalJwtAuthGuard, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { weekNumber, year, startDate, endDate, items, mode = 'overwrite' } = req.body;

    if (!weekNumber || !year || !Array.isArray(items)) {
      return res.status(400).json({
        type: 'https://mbs.hochiminhcity.gov.vn/errors/bad-request',
        title: 'Bad Request',
        status: 400,
        detail: 'Dữ liệu không hợp lệ. Cần có weekNumber, year và mảng items.',
        instance: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }

    if (mode === 'overwrite') {
      await prisma.weeklySchedule.deleteMany({
        where: {
          weekNumber: parseInt(weekNumber, 10),
          year: parseInt(year, 10),
        },
      });
    }

    const createdItems = await Promise.all(
      items.map((item: any) =>
        prisma.weeklySchedule.create({
          data: {
            weekNumber: parseInt(weekNumber, 10),
            year: parseInt(year, 10),
            startDate: startDate ? new Date(startDate) : new Date(),
            endDate: endDate ? new Date(endDate) : new Date(),
            dayOfWeek: item.dayOfWeek || 'Thứ 2',
            date: item.date ? new Date(item.date) : new Date(),
            timeSlot: item.timeSlot || 'Cả ngày',
            isAllDay: !!item.isAllDay,
            eventTitle: item.eventTitle,
            leaderName: item.leaderName || null,
            attendees: item.attendees || null,
            location: item.location || null,
            notes: item.notes || null,
            isPublic: item.isPublic !== undefined ? item.isPublic : true,
            createdById: req.user?.id || null,
          },
        })
      )
    );

    return sendApiResponse(
      res,
      { savedCount: createdItems.length, items: createdItems },
      `Lưu thành công ${createdItems.length} sự kiện lịch công tác tuần ${weekNumber}/${year} vào PostgreSQL CSDL.`
    );
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/schedules/week/:year/:weekNumber - Clear all schedules of a week
utilitiesRouter.delete(['/week/:year/:weekNumber', '/schedules/week/:year/:weekNumber'], OptionalJwtAuthGuard, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { year, weekNumber } = req.params;
    const result = await prisma.weeklySchedule.deleteMany({
      where: {
        year: parseInt(year, 10),
        weekNumber: parseInt(weekNumber, 10),
      },
    });

    return sendApiResponse(res, { count: result.count }, `Đã xóa toàn bộ ${result.count} sự kiện của tuần ${weekNumber}/${year}.`);
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/schedules/:id - Get detail of single schedule event
utilitiesRouter.get(['/:id', '/schedules/:id'], OptionalJwtAuthGuard, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const schedule = await prisma.weeklySchedule.findUnique({ where: { id } });

    if (!schedule) {
      return res.status(404).json({
        type: 'https://mbs.hochiminhcity.gov.vn/errors/not-found',
        title: 'Not Found',
        status: 404,
        detail: `Không tìm thấy bản ghi lịch công tác với ID: ${id}`,
        instance: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }

    return sendApiResponse(res, schedule, 'Chi tiết sự kiện lịch công tác');
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/schedules - Create single schedule event manually
utilitiesRouter.post(['/', '/schedules'], OptionalJwtAuthGuard, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      weekNumber,
      year,
      startDate,
      endDate,
      dayOfWeek,
      date,
      timeSlot,
      isAllDay,
      eventTitle,
      leaderName,
      attendees,
      location,
      notes,
      isPublic = true,
    } = req.body;

    if (!eventTitle) {
      return res.status(400).json({
        type: 'https://mbs.hochiminhcity.gov.vn/errors/bad-request',
        title: 'Bad Request',
        status: 400,
        detail: 'Nội dung công tác (eventTitle) là bắt buộc.',
        instance: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }

    const eventDate = date ? new Date(date) : new Date();
    const eventYear = year || eventDate.getFullYear();

    let weekNo = weekNumber;
    if (!weekNo) {
      const d = new Date(Date.UTC(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate()));
      const dayNum = d.getUTCDay() || 7;
      d.setUTCDate(d.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
      weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    }

    const newSchedule = await prisma.weeklySchedule.create({
      data: {
        weekNumber: parseInt(weekNo, 10),
        year: parseInt(eventYear, 10),
        startDate: startDate ? new Date(startDate) : eventDate,
        endDate: endDate ? new Date(endDate) : eventDate,
        dayOfWeek: dayOfWeek || 'Thứ 2',
        date: eventDate,
        timeSlot: timeSlot || '08:00 - 11:30',
        isAllDay: !!isAllDay,
        eventTitle: eventTitle.trim(),
        leaderName: leaderName ? leaderName.trim() : null,
        attendees: attendees ? attendees.trim() : null,
        location: location ? location.trim() : null,
        notes: notes ? notes.trim() : null,
        isPublic: !!isPublic,
        createdById: req.user?.id || null,
      },
    });

    return sendApiResponse(res, newSchedule, 'Tạo mới lịch công tác thành công trong CSDL PostgreSQL', 201);
  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/schedules/:id - Update existing schedule event
utilitiesRouter.put(['/:id', '/schedules/:id'], OptionalJwtAuthGuard, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const {
      dayOfWeek,
      date,
      timeSlot,
      isAllDay,
      eventTitle,
      leaderName,
      attendees,
      location,
      notes,
      isPublic,
    } = req.body;

    const existing = await prisma.weeklySchedule.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        type: 'https://mbs.hochiminhcity.gov.vn/errors/not-found',
        title: 'Not Found',
        status: 404,
        detail: `Không tìm thấy bản ghi lịch công tác với ID: ${id}`,
        instance: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }

    const updateData: any = {};
    if (dayOfWeek) updateData.dayOfWeek = dayOfWeek;
    if (date) updateData.date = new Date(date);
    if (timeSlot) updateData.timeSlot = timeSlot;
    if (isAllDay !== undefined) updateData.isAllDay = !!isAllDay;
    if (eventTitle) updateData.eventTitle = eventTitle.trim();
    if (leaderName !== undefined) updateData.leaderName = leaderName ? leaderName.trim() : null;
    if (attendees !== undefined) updateData.attendees = attendees ? attendees.trim() : null;
    if (location !== undefined) updateData.location = location ? location.trim() : null;
    if (notes !== undefined) updateData.notes = notes ? notes.trim() : null;
    if (isPublic !== undefined) updateData.isPublic = !!isPublic;

    const updated = await prisma.weeklySchedule.update({
      where: { id },
      data: updateData,
    });

    return sendApiResponse(res, updated, 'Cập nhật sự kiện lịch công tác thành công');
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/schedules/:id - Delete single schedule event
utilitiesRouter.delete(['/:id', '/schedules/:id'], OptionalJwtAuthGuard, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const existing = await prisma.weeklySchedule.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        type: 'https://mbs.hochiminhcity.gov.vn/errors/not-found',
        title: 'Not Found',
        status: 404,
        detail: `Không tìm thấy bản ghi lịch công tác với ID: ${id}`,
        instance: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }

    await prisma.weeklySchedule.delete({ where: { id } });
    return sendApiResponse(res, { id, deleted: true }, 'Đã xóa sự kiện lịch công tác khỏi CSDL PostgreSQL.');
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/schedules/:id/toggle-public - Toggle public display
utilitiesRouter.patch(['/:id/toggle-public', '/schedules/:id/toggle-public'], OptionalJwtAuthGuard, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const existing = await prisma.weeklySchedule.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        type: 'https://mbs.hochiminhcity.gov.vn/errors/not-found',
        title: 'Not Found',
        status: 404,
        detail: `Không tìm thấy bản ghi lịch công tác với ID: ${id}`,
        instance: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }

    const updated = await prisma.weeklySchedule.update({
      where: { id },
      data: { isPublic: !existing.isPublic },
    });

    return sendApiResponse(res, updated, `Đã đổi trạng thái công khai thành: ${updated.isPublic ? 'Công khai' : 'Nội bộ'}`);
  } catch (error) {
    next(error);
  }
});

// Poll voting handler
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
