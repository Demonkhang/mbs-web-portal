import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '@mbs/database';
import { sendApiResponse } from '../../common/interceptors/response.interceptor';
import { JwtAuthGuard, RolesGuard, PermissionGuard } from '../../common/guards/roles.guard';
import { RateLimiterMiddleware } from '../../common/middleware/rate-limiter.middleware';

export const inquiriesRouter = Router();

// GET /api/v1/inquiries/feedback - List environmental feedbacks from PostgreSQL DB
inquiriesRouter.get('/feedback', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;

    const whereClause: any = {};
    if (status) whereClause.status = status;

    const [items, total] = await Promise.all([
      prisma.environmentalFeedback.findMany({
        where: whereClause,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.environmentalFeedback.count({ where: whereClause }),
    ]);

    return sendApiResponse(res, items, 'Danh sách phản ánh môi trường từ CSDL PostgreSQL', 200, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/inquiries/feedback/:id - Get environmental feedback details by ID or ticketCode from PostgreSQL DB
inquiriesRouter.get('/feedback/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const item = await prisma.environmentalFeedback.findFirst({
      where: {
        OR: [{ id }, { ticketCode: id }],
      },
    });

    if (!item) {
      return res.status(404).json({
        type: 'https://mbs.hochiminhcity.gov.vn/errors/not-found',
        title: 'Not Found',
        status: 404,
        detail: `Không tìm thấy phản ánh với mã hoặc ID '${id}' trong CSDL PostgreSQL.`,
        instance: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }

    return sendApiResponse(res, item, 'Chi tiết phản ánh môi trường từ CSDL PostgreSQL');
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/inquiries/feedback - Create environmental feedback in PostgreSQL DB
inquiriesRouter.post('/feedback', RateLimiterMiddleware(5, 60), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, senderName, senderPhone, location, photoUrl } = req.body;

    if (!title || !senderName || !senderPhone) {
      return res.status(400).json({
        type: 'https://mbs.hochiminhcity.gov.vn/errors/bad-request',
        title: 'Bad Request',
        status: 400,
        detail: 'Tiêu đề, họ tên và số điện thoại là thông tin bắt buộc.',
        instance: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }

    const ticketCode = `MBS-FB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const feedbackItem = await prisma.environmentalFeedback.create({
      data: {
        ticketCode,
        title,
        senderName,
        senderPhone,
        location: location || '',
        photoUrl: photoUrl || '',
        status: 'da-tiep-nhan',
        statusText: 'Đã tiếp nhận phản ánh thành công',
      },
    });

    return sendApiResponse(res, feedbackItem, 'Gửi phản ánh môi trường vào CSDL PostgreSQL thành công', 201);
  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/inquiries/feedback/:id - Update environmental feedback status & reply in PostgreSQL DB
inquiriesRouter.put('/feedback/:id', JwtAuthGuard, PermissionGuard('inquiries:reply'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, statusText } = req.body;

    const updatedItem = await prisma.environmentalFeedback.update({
      where: { id },
      data: {
        status: status || 'dang-xu-ly',
        statusText: statusText || 'Cập nhật tiến độ xử lý phản ánh',
      },
    });

    return sendApiResponse(res, updatedItem, 'Cập nhật phản ánh môi trường thành công trong CSDL PostgreSQL');
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/inquiries/feedback/:id - Delete environmental feedback from PostgreSQL DB
inquiriesRouter.delete('/feedback/:id', JwtAuthGuard, PermissionGuard('inquiries:reply'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.environmentalFeedback.delete({ where: { id } });
    return sendApiResponse(res, { id, deleted: true }, 'Xóa phản ánh môi trường thành công khỏi CSDL PostgreSQL');
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/inquiries/faq - Get published FAQs list from PostgreSQL DB
inquiriesRouter.get('/faq', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const faqs = await prisma.faq.findMany({ where: { isPublished: true }, orderBy: { order: 'asc' } });
    return sendApiResponse(res, faqs, 'Danh sách câu hỏi thường gặp FAQ từ CSDL PostgreSQL');
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/inquiries - List general inquiries from PostgreSQL DB
inquiriesRouter.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const inquiries = await prisma.inquiry.findMany({ orderBy: { createdAt: 'desc' } });
    return sendApiResponse(res, inquiries, 'Danh sách ý kiến góp ý từ CSDL PostgreSQL');
  } catch (error) {
    next(error);
  }
});
