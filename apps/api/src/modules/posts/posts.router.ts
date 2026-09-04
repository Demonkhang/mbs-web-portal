import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '@mbs/database';
import { sendApiResponse } from '../../common/interceptors/response.interceptor';
import { redisService } from '../../common/services/redis.service';
import { JwtAuthGuard, OptionalJwtAuthGuard, RolesGuard, PermissionGuard } from '../../common/guards/roles.guard';
import { sanitizeHtmlContent } from '../../common/utils/sanitize.helper';

export const postsRouter = Router();

// GET /api/v1/posts - Paginated articles list with Redis caching from PostgreSQL DB
postsRouter.get('/', OptionalJwtAuthGuard, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const categorySlug = req.query.category as string;
    const status = req.query.status as string;
    const scope = req.query.scope as string; // 'mine' or 'all'
    const authorId = req.query.authorId as string;

    const whereClause: any = {
      isDeleted: false,
    };

    if (status) {
      whereClause.status = status as any;
    }

    if (categorySlug) {
      whereClause.category = { slug: categorySlug };
    }

    // Filter by author:
    // If authorId is explicitly supplied, filter by it.
    // If scope === 'mine' OR if logged-in user is EDITOR (and hasn't explicitly asked for all), filter by user ID.
    if (authorId) {
      whereClause.authorId = authorId;
    } else if (scope === 'mine' && req.user) {
      whereClause.authorId = req.user.id;
    } else if (req.user && req.user.role === 'EDITOR' && scope !== 'all') {
      whereClause.authorId = req.user.id;
    }

    const cacheKey = `posts:list:${categorySlug || 'all'}:${status || 'all'}:${scope || 'default'}:${whereClause.authorId || 'all'}:${page}:${limit}`;

    const cachedData = redisService.get<any>(cacheKey);
    if (cachedData) {
      return sendApiResponse(res, cachedData.items, 'Danh sách bài viết (Cache)', 200, cachedData.meta);
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
    redisService.set(cacheKey, { items: posts, meta }, 120);
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
    const {
      title, summary, content, categoryId, imageUrl, imageCaption,
      isFeatured, isSpotlight, tags, metaTitle, metaDescription,
      isSafetyCommitted, attachments
    } = req.body;

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
        isSafetyCommitted: Boolean(isSafetyCommitted),
        attachments: Array.isArray(attachments) ? attachments : [],
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
    return sendApiResponse(res, post, 'Tạo bài viết mới ở trạng thái DRAFT thành công', 201);
  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/posts/:id - Update existing article in PostgreSQL DB
postsRouter.put('/:id', JwtAuthGuard, RolesGuard(['EDITOR', 'EDITOR_LEAD', 'APPROVER', 'ADMIN', 'SUPER_ADMIN']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const {
      title, summary, content, categoryId, imageUrl, imageCaption,
      isFeatured, isSpotlight, tags, metaTitle, metaDescription, status,
      isSafetyCommitted, attachments, royaltyScore, royaltyNotes, approvalNotes, unpublishReason
    } = req.body;

    const existingPost = await prisma.post.findUnique({ where: { id } });
    if (!existingPost || existingPost.isDeleted) {
      return res.status(404).json({
        type: 'https://mbs.hochiminhcity.gov.vn/errors/not-found',
        title: 'Not Found',
        status: 404,
        detail: `Không tìm thấy bài viết với ID '${id}' để cập nhật trong CSDL.`,
        instance: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }

    // Permission check: EDITOR role can only update their own draft/submitted posts
    if (req.user!.role === 'EDITOR' && existingPost.authorId !== req.user!.id) {
      return res.status(403).json({
        type: 'https://mbs.hochiminhcity.gov.vn/errors/forbidden',
        title: 'Forbidden',
        status: 403,
        detail: 'Bạn không có quyền chỉnh sửa bài viết của người khác. Chỉ chính tác giả mới được chỉnh sửa.',
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
    if (isSafetyCommitted !== undefined) updateData.isSafetyCommitted = Boolean(isSafetyCommitted);
    if (attachments !== undefined) updateData.attachments = attachments;
    if (royaltyScore !== undefined) updateData.royaltyScore = royaltyScore ? parseInt(royaltyScore) : null;
    if (royaltyNotes !== undefined) updateData.royaltyNotes = royaltyNotes;
    if (approvalNotes !== undefined) updateData.approvalNotes = approvalNotes;
    if (unpublishReason !== undefined) updateData.unpublishReason = unpublishReason;

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
    return sendApiResponse(res, updatedPost, 'Cập nhật bài viết thành công');
  } catch (error) {
    next(error);
  }
});

// BƯỚC 1: PATCH /api/v1/posts/:id/submit - Gửi bài từ DRAFT sang SUBMITTED (Bắt buộc cam kết an toàn)
postsRouter.patch('/:id/submit', JwtAuthGuard, PermissionGuard('posts:create'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { isSafetyCommitted } = req.body;

    const existingPost = await prisma.post.findUnique({ where: { id } });
    if (!existingPost) {
      return res.status(404).json({ detail: 'Bài viết không tồn tại.' });
    }

    const safetyCheck = isSafetyCommitted !== undefined ? isSafetyCommitted : existingPost.isSafetyCommitted;
    if (!safetyCheck) {
      return res.status(400).json({
        type: 'https://mbs.hochiminhcity.gov.vn/errors/bad-request',
        title: 'Safety Commitment Required',
        status: 400,
        detail: 'Bạn phải tích chọn cam kết nội dung không chứa thông tin bí mật nhà nước trước khi gửi bài.',
        instance: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }

    const post = await prisma.post.update({
      where: { id },
      data: {
        status: 'SUBMITTED',
        isSafetyCommitted: true,
      },
    });

    redisService.clearPattern('posts:list:');
    return sendApiResponse(res, post, 'Đã gửi biên tập bài viết thành công (SUBMITTED)');
  } catch (error) {
    next(error);
  }
});

// BƯỚC 2A: PATCH /api/v1/posts/:id/start-editing - Thư ký biên tập tiếp nhận bài (SUBMITTED -> IN_EDITING)
postsRouter.patch('/:id/start-editing', JwtAuthGuard, PermissionGuard('posts:edit_technical'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const post = await prisma.post.update({
      where: { id },
      data: { status: 'IN_EDITING' },
    });
    redisService.clearPattern('posts:list:');
    return sendApiResponse(res, post, 'Thư ký đã tiếp nhận biên tập bài viết (IN_EDITING)');
  } catch (error) {
    next(error);
  }
});

// BƯỚC 2B: PATCH /api/v1/posts/:id/submit-approval - Thư ký trình Lãnh đạo duyệt (IN_EDITING / SUBMITTED -> PENDING_APPROVAL)
postsRouter.patch('/:id/submit-approval', JwtAuthGuard, PermissionGuard('posts:edit_technical'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { isFeatured, isSpotlight, categoryId } = req.body;

    const updateData: any = { status: 'PENDING_APPROVAL' };
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
    if (isSpotlight !== undefined) updateData.isSpotlight = isSpotlight;
    if (categoryId) updateData.categoryId = categoryId;

    const post = await prisma.post.update({
      where: { id },
      data: updateData,
    });

    redisService.clearPattern('posts:list:');
    return sendApiResponse(res, post, 'Đã trình Lãnh đạo phê duyệt bài viết (PENDING_APPROVAL)');
  } catch (error) {
    next(error);
  }
});

// BƯỚC 3: PATCH /api/v1/posts/:id/approve - Lãnh đạo phê duyệt bài & chấm nhuận bút (PENDING_APPROVAL -> APPROVED hoặc REJECTED)
postsRouter.patch('/:id/approve', JwtAuthGuard, RolesGuard(['SUPER_ADMIN', 'ADMIN', 'APPROVER', 'EDITOR_LEAD']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { action, reason, approvalNotes, royaltyScore, royaltyNotes, autoPublish } = req.body;

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

    let targetStatus: any = action === 'APPROVE' ? (autoPublish ? 'PUBLISHED' : 'APPROVED') : 'REJECTED';

    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        status: targetStatus,
        approvalNotes: approvalNotes || null,
        royaltyScore: royaltyScore ? parseInt(royaltyScore) : null,
        royaltyNotes: royaltyNotes || null,
        rejectionReason: action === 'REJECT' ? reason || 'Chưa đạt yêu cầu biên tập' : null,
        publishedAt: action === 'APPROVE' ? new Date() : null,
      },
    });

    // Notify author if published
    if (targetStatus === 'PUBLISHED') {
      await prisma.auditLog.create({
        data: {
          action: 'POST_PUBLISHED',
          module: 'posts',
          details: `Bài viết '${updatedPost.title}' đã được duyệt và xuất bản bởi ${req.user!.fullName}`,
          userId: req.user!.id,
        },
      }).catch(() => {});
    }

    redisService.clearPattern('posts:list:');
    return sendApiResponse(res, updatedPost, action === 'APPROVE' ? 'Lãnh đạo đã phê duyệt bài viết (APPROVED)' : 'Bài viết đã bị từ chối');
  } catch (error) {
    next(error);
  }
});

// BƯỚC 4: PATCH /api/v1/posts/:id/publish - Kích hoạt xuất bản bài viết (APPROVED -> PUBLISHED)
postsRouter.patch('/:id/publish', JwtAuthGuard, RolesGuard(['SUPER_ADMIN', 'ADMIN', 'APPROVER', 'EDITOR_LEAD']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
      include: {
        author: { select: { id: true, fullName: true, email: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'POST_PUBLISHED',
        module: 'posts',
        details: `Bài viết '${updatedPost.title}' đã xuất bản công khai lên Portal`,
        userId: req.user!.id,
      },
    }).catch(() => {});

    redisService.clearPattern('posts:list:');
    return sendApiResponse(res, updatedPost, 'Đã xuất bản bài viết ra Cổng thông tin (PUBLISHED)');
  } catch (error) {
    next(error);
  }
});

