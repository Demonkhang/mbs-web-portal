import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '@mbs/database';
import { sendApiResponse } from '../../common/interceptors/response.interceptor';
import { redisService } from '../../common/services/redis.service';
import { JwtAuthGuard, RolesGuard } from '../../common/guards/roles.guard';
import { sanitizeHtmlContent } from '../../common/utils/sanitize.helper';

export const pagesRouter = Router();

// Mẫu dữ liệu trang tĩnh mặc định nếu CSDL PostgreSQL chưa có
const DEFAULT_PAGES = [
  {
    slug: 'gioi-thieu',
    title: 'Giới thiệu chung Ban Quản lý MBS',
    summary: 'Ban Quản lý các Khu liên hợp xử lý chất thải thành phố (MBS) là đơn vị sự nghiệp công lập trực thuộc Sở Tài nguyên và Môi trường TP. Hồ Chí Minh.',
    content: `
      <div class="space-y-4">
        <h3 class="text-xl font-bold text-slate-900">Vị trí Pháp lý & Quá trình Thành lập</h3>
        <p class="text-slate-700 leading-relaxed">
          Ban Quản lý các Khu liên hợp xử lý chất thải thành phố (viết tắt là Ban Quản lý MBS) là đơn vị sự nghiệp công lập trực thuộc Sở Tài nguyên và Môi trường thành phố Hồ Chí Minh, có tư cách pháp nhân, có con dấu riêng và được mở tài khoản tại Kho bạc Nhà nước và Ngân hàng thương mại theo quy định của pháp luật.
        </p>
        <p class="text-slate-700 leading-relaxed">
          Ban Quản lý MBS chịu sự chỉ đạo, quản lý trực tiếp và toàn diện của Giám đốc Sở Tài nguyên và Môi trường TP.HCM, đồng thời chịu sự hướng dẫn về chuyên môn nghiệp vụ của các Bộ, Ngành Trung ương có liên quan.
        </p>
      </div>
    `,
    metaTitle: 'Giới thiệu chung Ban Quản lý MBS - TP.HCM',
    metaDescription: 'Thông tin giới thiệu chính thức về chức năng, vị trí pháp lý của Ban Quản lý các Khu liên hợp xử lý chất thải TP.HCM.',
  },
  {
    slug: 'chuc-nang-nhiem-vu',
    title: 'Chức năng - Nhiệm vụ chính thức',
    summary: 'Vị trí pháp lý và 4 trụ cột nhiệm vụ trọng tâm trong quản lý hạ tầng và giám sát công tác xử lý chất thải TP.HCM.',
    content: `
      <div class="space-y-6">
        <div class="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
          <h4 class="font-bold text-emerald-900 text-base mb-1">Chức năng Tổng quát</h4>
          <p class="text-xs text-emerald-800 leading-relaxed">
            Giúp Giám đốc Sở TN&MT tổ chức thực hiện công tác quản lý hạ tầng kỹ thuật, giám sát các hoạt động xử lý rác thải sinh hoạt, chất thải công nghiệp và nguy hại tại các Khu liên hợp xử lý rác của Thành phố.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="p-4 border border-slate-200 rounded-xl bg-white space-y-2">
            <h5 class="font-bold text-slate-900 text-sm">1. Quản lý Quy hoạch & Hạ tầng</h5>
            <p class="text-xs text-slate-600 leading-relaxed">Tổ chức quản lý, giám sát đầu tư xây dựng hạ tầng dùng chung tại Đa Phước và Phước Hiệp.</p>
          </div>
          <div class="p-4 border border-slate-200 rounded-xl bg-white space-y-2">
            <h5 class="font-bold text-slate-900 text-sm">2. Giám sát Vận hành 24/7</h5>
            <p class="text-xs text-slate-600 leading-relaxed">Kiểm soát luồng phương tiện vận chuyển, khối lượng tiếp nhận rác và chất lượng xử lý của các nhà máy.</p>
          </div>
          <div class="p-4 border border-slate-200 rounded-xl bg-white space-y-2">
            <h5 class="font-bold text-slate-900 text-sm">3. Quan trắc & Bảo vệ Môi trường</h5>
            <p class="text-xs text-slate-600 leading-relaxed">Đo đạc chỉ số môi trường không khí, nước ngầm, nước rỉ rác định kỳ bảo đảm tiêu chuẩn Cột A.</p>
          </div>
          <div class="p-4 border border-slate-200 rounded-xl bg-white space-y-2">
            <h5 class="font-bold text-slate-900 text-sm">4. Đề án Chuyển đổi Công nghệ</h5>
            <p class="text-xs text-slate-600 leading-relaxed">Thúc đẩy lộ trình chuyển đổi rác chôn lấp sang công nghệ Đốt rác phát điện (Waste-to-Energy).</p>
          </div>
        </div>
      </div>
    `,
    metaTitle: 'Chức năng Nhiệm vụ - Ban Quản lý MBS',
    metaDescription: 'Chi tiết chức năng nhiệm vụ quản lý hạ tầng kỹ thuật và giám sát tiếp nhận xử lý rác thải TP.HCM.',
  },
  {
    slug: 'co-cau-to-chuc',
    title: 'Cơ cấu sơ đồ tổ chức bộ máy',
    summary: 'Cơ cấu bộ máy Ban Giám đốc, các phòng ban chuyên môn và Trạm giám sát hiện trường 24/7.',
    content: `
      <div class="space-y-4">
        <h3 class="text-xl font-bold text-slate-900">Sơ đồ Bộ máy Tổ chức Ban Quản lý MBS</h3>
        <p class="text-slate-700 leading-relaxed">
          Bộ máy Ban Quản lý MBS bao gồm Ban Giám đốc (Trưởng ban và các Phó Trưởng ban), 4 Phòng Chuyên môn nghiệp vụ và 2 Trạm Giám sát Hiện trường trực tiếp tại Khu liên hợp xử lý rác Đa Phước (Bình Chánh) & Phước Hiệp (Củ Chi).
        </p>
      </div>
    `,
    metaTitle: 'Sơ đồ Cơ cấu Tổ chức - Ban Quản lý MBS',
    metaDescription: 'Sơ đồ tổ chức bộ máy lãnh đạo và danh mục phòng ban chuyên môn Ban Quản lý MBS.',
  },
  {
    slug: 'danh-ba-can-bo',
    title: 'Danh bạ điện tử cán bộ',
    summary: 'Tra cứu số điện thoại nội bộ và thư điện tử công vụ cán bộ các phòng ban chuyên môn.',
    content: `
      <div class="space-y-4">
        <h3 class="text-xl font-bold text-slate-900">Danh bạ Điện tử Cán bộ - Phòng ban Chuyên môn</h3>
        <p class="text-slate-700 leading-relaxed">
          Tra cứu số điện thoại làm việc và hộp thư điện tử công vụ của cán bộ Ban Giám đốc và các phòng ban trực thuộc Ban Quản lý MBS.
        </p>
      </div>
    `,
    metaTitle: 'Danh bạ Điện tử Cán bộ - Ban Quản lý MBS',
    metaDescription: 'Danh bạ điện tử tra cứu thông tin cán bộ Ban Quản lý MBS.',
  },
];

