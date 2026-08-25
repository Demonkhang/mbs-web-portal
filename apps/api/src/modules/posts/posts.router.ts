import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '@mbs/database';
import { sendApiResponse } from '../../common/interceptors/response.interceptor';
import { redisService } from '../../common/services/redis.service';
import { JwtAuthGuard, RolesGuard, PermissionGuard } from '../../common/guards/roles.guard';
import { sanitizeHtmlContent } from '../../common/utils/sanitize.helper';

export const postsRouter = Router();

// GET /api/v1/posts - Paginated articles list with Redis caching from PostgreSQL DB
postsRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const categorySlug = req.query.category as string;
    const status = req.query.status as string;
    const cacheKey = `posts:list:${categorySlug || 'all'}:${status || 'all'}:${page}:${limit}`;

    const cachedData = redisService.get<any>(cacheKey);
    if (cachedData) {
      return sendApiResponse(res, cachedData.items, 'Danh sách bài viết (Cache)', 200, cachedData.meta);
    }

    const whereClause: any = {
      isDeleted: false,
    };

    if (status) {
      whereClause.status = status as any;
    }

    if (categorySlug) {
      whereClause.category = { slug: categorySlug };
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: whereClause,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          author: { select: { id: true, fullName: true, avatarUrl: true } },
        },
      }),
      prisma.post.count({ where: whereClause }),
    ]);

    const meta = { page, limit, total, totalPages: Math.ceil(total / limit) || 1 };
    redisService.set(cacheKey, { items: posts, meta }, 300);
    return sendApiResponse(res, posts, 'Danh sách bài viết từ CSDL PostgreSQL thành công', 200, meta);
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/posts/:identifier - Article details by ID or Slug from PostgreSQL DB
postsRouter.get('/:identifier', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { identifier } = req.params;
    const ip = req.ip || '127.0.0.1';

    const post = await prisma.post.findFirst({
      where: {
        isDeleted: false,
        OR: [{ id: identifier }, { slug: identifier }],
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        author: { select: { id: true, fullName: true, department: true } },
      },
    });

    if (!post) {
      return res.status(404).json({
        type: 'https://mbs.hochiminhcity.gov.vn/errors/not-found',
        title: 'Not Found',
        status: 404,
        detail: `Không tìm thấy bài viết với mã hoặc slug '${identifier}' trong CSDL PostgreSQL.`,
        instance: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }

    // Debounce view counter
    const viewLockKey = `viewlock:${post.id}:${ip}`;
    if (!redisService.get(viewLockKey)) {
      redisService.set(viewLockKey, true, 600);
      await prisma.post.update({
        where: { id: post.id },
        data: { views: { increment: 1 } },
      }).catch(() => {});
    }

    return sendApiResponse(res, post, 'Chi tiết bài viết từ CSDL PostgreSQL');
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/posts - Create new article in DRAFT in PostgreSQL DB
postsRouter.post('/', JwtAuthGuard, PermissionGuard('posts:create'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, summary, content, categoryId, imageUrl, imageCaption, isFeatured, isSpotlight, tags, metaTitle, metaDescription } = req.body;

    if (!title || !content || !categoryId) {
      return res.status(400).json({
        type: 'https://mbs.hochiminhcity.gov.vn/errors/bad-request',
        title: 'Bad Request',
        status: 400,
        detail: 'Tiêu đề, nội dung và chuyên mục là các trường bắt buộc.',
        instance: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }

    const sanitizedContent = sanitizeHtmlContent(content);
    const slug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-') + `-${Date.now().toString().slice(-4)}`;

    const post = await prisma.post.create({
      data: {
        slug,
        title,
        summary: summary || title,
        content: sanitizedContent,
        categoryId,
        authorId: req.user!.id,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
        imageCaption,
        isFeatured: isFeatured || false,
        isSpotlight: isSpotlight || false,
        tags: tags || [],
        status: 'DRAFT',
        metaTitle,
        metaDescription,
      },
    });

    await prisma.postHistory.create({
      data: {
        postId: post.id,
        version: 1,
        title: post.title,
        summary: post.summary,
        content: post.content,
        updatedById: req.user!.id,
      },
    });

    redisService.clearPattern('posts:list:');
    return sendApiResponse(res, post, 'Tạo bài viết mới vào CSDL PostgreSQL ở trạng thái DRAFT thành công', 201);
  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/posts/:id - Update existing article in PostgreSQL DB
postsRouter.put('/:id', JwtAuthGuard, RolesGuard(['EDITOR', 'EDITOR_LEAD', 'ADMIN', 'SUPER_ADMIN']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { title, summary, content, categoryId, imageUrl, imageCaption, isFeatured, isSpotlight, tags, metaTitle, metaDescription, status } = req.body;

    const existingPost = await prisma.post.findUnique({ where: { id } });
    if (!existingPost || existingPost.isDeleted) {
      return res.status(404).json({
        type: 'https://mbs.hochiminhcity.gov.vn/errors/not-found',
        title: 'Not Found',
        status: 404,
        detail: `Không tìm thấy bài viết với ID '${id}' để cập nhật trong CSDL PostgreSQL.`,
        instance: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }

    const updateData: any = {};
    if (title) updateData.title = title;
    if (summary !== undefined) updateData.summary = summary;
    if (content !== undefined) updateData.content = sanitizeHtmlContent(content);
    if (categoryId) updateData.categoryId = categoryId;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (imageCaption !== undefined) updateData.imageCaption = imageCaption;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
    if (isSpotlight !== undefined) updateData.isSpotlight = isSpotlight;
    if (tags) updateData.tags = tags;
    if (metaTitle !== undefined) updateData.metaTitle = metaTitle;
    if (metaDescription !== undefined) updateData.metaDescription = metaDescription;
    if (status) updateData.status = status;

    const updatedPost = await prisma.post.update({
      where: { id },
      data: updateData,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        author: { select: { id: true, fullName: true, avatarUrl: true } },
      },
    });

    // Create history entry
    await prisma.postHistory.create({
      data: {
        postId: updatedPost.id,
        version: Date.now(),
        title: updatedPost.title,
        summary: updatedPost.summary,
        content: updatedPost.content,
        updatedById: req.user!.id,
      },
    }).catch(() => {});

    redisService.clearPattern('posts:list:');
    return sendApiResponse(res, updatedPost, 'Cập nhật bài viết thành công trong CSDL PostgreSQL');
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/posts/:id/submit - Submit DRAFT article for approval
postsRouter.patch('/:id/submit', JwtAuthGuard, PermissionGuard('posts:review'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const post = await prisma.post.update({
      where: { id },
      data: { status: 'PENDING_REVIEW' },
    });
    redisService.clearPattern('posts:list:');
    return sendApiResponse(res, post, 'Đã trình duyệt bài viết thành công (PENDING_REVIEW)');
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/posts/:id/approve - Approve or Reject
postsRouter.patch('/:id/approve', JwtAuthGuard, PermissionGuard('posts:approve'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { action, reason } = req.body;

    if (!action || !['APPROVE', 'REJECT'].includes(action)) {
      return res.status(400).json({
        type: 'https://mbs.hochiminhcity.gov.vn/errors/bad-request',
        title: 'Bad Request',
        status: 400,
        detail: 'Hành động phê duyệt phải là APPROVE hoặc REJECT.',
        instance: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }

    const newStatus = action === 'APPROVE' ? 'PUBLISHED' : 'REJECTED';
    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        status: newStatus,
        rejectionReason: action === 'REJECT' ? reason || 'Chưa đạt yêu cầu biên tập' : null,
        publishedAt: action === 'APPROVE' ? new Date() : null,
      },
    });

    redisService.clearPattern('posts:list:');
    return sendApiResponse(res, updatedPost, action === 'APPROVE' ? 'Phê duyệt xuất bản bài viết thành công' : 'Đã hủy bài viết');
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/posts/:id - Soft Delete in PostgreSQL DB
postsRouter.delete('/:id', JwtAuthGuard, PermissionGuard('posts:delete'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.post.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
    });
    redisService.clearPattern('posts:list:');
    return sendApiResponse(res, { id, isDeleted: true }, 'Đã xóa mềm bài viết thành công khỏi CSDL PostgreSQL');
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/posts/:id/history - Get history from PostgreSQL DB
postsRouter.get('/:id/history', JwtAuthGuard, RolesGuard(['EDITOR', 'EDITOR_LEAD', 'ADMIN', 'SUPER_ADMIN']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const history = await prisma.postHistory.findMany({
      where: { postId: id },
      orderBy: { createdAt: 'desc' },
    });
    return sendApiResponse(res, history, 'Lịch sử chỉnh sửa phiên bản bài viết từ CSDL PostgreSQL');
  } catch (error) {
    next(error);
  }
});