// BƯỚC 5: PATCH /api/v1/posts/:id/unpublish - Thu hồi bài viết khẩn cấp (PUBLISHED -> UNPUBLISHED)
postsRouter.patch('/:id/unpublish', JwtAuthGuard, RolesGuard(['SUPER_ADMIN', 'ADMIN', 'APPROVER', 'EDITOR_LEAD']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        type: 'https://mbs.hochiminhcity.gov.vn/errors/bad-request',
        title: 'Unpublish Reason Required',
        status: 400,
        detail: 'Vui lòng nhập lý do thu hồi/gỡ bài viết khẩn cấp.',
        instance: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        status: 'UNPUBLISHED',
        unpublishReason: reason.trim(),
        unpublishedAt: new Date(),
        unpublishedById: req.user!.id,
      },
    });

    // Record in history log
    await prisma.postHistory.create({
      data: {
        postId: updatedPost.id,
        version: Date.now(),
        title: `[THU HỒI] ${updatedPost.title}`,
        summary: `Lý do gỡ bài: ${reason.trim()}`,
        content: updatedPost.content,
        updatedById: req.user!.id,
      },
    }).catch(() => {});

    await prisma.auditLog.create({
      data: {
        action: 'POST_UNPUBLISHED',
        module: 'posts',
        details: `Thu hồi khẩn cấp bài viết '${updatedPost.title}'. Lý do: ${reason.trim()}`,
        userId: req.user!.id,
      },
    }).catch(() => {});

    redisService.clearPattern('posts:list:');
    return sendApiResponse(res, updatedPost, 'Đã thu hồi bài viết khẩn cấp thành công (UNPUBLISHED)');
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/posts/:id - Soft Delete in PostgreSQL DB
postsRouter.delete('/:id', JwtAuthGuard, PermissionGuard('posts:delete'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const existingPost = await prisma.post.findUnique({ where: { id } });
    if (!existingPost || existingPost.isDeleted) {
      return res.status(404).json({
        type: 'https://mbs.hochiminhcity.gov.vn/errors/not-found',
        title: 'Not Found',
        status: 404,
        detail: `Không tìm thấy bài viết với ID '${id}' để xóa trong CSDL PostgreSQL.`,
        instance: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }

    if (req.user!.role === 'EDITOR' && existingPost.authorId !== req.user!.id) {
      return res.status(403).json({
        type: 'https://mbs.hochiminhcity.gov.vn/errors/forbidden',
        title: 'Forbidden',
        status: 403,
        detail: 'Bạn không có quyền xóa bài viết của người khác.',
        instance: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }

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