// Helper auto-seed nếu CSDL trống hoặc thiếu trang
async function ensureDefaultPagesSeeded() {
  try {
    for (const item of DEFAULT_PAGES) {
      const existing = await (prisma as any).staticPage.findUnique({ where: { slug: item.slug } });
      if (!existing) {
        await (prisma as any).staticPage.create({ data: item });
      }
    }
  } catch (err) {
    console.error('Auto-seed static pages error:', err);
  }
}

// GET /api/v1/pages - Get all static pages from PostgreSQL DB
pagesRouter.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    await ensureDefaultPagesSeeded();
    const cacheKey = 'pages:list:all';
    const cached = redisService.get<any>(cacheKey);
    if (cached) {
      return sendApiResponse(res, cached, 'Danh sách trang tĩnh (Cache)');
    }

    const pages = await (prisma as any).staticPage.findMany({
      orderBy: { createdAt: 'asc' },
    });

    redisService.set(cacheKey, pages, 300);
    return sendApiResponse(res, pages, 'Danh sách trang tĩnh từ CSDL PostgreSQL thành công');
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/pages - Create new static page (SUPER_ADMIN, ADMIN, EDITOR_LEAD)
pagesRouter.post('/', JwtAuthGuard, RolesGuard(['SUPER_ADMIN', 'ADMIN', 'EDITOR_LEAD']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, slug, summary, content, metaTitle, metaDescription } = req.body;
    if (!title || !content) {
      return res.status(400).json({
        type: 'https://mbs.hochiminhcity.gov.vn/errors/bad-request',
        title: 'Bad Request',
        status: 400,
        detail: 'Tiêu đề và nội dung trang tĩnh là các trường bắt buộc.',
        instance: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }

    const cleanSlug = (slug || title)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    const existing = await (prisma as any).staticPage.findFirst({
      where: { slug: cleanSlug },
    });

    if (existing) {
      return res.status(400).json({
        type: 'https://mbs.hochiminhcity.gov.vn/errors/bad-request',
        title: 'Bad Request',
        status: 400,
        detail: `Đường dẫn tĩnh (Slug) '${cleanSlug}' đã tồn tại trong CSDL PostgreSQL.`,
        instance: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }

    const created = await (prisma as any).staticPage.create({
      data: {
        title,
        slug: cleanSlug,
        summary: summary || title,
        content: sanitizeHtmlContent(content),
        metaTitle,
        metaDescription,
        updatedById: req.user!.id,
      },
    });

    redisService.clearPattern('pages:');
    return sendApiResponse(res, created, 'Tạo trang tĩnh mới vào CSDL PostgreSQL thành công', 201);
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/pages/:slug - Get single static page details by slug or id
pagesRouter.get('/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await ensureDefaultPagesSeeded();
    const { slug } = req.params;
    const cacheKey = `pages:detail:${slug}`;
    const cached = redisService.get<any>(cacheKey);
    if (cached) {
      return sendApiResponse(res, cached, 'Chi tiết trang tĩnh (Cache)');
    }

    const page = await (prisma as any).staticPage.findFirst({
      where: {
        OR: [{ slug }, { id: slug }],
      },
    });

    if (!page) {
      return res.status(404).json({
        type: 'https://mbs.hochiminhcity.gov.vn/errors/not-found',
        title: 'Not Found',
        status: 404,
        detail: `Không tìm thấy nội dung trang tĩnh với mã '${slug}' trong CSDL PostgreSQL.`,
        instance: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }

    redisService.set(cacheKey, page, 300);
    return sendApiResponse(res, page, 'Chi tiết nội dung trang tĩnh từ CSDL PostgreSQL');
  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/pages/:slug - Update static page content (SUPER_ADMIN, ADMIN, EDITOR_LEAD)
pagesRouter.put('/:slug', JwtAuthGuard, RolesGuard(['SUPER_ADMIN', 'ADMIN', 'EDITOR_LEAD']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const { title, summary, content, metaTitle, metaDescription } = req.body;

    const existing = await (prisma as any).staticPage.findFirst({
      where: {
        OR: [{ slug }, { id: slug }],
      },
    });

    if (!existing) {
      return res.status(404).json({
        type: 'https://mbs.hochiminhcity.gov.vn/errors/not-found',
        title: 'Not Found',
        status: 404,
        detail: `Không tìm thấy trang tĩnh với mã '${slug}' để cập nhật.`,
        instance: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }

    const updateData: any = {
      updatedById: req.user!.id,
    };

    if (title) updateData.title = title;
    if (summary !== undefined) updateData.summary = summary;
    if (content !== undefined) updateData.content = sanitizeHtmlContent(content);
    if (metaTitle !== undefined) updateData.metaTitle = metaTitle;
    if (metaDescription !== undefined) updateData.metaDescription = metaDescription;

    const updated = await (prisma as any).staticPage.update({
      where: { id: existing.id },
      data: updateData,
    });

    // Clear Redis Cache
    redisService.clearPattern('pages:');

    return sendApiResponse(res, updated, 'Cập nhật nội dung trang tĩnh thành công vào CSDL PostgreSQL');
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/pages/:slug - Delete static page (SUPER_ADMIN, ADMIN)
pagesRouter.delete('/:slug', JwtAuthGuard, RolesGuard(['SUPER_ADMIN', 'ADMIN']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const existing = await (prisma as any).staticPage.findFirst({
      where: {
        OR: [{ slug }, { id: slug }],
      },
    });

    if (!existing) {
      return res.status(404).json({
        type: 'https://mbs.hochiminhcity.gov.vn/errors/not-found',
        title: 'Not Found',
        status: 404,
        detail: `Không tìm thấy trang tĩnh với mã '${slug}' để xóa.`,
        instance: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }

    await (prisma as any).staticPage.delete({
      where: { id: existing.id },
    });

    redisService.clearPattern('pages:');
    return sendApiResponse(res, { id: existing.id, slug: existing.slug }, 'Đã xóa trang tĩnh thành công khỏi CSDL PostgreSQL');
  } catch (error) {
    next(error);
  }
});
