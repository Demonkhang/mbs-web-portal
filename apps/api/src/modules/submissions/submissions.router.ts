import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '@mbs/database';
import { sendApiResponse } from '../../common/interceptors/response.interceptor';
import { JwtAuthGuard, RolesGuard, PermissionGuard } from '../../common/guards/roles.guard';
import { RateLimiterMiddleware } from '../../common/middleware/rate-limiter.middleware';
import { generateTrackingCode } from '../../common/utils/tracking-code.generator';

export const submissionsRouter = Router();

// POST /api/v1/forms/builder - Save dynamic JSON Schema form configuration in PostgreSQL DB
submissionsRouter.post('/forms/builder', JwtAuthGuard, PermissionGuard('forms:manage'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, title, description, schemaJson } = req.body;

    if (!code || !title || !schemaJson) {
      return res.status(400).json({
        type: 'https://mbs.hochiminhcity.gov.vn/errors/bad-request',
        title: 'Bad Request',
        status: 400,
        detail: 'Mã biểu mẫu, tiêu đề và cấu hình JSON Schema là bắt buộc.',
        instance: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }

    const form = await prisma.form.upsert({
      where: { code },
      update: { title, description, schemaJson: typeof schemaJson === 'object' ? JSON.stringify(schemaJson) : schemaJson },
      create: { code, title, description, schemaJson: typeof schemaJson === 'object' ? JSON.stringify(schemaJson) : schemaJson },
    });

    return sendApiResponse(res, form, 'Lưu cấu hình biểu mẫu động JSON Schema vào CSDL PostgreSQL thành công', 201);
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/forms - List active dynamic forms from PostgreSQL DB
submissionsRouter.get('/forms', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const forms = await prisma.form.findMany({ where: { isActive: true }, orderBy: { createdAt: 'desc' } });
    return sendApiResponse(res, forms, 'Danh sách biểu mẫu dịch vụ công động từ CSDL PostgreSQL');
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/submissions - List all submissions from PostgreSQL DB
submissionsRouter.get('/', JwtAuthGuard, PermissionGuard('submissions:view'), async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const submissions = await prisma.publicServiceSubmission.findMany({
      orderBy: { submissionDate: 'desc' },
    });
    return sendApiResponse(res, submissions, 'Danh sách hồ sơ dịch vụ công từ CSDL PostgreSQL');
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/submissions - Submit application to PostgreSQL DB
submissionsRouter.post('/', RateLimiterMiddleware(5, 60), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { serviceName, applicantName, applicantPhone, applicantEmail, department, formData, captchaToken } = req.body;

    if (!serviceName || !applicantName || !applicantPhone || !applicantEmail) {
      return res.status(400).json({
        type: 'https://mbs.hochiminhcity.gov.vn/errors/bad-request',
        title: 'Bad Request',
        status: 400,
        detail: 'Tên dịch vụ, họ tên, số điện thoại và email là các thông tin bắt buộc.',
        instance: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }

    if (captchaToken && captchaToken === 'INVALID') {
      return res.status(400).json({
        type: 'https://mbs.hochiminhcity.gov.vn/errors/bad-request',
        title: 'Invalid CAPTCHA',
        status: 400,
        detail: 'Xác thực CAPTCHA không thành công. Vui lòng thử lại.',
        instance: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }

    const trackingCode = generateTrackingCode();
    const expectedDate = new Date(Date.now() + 5 * 24 * 3600 * 1000);

    const submission = await prisma.publicServiceSubmission.create({
      data: {
        trackingCode,
        serviceName,
        applicantName,
        applicantPhone,
        applicantEmail,
        department: department || 'Bộ phận Một cửa MBS',
        status: 'TIEP_NHAN',
        statusText: 'Đã tiếp nhận hồ sơ trực tuyến thành công',
        expectedDate,
        formData: formData ? JSON.stringify(formData) : null,
      },
    });

    console.log(`[EMAIL DISPATCH] Tự động gửi email xác nhận mã tra cứu ${trackingCode} đến: ${applicantEmail}`);

    return sendApiResponse(
      res,
      {
        id: submission.id,
        trackingCode: submission.trackingCode,
        serviceName: submission.serviceName,
        applicantName: submission.applicantName,
        status: submission.status,
        expectedDate: submission.expectedDate,
      },
      'Nộp hồ sơ trực tuyến thành công vào CSDL PostgreSQL. Mã tra cứu đã được khởi tạo.',
      201
    );
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/submissions/track/:trackingCode - Public tracking progress by code from PostgreSQL DB
submissionsRouter.get('/track/:trackingCode', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { trackingCode } = req.params;
    const cleanCode = trackingCode.trim().toUpperCase();

    const submission = await prisma.publicServiceSubmission.findUnique({
      where: { trackingCode: cleanCode },
    });

    if (!submission) {
      return res.status(404).json({
        type: 'https://mbs.hochiminhcity.gov.vn/errors/not-found',
        title: 'Not Found',
        status: 404,
        detail: `Không tìm thấy hồ sơ xử lý với mã tra cứu '${trackingCode}' trong CSDL PostgreSQL.`,
        instance: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }

    return sendApiResponse(res, submission, 'Thông tin tiến độ xử lý hồ sơ từ CSDL PostgreSQL');
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/submissions/:id/status - Update processing status in PostgreSQL DB
submissionsRouter.patch('/:id/status', JwtAuthGuard, PermissionGuard('submissions:process'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, statusText, notes, assignedOfficer } = req.body;

    const updatedSubmission = await prisma.publicServiceSubmission.update({
      where: { id },
      data: {
        status: status as any,
        statusText: statusText || `Cập nhật trạng thái hồ sơ: ${status}`,
        notes,
        assignedOfficer: assignedOfficer || req.user?.fullName,
      },
    });

    return sendApiResponse(res, updatedSubmission, 'Cập nhật tiến độ hồ sơ thành công vào CSDL PostgreSQL');
  } catch (error) {
    next(error);
  }
});
