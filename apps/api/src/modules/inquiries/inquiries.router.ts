import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '@mbs/database';
import { sendApiResponse } from '../../common/interceptors/response.interceptor';
import { RateLimiterMiddleware } from '../../common/middleware/rate-limiter.middleware';

export const inquiriesRouter = Router();

// Default seed feedbacks to ensure Admin and Public always have initial data if DB is fresh
const defaultSeedFeedbacks = [
  {
    ticketCode: 'PA-2026-4821',
    title: 'Phản ánh mùi hôi phát sinh vào khoảng 20h00 tại xã Phong Phú, Huyện Bình Chánh',
    senderName: 'Trần Văn An',
    senderPhone: '0908 123 456',
    senderEmail: 'an.tran@example.com',
    facility: 'Khu LHXLCT Đa Phước (Bình Chánh)',
    category: 'Mùi hôi phát tán khu dân cư',
    timeOccurrence: 'Ban đêm (19h00 - 23h00)',
    location: 'Khu dân cư xã Phong Phú, gần cầu Ông Thìn, cách bãi rác 1.5km',
    content: 'Phát sinh mùi hôi nông độ nồng nặc bốc theo hướng gió Đông Nam về khu dân cư từ khoảng 20h00 kéo dài đến 23h00 đêm.',
    photoUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80',
    status: 'da-giai-quyet',
    statusText: 'Đã xử lý & Phản hồi công khai',
    assignedOfficer: 'Đội Giám sát Hiện trường Đa Phước',
    assignedDepartment: 'Phòng Quản lý Môi trường',
    currentStep: 4,
    officialResponse: 'Ban Quản lý MBS đã cử Tổ công tác kiểm tra đột xuất tại ô chôn lấp số 3 và trạm xử lý nước rỉ rác. Đã yêu cầu đơn vị vận hành tăng cường gấp đôi tần suất phun xịt chế phẩm vi sinh khử mùi và phủ bạt HDPE dầy 1.5mm tại các diện tích hở. Kết quả đo kiểm AQI sau đó đạt chuẩn QCVN 05:2023.',
    isPublic: true,
  },
  {
    ticketCode: 'PA-2026-4790',
    title: 'Xe chở rác rò rỉ nước rỉ rác trên Quốc lộ 22 hướng về bãi rác',
    senderName: 'Lê Thị Thu',
    senderPhone: '0918 222 333',
    senderEmail: 'thu.le@example.com',
    facility: 'Khu LHXLCT Phước Hiệp (Củ Chi)',
    category: 'Rò rỉ nước rỉ rác',
    timeOccurrence: 'Ban ngày (06h00 - 18h00)',
    location: 'Quốc lộ 22 đoạn qua xã Tân Thạnh Tây',
    content: 'Xe tải chở rác BKS 51C-987.xx chạy hướng Củ Chi chảy rỉ nước thải hôi thối xuống lòng đường gây nguy hiểm cho người tham gia giao thông.',
    photoUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80',
    status: 'da-giai-quyet',
    statusText: 'Đã xử lý & Phản hồi công khai',
    assignedOfficer: 'Phòng Giám sát Môi trường',
    assignedDepartment: 'Phòng Quản lý Kỹ thuật',
    currentStep: 4,
    officialResponse: 'Ban Quản lý MBS đã trích xuất camera giám sát hành trình, xác định xe BKS 51C-987.xx vi phạm gioăng cao su thùng chứa; đã lập biên bản đình chỉ tiếp nhận phương tiện 07 ngày và yêu cầu đơn vị thu gom khắc phục sửa chữa kín khít.',
    isPublic: true,
  },
  {
    ticketCode: 'PA-2026-4655',
    title: 'Đề nghị tăng cường cây xanh cách ly tại ranh giới khu xử lý chất thải',
    senderName: 'Phạm Minh Đức',
    senderPhone: '0933 777 888',
    senderEmail: 'duc.pham@example.com',
    facility: 'Khu LHXLCT Đa Phước (Bình Chánh)',
    category: 'Vấn đề môi trường khác',
    timeOccurrence: 'Cả ngày liên tục',
    location: 'Dải phân cách sinh thái phía Đông Bắc bãi rác Đa Phước',
    content: 'Kiến nghị bổ sung vành đai cây xanh cách ly để hạn chế bụi và mùi hôi phát tán tới các hộ dân xung quanh.',
    photoUrl: '',
    status: 'da-giai-quyet',
    statusText: 'Đã hoàn thành hạng mục vành đai xanh',
    assignedOfficer: 'Phòng Quản lý Kỹ thuật',
    assignedDepartment: 'Ban Quản lý MBS',
    currentStep: 4,
    officialResponse: 'Đã hoàn thành trồng bổ sung 2.500 cây keo lai và cây dầu rái tại dải phân cách sinh thái phía Đông Bắc, bảo đảm vành đai xanh cách ly 500m theo đúng quy hoạch được duyệt.',
    isPublic: true,
  },
];

