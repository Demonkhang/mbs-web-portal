import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '@mbs/database';
import { sendApiResponse } from '../../common/interceptors/response.interceptor';
import { JwtAuthGuard, OptionalJwtAuthGuard, RolesGuard } from '../../common/guards/roles.guard';

export const rolesRouter = Router();

// Permission Catalog by Domain (Lĩnh vực chuyên môn)
export const PERMISSION_CATALOG = [
  {
    domain: 'users',
    title: '1. Quản trị Hệ thống & Cán bộ',
    description: 'Quản lý tài khoản cán bộ, quyền hạn và nhật ký truy cập',
    permissions: [
      { code: 'users:view', title: 'Xem danh sách cán bộ', description: 'Xem thông tin tài khoản cán bộ trong CSDL' },
      { code: 'users:create', title: 'Tạo mới tài khoản', description: 'Tạo tài khoản cán bộ và gán vai trò' },
      { code: 'users:update', title: 'Chỉnh sửa tài khoản', description: 'Cập nhật phòng ban, họ tên, đổi vai trò' },
      { code: 'users:toggle_status', title: 'Khóa/Mở khóa tài khoản', description: 'Tạm ngưng hoặc kích hoạt lại tài khoản' },
      { code: 'users:delete', title: 'Xóa tài khoản', description: 'Xóa tài khoản cán bộ khỏi CSDL' },
      { code: 'roles:manage', title: 'Quản lý Phân quyền & Vai trò', description: 'Tạo vai trò mới và sửa ma trận quyền' },
      { code: 'audit:view', title: 'Xem Nhật ký Audit Logs', description: 'Tra cứu lịch sử thao tác hệ thống' },
    ],
  },
  {
    domain: 'posts',
    title: '2. Quản lý Tin bài & Truyền thông',
    description: 'Biên tập, kiểm duyệt và xuất bản tin bài môi trường',
    permissions: [
      { code: 'posts:view', title: 'Xem danh sách tin bài', description: 'Xem danh sách bài viết ở tất cả trạng thái' },
      { code: 'posts:create', title: 'Soạn thảo & Gửi biên tập (Bước 1)', description: 'Tạo bản thảo DRAFT, tích cam kết an toàn & gửi SUBMITTED' },
      { code: 'posts:edit_technical', title: 'Tiếp nhận biên tập & Trình duyệt (Bước 2)', description: 'Biên tập văn phong, sapo, ảnh, chuyên mục, luồng hiển thị (IN_EDITING -> PENDING_APPROVAL)' },
      { code: 'posts:approve_leadership', title: 'Phê duyệt & Chấm nhuận bút (Bước 3)', description: 'Đọc bài preview, nhập ghi chú phê duyệt, chọn điểm nhuận bút (PENDING_APPROVAL -> APPROVED)' },
      { code: 'posts:publish', title: 'Xuất bản công khai (Bước 4)', description: 'Kích hoạt xuất bản bài viết lên Portal công khai (APPROVED -> PUBLISHED)' },
      { code: 'posts:unpublish', title: 'Thu hồi bài khẩn cấp (Bước 5)', description: 'Gỡ bài viết đã xuất bản và lưu lý do thu hồi (PUBLISHED -> UNPUBLISHED)' },
      { code: 'posts:update_own', title: 'Sửa bài của chính mình', description: 'Sửa nội dung bài viết do bản thân tạo' },
      { code: 'posts:update_all', title: 'Sửa tất cả bài viết', description: 'Chỉnh sửa bài viết của bất kỳ ai' },
      { code: 'posts:review', title: 'Trình duyệt tin bài (Legacy)', description: 'Gửi bài viết lên cấp duyệt' },
      { code: 'posts:approve', title: 'Phê duyệt xuất bản (Legacy)', description: 'Phê duyệt xuất bản bài viết' },
      { code: 'posts:delete', title: 'Xóa bài viết', description: 'Xóa tin bài khỏi hệ thống' },
      { code: 'categories:manage', title: 'Quản lý Chuyên mục', description: 'Tạo và chỉnh sửa danh mục tin tức' },
      { code: 'media:upload', title: 'Tải lên Thư viện Media', description: 'Upload ảnh đại diện và tài liệu chèn bài' },
    ],
  },
  {
    domain: 'documents',
    title: '3. Văn bản Pháp quy & Chỉ đạo',
    description: 'Đăng tải và quản lý kho văn bản quy phạm pháp luật',
    permissions: [
      { code: 'documents:view', title: 'Xem danh mục văn bản', description: 'Tra cứu kho văn bản chỉ đạo' },
      { code: 'documents:create', title: 'Đăng tải & Biên tập Metadata', description: 'Thêm văn bản pháp quy, đính kèm file, tạo bản nháp' },
      { code: 'documents:tech_check', title: 'Kiểm tra kỹ thuật & ATTT', description: 'Khai báo kiểm tra chữ ký số .p7s & tuân thủ Luật Tiếp cận thông tin' },
      { code: 'documents:review', title: 'Thẩm định văn bản', description: 'Xem xét hàng đợi phê duyệt văn bản' },
      { code: 'documents:approve', title: 'Phê duyệt & Từ chối phát hành', description: 'Phê duyệt xuất bản hoặc Từ chối kèm lý do' },
      { code: 'documents:update', title: 'Cập nhật thông tin văn bản', description: 'Sửa trích yếu, ngày ban hành, hiệu lực' },
      { code: 'documents:delete', title: 'Xóa văn bản', description: 'Xóa văn bản khỏi hệ thống' },
    ],
  },
  {
    domain: 'submissions',
    title: '4. Dịch vụ công & Thụ lý Hồ sơ',
    description: 'Giải quyết thủ tục hành chính và cấp phép môi trường',
    permissions: [
      { code: 'submissions:view', title: 'Xem danh sách hồ sơ', description: 'Tra cứu hồ sơ dịch vụ công nộp vào' },
      { code: 'submissions:process', title: 'Thụ lý & Chuyển bước', description: 'Đổi trạng thái thụ lý, thẩm định hồ sơ' },
      { code: 'submissions:assign', title: 'Phân công cán bộ thụ lý', description: 'Gán cán bộ chuyên môn phụ trách hồ sơ' },
      { code: 'forms:manage', title: 'Quản lý Biểu mẫu Trực tuyến', description: 'Cấu hình và thiết kế các form mẫu' },
    ],
  },
  {
    domain: 'inquiries',
    title: '5. Phản ánh Môi trường & Ý kiến Cử tri',
    description: 'Tiếp nhận và xử lý ý kiến, phản ánh của người dân',
    permissions: [
      { code: 'inquiries:view', title: 'Xem phản ánh & câu hỏi', description: 'Tra cứu danh sách ý kiến công dân gửi về' },
      { code: 'inquiries:reply', title: 'Phản hồi & Trả lời cử tri', description: 'Soạn nội dung văn bản trả lời chính thức' },
      { code: 'inquiries:publish', title: 'Công khai câu hỏi lên FAQ', description: 'Duyệt đưa câu hỏi & trả lời lên Portal' },
    ],
  },
  {
    domain: 'utilities',
    title: '6. Lịch công tác & Tiện ích Portal',
    description: 'Quản lý lịch làm việc tuần, khảo sát và tiện ích công khai',
    permissions: [
      { code: 'schedules:manage', title: 'Quản lý Lịch làm việc tuần', description: 'Đăng và sửa lịch công tác Ban Giám đốc' },
      { code: 'polls:manage', title: 'Quản lý Khảo sát ý kiến', description: 'Tạo cuộc thăm dò ý kiến cử tri' },
      { code: 'faqs:manage', title: 'Quản lý Bộ câu hỏi FAQ', description: 'Chỉnh sửa danh mục câu hỏi thường gặp' },
    ],
  },
];

