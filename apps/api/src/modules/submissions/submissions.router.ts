import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '@mbs/database';
import { sendApiResponse } from '../../common/interceptors/response.interceptor';
import { RateLimiterMiddleware } from '../../common/middleware/rate-limiter.middleware';
import { generateTrackingCode } from '../../common/utils/tracking-code.generator';
import { NotificationService } from '../notifications/notification.service';
import { EmailDispatcherService } from '../notifications/email-dispatcher.service';

export const submissionsRouter = Router();

const defaultSeedSubmissions = [
  {
    trackingCode: 'MBS-2026-A92B4',
    serviceName: 'Cấp giấy phép tiếp nhận và xử lý chất thải rắn sinh hoạt và công nghiệp thông thường',
    applicantName: 'Công ty Cổ phần Môi trường Đô thị Sài Gòn Xanh',
    applicantPhone: '0903 123 456',
    applicantEmail: 'saigonxanh@example.com',
    department: 'Khu LHXLCT Đa Phước (Bình Chánh)',
    currentStep: 2,
    assignedOfficer: 'Kỹ sư Nguyễn Hoàng Nam',
    status: 'TIEP_NHAN',
    statusText: 'Đang thẩm định báo cáo tác động môi trường',
    expectedDate: new Date(Date.now() + 7 * 24 * 3600 * 1000),
  },
  {
    trackingCode: 'MBS-2026-B33C8',
    serviceName: 'Kê khai và thẩm định Báo cáo quan trắc chất lượng nước xả thải định kỳ',
    applicantName: 'Công ty TNHH Tái chế Nhựa & Năng lượng Xanh',
    applicantPhone: '0912 345 678',
    applicantEmail: 'taiche@example.com',
    department: 'Khu LHXLCT Phước Hiệp (Củ Chi)',
    currentStep: 1,
    assignedOfficer: 'Chưa phân công',
    status: 'TIEP_NHAN',
    statusText: 'Hồ sơ đã tiếp nhận, chờ phân công cán bộ thụ lý',
    expectedDate: new Date(Date.now() + 5 * 24 * 3600 * 1000),
  },
  {
    trackingCode: 'MBS-2026-C88D0',
    serviceName: 'Đăng ký tham quan học tập, nghiên cứu khoa học tại Khu liên hợp xử lý chất thải',
    applicantName: 'Trường Đại học Tài nguyên và Môi trường TP.HCM',
    applicantPhone: '028 3844 1234',
    applicantEmail: 'dhtnmt@example.com',
    department: 'Khu LHXLCT Đa Phước',
    currentStep: 4,
    assignedOfficer: 'ThS. Lê Thanh Hải',
    status: 'HOAN_TAT',
    statusText: 'Đã hoàn thành phê duyệt và công khai kết quả',
    expectedDate: new Date(Date.now() - 2 * 24 * 3600 * 1000),
  },
];

let isSubmissionsSeeded = false;
async function ensureSeedSubmissions() {
  if (isSubmissionsSeeded) return;
  try {
    const count = await prisma.publicServiceSubmission.count();
    if (count === 0) {
      for (const item of defaultSeedSubmissions) {
        await prisma.publicServiceSubmission.create({ data: item as any });
      }
    }
  } catch (e) {
    console.error('Error seeding submissions:', e);
  } finally {
    isSubmissionsSeeded = true;
  }
}

// POST /api/v1/forms/builder - Save dynamic JSON Schema form configuration in PostgreSQL DB
submissionsRouter.post('/forms/builder', async (req: Request, res: Response, next: NextFunction) => {
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
submissionsRouter.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    await ensureSeedSubmissions();

    const submissions = await prisma.publicServiceSubmission.findMany({
      orderBy: { submissionDate: 'desc' },
    });
    return sendApiResponse(res, submissions, 'Danh sách hồ sơ dịch vụ công từ CSDL PostgreSQL');
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/submissions - Submit application to PostgreSQL DB
submissionsRouter.post('/', RateLimiterMiddleware(10, 60), async (req: Request, res: Response, next: NextFunction) => {
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

    // Notify admins & leadership in-app bell
    prisma.user.findMany({
      where: { role: { in: ['SUPER_ADMIN', 'ADMIN', 'APPROVER'] } },
      select: { id: true },
    }).then((admins) => {
      admins.forEach((u) => {
        NotificationService.createNotification({
          userId: u.id,
          type: 'SUBMISSION_NEW',
          title: 'Hồ sơ Dịch vụ công mới',
          content: `${applicantName} vừa nộp hồ sơ "${serviceName}". Mã tra cứu: ${trackingCode}`,
          linkUrl: '/admin/submissions',
          metadata: { submissionId: submission.id, trackingCode },
        }).catch(() => {});
      });
    }).catch(() => {});

    // Dispatch email confirmation to applicant
    EmailDispatcherService.sendEmail({
      toEmail: applicantEmail,
      toName: applicantName,
      type: 'SUBMISSION_NEW' as any,
      title: `Xác nhận tiếp nhận hồ sơ [Mã tra cứu: ${trackingCode}]`,
      content: `Hồ sơ thủ tục "<strong>${serviceName}</strong>" của ông/bà đã được Bộ phận Một cửa MBS tiếp nhận thành công vào hệ thống. Mã tra cứu tiến độ của ông/bà là: <strong style="color: #10b981; font-size: 16px;">${trackingCode}</strong>. Ngày hẹn trả kết quả dự kiến: ${new Date(expectedDate).toLocaleDateString('vi-VN')}.`,
      linkUrl: `/dich-vu-cong?code=${trackingCode}`,
    }).catch(() => {});

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
submissionsRouter.patch('/:id/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, statusText, notes, assignedOfficer, currentStep } = req.body;

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (statusText !== undefined) updateData.statusText = statusText;
    if (notes !== undefined) updateData.notes = notes;
    if (assignedOfficer !== undefined) updateData.assignedOfficer = assignedOfficer;
    if (currentStep !== undefined) updateData.currentStep = currentStep;

    const updatedSubmission = await prisma.publicServiceSubmission.update({
      where: { id },
      data: updateData,
    });

    return sendApiResponse(res, updatedSubmission, 'Cập nhật tiến độ hồ sơ thành công vào CSDL PostgreSQL');
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/submissions/:id - Delete public service submission permanently from PostgreSQL DB
submissionsRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.publicServiceSubmission.delete({ where: { id } });
    return sendApiResponse(res, { id, deleted: true }, 'Xóa vĩnh viễn hồ sơ dịch vụ công khỏi CSDL PostgreSQL thành công');
  } catch (error) {
    next(error);
  }
});