// Seed Helper (Only seeds ONCE during application runtime)
let isFeedbacksSeeded = false;
async function ensureSeedFeedbacks() {
  if (isFeedbacksSeeded) return;
  try {
    const count = await prisma.environmentalFeedback.count();
    if (count === 0) {
      for (const item of defaultSeedFeedbacks) {
        await prisma.environmentalFeedback.create({ data: item });
      }
    }
  } catch (e) {
    console.error('Error seeding environmental feedbacks:', e);
  } finally {
    isFeedbacksSeeded = true;
  }
}

// GET /api/v1/inquiries/feedback - List environmental feedbacks from PostgreSQL DB
inquiriesRouter.get('/feedback', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await ensureSeedFeedbacks();

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const status = req.query.status as string;
    const isPublicOnly = req.query.isPublic === 'true';

    const whereClause: any = {};
    if (status) whereClause.status = status;
    if (isPublicOnly) whereClause.isPublic = true;

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
inquiriesRouter.post('/feedback', RateLimiterMiddleware(10, 60), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      senderName,
      senderPhone,
      senderEmail,
      facility,
      category,
      timeOccurrence,
      location,
      content,
      photoUrl,
      title,
    } = req.body;

    if (!senderName || !senderPhone) {
      return res.status(400).json({
        type: 'https://mbs.hochiminhcity.gov.vn/errors/bad-request',
        title: 'Bad Request',
        status: 400,
        detail: 'Họ tên và số điện thoại là thông tin bắt buộc.',
        instance: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }

    const ticketCode = `PA-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const finalTitle = title || `Phản ánh: ${category || 'Sự cố môi trường'} tại ${facility || 'Khu XLCT'}`;

    const feedbackItem = await prisma.environmentalFeedback.create({
      data: {
        ticketCode,
        title: finalTitle,
        senderName,
        senderPhone,
        senderEmail: senderEmail || '',
        facility: facility || 'Khu LHXLCT Đa Phước (Bình Chánh)',
        category: category || 'Mùi hôi phát tán khu dân cư',
        timeOccurrence: timeOccurrence || 'Ban đêm (19h00 - 23h00)',
        location: location || '',
        content: content || title || 'Nội dung phản ánh sự cố môi trường',
        photoUrl: photoUrl || '',
        status: 'da-tiep-nhan',
        statusText: 'Hồ sơ đã tiếp nhận, chờ phân công cán bộ thụ lý',
        currentStep: 1,
        assignedOfficer: 'Chưa phân công',
        assignedDepartment: 'Tổ Trực ban 24/7',
        officialResponse: '',
        isPublic: false,
      },
    });

    return sendApiResponse(res, feedbackItem, 'Gửi phản ánh môi trường vào CSDL PostgreSQL thành công', 201);
  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/inquiries/feedback/:id - Update environmental feedback status & reply in PostgreSQL DB
inquiriesRouter.put('/feedback/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const {
      status,
      statusText,
      assignedOfficer,
      assignedDepartment,
      currentStep,
      officialResponse,
      isPublic,
    } = req.body;

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (statusText !== undefined) updateData.statusText = statusText;
    if (assignedOfficer !== undefined) updateData.assignedOfficer = assignedOfficer;
    if (assignedDepartment !== undefined) updateData.assignedDepartment = assignedDepartment;
    if (currentStep !== undefined) updateData.currentStep = currentStep;
    if (officialResponse !== undefined) updateData.officialResponse = officialResponse;
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    const updatedItem = await prisma.environmentalFeedback.update({
      where: { id },
      data: updateData,
    });

    return sendApiResponse(res, updatedItem, 'Cập nhật phản ánh môi trường thành công trong CSDL PostgreSQL');
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/inquiries/feedback/:id - Delete environmental feedback permanently from PostgreSQL DB
inquiriesRouter.delete('/feedback/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.environmentalFeedback.delete({ where: { id } });
    return sendApiResponse(res, { id, deleted: true }, 'Xóa vĩnh viễn phản ánh môi trường khỏi CSDL PostgreSQL thành công');
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