// GET /api/v1/roles/permissions-catalog - Get Catalog of domains and permissions
rolesRouter.get('/permissions-catalog', OptionalJwtAuthGuard, (req: Request, res: Response) => {
  return sendApiResponse(res, PERMISSION_CATALOG, 'Danh mục Phân quyền theo Lĩnh vực chuyên môn');
});

// GET /api/v1/roles - List all roles with permission matrix
rolesRouter.get('/', OptionalJwtAuthGuard, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const roles = await prisma.roleDefinition.findMany({
      orderBy: [{ isSystem: 'desc' }, { createdAt: 'asc' }],
    });

    return sendApiResponse(res, roles, 'Danh sách Vai trò & Ma trận Phân quyền từ PostgreSQL DB');
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/roles - Create new custom role
rolesRouter.post('/', OptionalJwtAuthGuard, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, name, description, badgeClass, permissions } = req.body;

    if (!code || !name) {
      return res.status(400).json({
        type: 'https://mbs.hochiminhcity.gov.vn/errors/bad-request',
        title: 'Bad Request',
        status: 400,
        detail: 'Mã vai trò (code) và Tên vai trò (name) là bắt buộc.',
        instance: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }

    const cleanCode = code.trim().toUpperCase().replace(/\s+/g, '_');

    // Check duplicate
    const existing = await prisma.roleDefinition.findUnique({ where: { code: cleanCode } });
    if (existing) {
      return res.status(409).json({
        type: 'https://mbs.hochiminhcity.gov.vn/errors/conflict',
        title: 'Conflict',
        status: 409,
        detail: `Mã vai trò '${cleanCode}' đã tồn tại trong hệ thống.`,
        instance: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }

    const newRole = await prisma.roleDefinition.create({
      data: {
        code: cleanCode,
        name: name.trim(),
        description: description ? description.trim() : '',
        badgeClass: badgeClass || 'bg-teal-950 text-teal-300 border-teal-800',
        isSystem: false,
        permissions: Array.isArray(permissions) ? permissions : [],
      },
    });

    return sendApiResponse(res, newRole, 'Tạo mới Vai trò tùy chỉnh thành công trong PostgreSQL DB', 201);
  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/roles/:id - Update existing role permissions & info
rolesRouter.put('/:id', OptionalJwtAuthGuard, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, description, badgeClass, permissions } = req.body;

    const currentRole = await prisma.roleDefinition.findFirst({
      where: {
        OR: [
          { id },
          { code: id },
        ],
      },
    });

    if (!currentRole) {
      return res.status(404).json({
        type: 'https://mbs.hochiminhcity.gov.vn/errors/not-found',
        title: 'Not Found',
        status: 404,
        detail: `Không tìm thấy vai trò với ID/Code '${id}' trong CSDL PostgreSQL.`,
        instance: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }

    const updateData: any = {};
    if (name) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (badgeClass) updateData.badgeClass = badgeClass;
    if (Array.isArray(permissions)) updateData.permissions = permissions;

    const updatedRole = await prisma.roleDefinition.update({
      where: { id: currentRole.id },
      data: updateData,
    });

    return sendApiResponse(res, updatedRole, 'Cập nhật ma trận phân quyền vai trò thành công');
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/roles/:id - Delete custom role definition
rolesRouter.delete('/:id', OptionalJwtAuthGuard, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const currentRole = await prisma.roleDefinition.findFirst({
      where: {
        OR: [
          { id },
          { code: id },
        ],
      },
    });

    if (!currentRole) {
      return res.status(404).json({
        type: 'https://mbs.hochiminhcity.gov.vn/errors/not-found',
        title: 'Not Found',
        status: 404,
        detail: `Không tìm thấy vai trò với ID/Code '${id}' trong CSDL PostgreSQL.`,
        instance: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }

    if (currentRole.isSystem) {
      return res.status(400).json({
        type: 'https://mbs.hochiminhcity.gov.vn/errors/bad-request',
        title: 'System Role Protection',
        status: 400,
        detail: `Vai trò hệ thống '${currentRole.name}' (${currentRole.code}) là mặc định, không thể xóa.`,
        instance: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }

    await prisma.roleDefinition.delete({ where: { id: currentRole.id } });
    return sendApiResponse(res, { id: currentRole.id, deleted: true }, 'Xóa vai trò tùy chỉnh thành công khỏi PostgreSQL DB');
  } catch (error) {
    next(error);
  }
});

