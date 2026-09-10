import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '@mbs/database';
import { sendApiResponse } from '../../common/interceptors/response.interceptor';
import { redisService } from '../../common/services/redis.service';
import { JwtAuthGuard, OptionalJwtAuthGuard, RolesGuard, PermissionGuard } from '../../common/guards/roles.guard';
import { sanitizeHtmlContent } from '../../common/utils/sanitize.helper';
import { NotificationService } from '../notifications/notification.service';
import { NotificationType } from '@mbs/database';

export const postsRouter = Router();

// Auto-publish overdue scheduled posts helper
const checkAndPublishScheduledPosts = async () => {
  try {
    const overduePosts = await prisma.post.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledPublishAt: { lte: new Date() },
        isDeleted: false,
      },
    });

    for (const p of overduePosts) {
      await prisma.post.update({
        where: { id: p.id },
        data: {
          status: 'PUBLISHED',
          publishedAt: p.scheduledPublishAt || new Date(),
          currentStep: 4,
        },
      });

      await prisma.postWorkflowLog.create({
        data: {
          postId: p.id,
          step: 4,
          stepName: '4. Xuất bản Cổng thông tin',
          action: 'AUTO_PUBLISH',
          actorId: p.assignedToId || p.authorId,
          actorName: p.assignedToName || 'Hệ thống tự động',
          actorRole: 'SYSTEM',
          note: `Đã tự động xuất bản công khai theo lịch hẹn: ${p.scheduledPublishAt ? new Date(p.scheduledPublishAt).toLocaleString('vi-VN') : ''}`,
        },
      }).catch(() => {});
    }

    if (overduePosts.length > 0) {
      redisService.clearPattern('posts:list:');
    }
  } catch (err) {
    console.error('Lỗi tự động xuất bản bài viết hẹn giờ:', err);
  }
};

// GET /api/v1/posts - Paginated articles list with Redis caching from PostgreSQL DB
postsRouter.get('/', OptionalJwtAuthGuard, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await checkAndPublishScheduledPosts();

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const categorySlug = req.query.category as string;
    const status = req.query.status as string;
    const scope = req.query.scope as string; // 'mine', 'assigned', 'all'
    const authorId = req.query.authorId as string;

    const whereClause: any = {
      isDeleted: false,
    };

    if (categorySlug) {
      whereClause.category = { slug: categorySlug };
    }

    // Scope filter:
    if (scope === 'assigned' && req.user) {
      whereClause.assignedToId = req.user.id;
    } else if (authorId) {
      whereClause.authorId = authorId;
    } else if (scope === 'mine' && req.user) {
      whereClause.authorId = req.user.id;
    } else if (req.user && req.user.role === 'EDITOR' && scope !== 'all') {
      whereClause.authorId = req.user.id;
    }

    // DRAFT PRIVACY & PENDING WORKFLOW FILTER POLICY:
    if (status === 'DRAFT') {
      if (req.user) {
        whereClause.status = 'DRAFT';
        whereClause.authorId = req.user.id;
      } else {
        whereClause.status = 'DRAFT';
        whereClause.authorId = 'impossible_unauthenticated_author_id';
      }
    } else if (status === 'pending' || status === 'PENDING_REVIEW' || status === 'PENDING_APPROVAL') {
      whereClause.status = { in: ['SUBMITTED', 'IN_EDITING', 'PENDING_APPROVAL', 'PENDING_REVIEW'] };
    } else if (status && status !== 'all') {
      whereClause.status = status as any;
    } else {
      // Exclude DRAFT posts belonging to other users
      if (req.user) {
        whereClause.OR = [
          { status: { not: 'DRAFT' } },
          { status: 'DRAFT', authorId: req.user.id },
        ];
      } else {
        whereClause.status = { not: 'DRAFT' };
      }
    }

    const currentUserId = req.user?.id || 'guest';
    const cacheKey = `posts:list:${categorySlug || 'all'}:${status || 'all'}:${scope || 'default'}:${currentUserId}:${whereClause.authorId || 'all'}:${page}:${limit}`;

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
          workflowLogs: {
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
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
postsRouter.get('/:identifier', OptionalJwtAuthGuard, async (req: Request, res: Response, next: NextFunction) => {
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
        workflowLogs: { orderBy: { createdAt: 'asc' } },
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

    // Strict Draft Privacy Check: Only the author can view their own draft post
    if (post.status === 'DRAFT') {
      if (!req.user || req.user.id !== post.authorId) {
        return res.status(403).json({
          type: 'https://mbs.hochiminhcity.gov.vn/errors/forbidden',
          title: 'Forbidden',
          status: 403,
          detail: 'Bản nháp này là riêng tư và chỉ có tác giả tạo ra mới có quyền xem.',
          instance: req.originalUrl,
          timestamp: new Date().toISOString(),
        });
      }
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

// GET /api/v1/posts/:id/workflow-logs - Audit lineage history logs
postsRouter.get('/:id/workflow-logs', JwtAuthGuard, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const logs = await prisma.postWorkflowLog.findMany({
      where: { postId: id },
      orderBy: { createdAt: 'asc' },
    });
    return sendApiResponse(res, logs, 'Lịch sử quy trình 5 bước thành công');
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/posts - Create new article in DRAFT in PostgreSQL DB (Step 1)
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
        assignedToId: req.user!.id,
        assignedToName: req.user!.fullName || req.user!.email,
        currentStep: 1,
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

    await prisma.postWorkflowLog.create({
      data: {
        postId: post.id,
        step: 1,
        stepName: '1. Khởi tạo & Cam kết',
        action: 'CREATE',
        actorId: req.user!.id,
        actorName: req.user!.fullName || req.user!.email,
        actorRole: req.user!.role,
        assignedToId: req.user!.id,
        assignedToName: req.user!.fullName || req.user!.email,
        note: 'Tác giả tạo bài viết nháp ban đầu',
      },
    }).catch(() => {});

    await prisma.postHistory.create({
      data: {
        postId: post.id,
        version: 1,
        title: post.title,
        summary: post.summary,
        content: post.content,
        updatedById: req.user!.id,
      },
    }).catch(() => {});

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
      isSafetyCommitted, attachments, royaltyScore, royaltyNotes, approvalNotes, unpublishReason,
      assignedToId, assignedToName
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
    if (assignedToId !== undefined) updateData.assignedToId = assignedToId;
    if (assignedToName !== undefined) updateData.assignedToName = assignedToName;
    if (royaltyScore !== undefined) {
      updateData.royaltyScore = royaltyScore ? parseInt(royaltyScore) : null;
      if (royaltyScore && ['SUPER_ADMIN', 'ADMIN', 'APPROVER', 'EDITOR_LEAD'].includes(req.user!.role)) {
        updateData.scoredById = req.user!.id;
        updateData.scoredByName = req.user!.fullName || req.user!.email || 'Lãnh đạo phê duyệt';
        updateData.scoredAt = new Date();
      }
    }
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

    redisService.clearPattern('posts:list:');
    return sendApiResponse(res, updatedPost, 'Cập nhật bài viết thành công');
  } catch (error) {
    next(error);
  }
});

// BƯỚC 1: PATCH /api/v1/posts/:id/submit - Gửi bài từ DRAFT sang SUBMITTED (Phân công Thư ký Bước 2)
postsRouter.patch('/:id/submit', JwtAuthGuard, PermissionGuard('posts:create'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { isSafetyCommitted, nextAssigneeId, nextAssigneeName } = req.body;

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

    // Resolve assignee name if not supplied
    let targetAssigneeName = nextAssigneeName;
    if (nextAssigneeId && !targetAssigneeName) {
      const u = await prisma.user.findUnique({ where: { id: nextAssigneeId } });
      targetAssigneeName = u?.fullName || u?.email || 'Thư ký biên tập';
    }

    const post = await prisma.post.update({
      where: { id },
      data: {
        status: 'SUBMITTED',
        isSafetyCommitted: true,
        currentStep: 2,
        assignedToId: nextAssigneeId || req.user!.id,
        assignedToName: targetAssigneeName || req.user!.fullName || req.user!.email,
      },
    });

    await prisma.postWorkflowLog.create({
      data: {
        postId: id,
        step: 1,
        stepName: '1. Khởi tạo & Cam kết',
        action: 'SUBMIT',
        actorId: req.user!.id,
        actorName: req.user!.fullName || req.user!.email,
        actorRole: req.user!.role,
        assignedToId: nextAssigneeId,
        assignedToName: targetAssigneeName,
        note: 'Tác giả đã cam kết bảo mật & chuyển bài viết cho Thư ký biên tập',
        metadata: { isSafetyCommitted: true },
      },
    }).catch(() => {});

    // Notification trigger
    if (nextAssigneeId) {
      NotificationService.createNotification({
        userId: nextAssigneeId,
        type: 'TASK_ASSIGNED',
        title: 'Nhiệm vụ mới: Biên tập bài viết',
        content: `${req.user!.fullName || 'Tác giả'} đã gửi bài viết "${post.title}" để biên tập.`,
        linkUrl: '/admin/posts',
        metadata: { postId: id, step: 2 },
      }).catch((err) => console.error('Lỗi tạo thông báo submit post:', err));
    } else {
      prisma.user.findMany({
        where: { role: { in: ['EDITOR_LEAD', 'APPROVER', 'ADMIN', 'SUPER_ADMIN'] } },
        select: { id: true },
      }).then((approvers) => {
        approvers.forEach((u) => {
          NotificationService.createNotification({
            userId: u.id,
            type: 'TASK_ASSIGNED',
            title: 'Nhiệm vụ mới: Biên tập bài viết',
            content: `${req.user!.fullName || 'Tác giả'} đã gửi bài viết "${post.title}" vào hàng đợi biên tập.`,
            linkUrl: '/admin/posts',
            metadata: { postId: id, step: 2 },
          }).catch(() => {});
        });
      }).catch(() => {});
    }

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
      data: {
        status: 'IN_EDITING',
        currentStep: 2,
        assignedToId: req.user!.id,
        assignedToName: req.user!.fullName || req.user!.email,
      },
    });

    await prisma.postWorkflowLog.create({
      data: {
        postId: id,
        step: 2,
        stepName: '2. Thư ký biên tập',
        action: 'START_EDITING',
        actorId: req.user!.id,
        actorName: req.user!.fullName || req.user!.email,
        actorRole: req.user!.role,
        assignedToId: req.user!.id,
        assignedToName: req.user!.fullName || req.user!.email,
        note: 'Thư ký biên tập đã chính thức tiếp nhận bài viết',
      },
    }).catch(() => {});

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
    const { isFeatured, isSpotlight, categoryId, nextAssigneeId, nextAssigneeName } = req.body;

    let targetAssigneeName = nextAssigneeName;
    if (nextAssigneeId && !targetAssigneeName) {
      const u = await prisma.user.findUnique({ where: { id: nextAssigneeId } });
      targetAssigneeName = u?.fullName || u?.email || 'Lãnh đạo phê duyệt';
    }

    const updateData: any = {
      status: 'PENDING_APPROVAL',
      currentStep: 3,
      assignedToId: nextAssigneeId || req.user!.id,
      assignedToName: targetAssigneeName || req.user!.fullName || req.user!.email,
    };
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
    if (isSpotlight !== undefined) updateData.isSpotlight = isSpotlight;
    if (categoryId) updateData.categoryId = categoryId;

    const post = await prisma.post.update({
      where: { id },
      data: updateData,
    });

    await prisma.postWorkflowLog.create({
      data: {
        postId: id,
        step: 2,
        stepName: '2. Thư ký biên tập',
        action: 'SUBMIT_APPROVAL',
        actorId: req.user!.id,
        actorName: req.user!.fullName || req.user!.email,
        actorRole: req.user!.role,
        assignedToId: nextAssigneeId,
        assignedToName: targetAssigneeName,
        note: 'Thư ký đã hoàn thành biên tập và trình Lãnh đạo phê duyệt',
      },
    }).catch(() => {});

    // Notification trigger
    if (nextAssigneeId) {
      NotificationService.createNotification({
        userId: nextAssigneeId,
        type: 'TASK_ASSIGNED',
        title: 'Nhiệm vụ mới: Phê duyệt bài viết',
        content: `${req.user!.fullName || 'Thư ký'} đã trình duyệt bài viết "${post.title}".`,
        linkUrl: '/admin/posts',
        metadata: { postId: id, step: 3 },
      }).catch((err) => console.error('Lỗi tạo thông báo submit-approval post:', err));
    } else {
      prisma.user.findMany({
        where: { role: { in: ['APPROVER', 'ADMIN', 'SUPER_ADMIN'] } },
        select: { id: true },
      }).then((leaders) => {
        leaders.forEach((u) => {
          NotificationService.createNotification({
            userId: u.id,
            type: 'TASK_ASSIGNED',
            title: 'Nhiệm vụ mới: Phê duyệt bài viết',
            content: `${req.user!.fullName || 'Thư ký'} đã trình duyệt bài viết "${post.title}".`,
            linkUrl: '/admin/posts',
            metadata: { postId: id, step: 3 },
          }).catch(() => {});
        });
      }).catch(() => {});
    }

    redisService.clearPattern('posts:list:');
    return sendApiResponse(res, post, 'Đã trình Lãnh đạo phê duyệt bài viết (PENDING_APPROVAL)');
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/posts/:id/return - Trả bài viết về cho Tác giả sửa (SUBMITTED/IN_EDITING/PENDING_APPROVAL -> DRAFT)
postsRouter.patch('/:id/return', JwtAuthGuard, RolesGuard(['SUPER_ADMIN', 'ADMIN', 'APPROVER', 'EDITOR_LEAD']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        type: 'https://mbs.hochiminhcity.gov.vn/errors/bad-request',
        title: 'Bad Request',
        status: 400,
        detail: 'Vui lòng nhập lý do trả lại bài viết cho tác giả.',
        instance: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }

    const existingPost = await prisma.post.findUnique({
      where: { id },
      include: { author: true },
    });

    const post = await prisma.post.update({
      where: { id },
      data: {
        status: 'DRAFT',
        currentStep: 1,
        assignedToId: existingPost?.authorId,
        assignedToName: existingPost?.author?.fullName || existingPost?.author?.email,
        rejectionReason: reason.trim(),
      },
    });

    await prisma.postWorkflowLog.create({
      data: {
        postId: id,
        step: 3,
        stepName: '3. Lãnh đạo Duyệt & Chấm nhuận bút',
        action: 'RETURN',
        actorId: req.user!.id,
        actorName: req.user!.fullName || req.user!.email,
        actorRole: req.user!.role,
        assignedToId: existingPost?.authorId,
        assignedToName: existingPost?.author?.fullName || existingPost?.author?.email,
        note: `Trả lại bài viết cho Tác giả chỉnh sửa. Lý do: ${reason.trim()}`,
      },
    }).catch(() => {});

    // Notification trigger to Author
    if (existingPost?.authorId) {
      NotificationService.createNotification({
        userId: existingPost.authorId,
        type: 'POST_REJECTED',
        title: 'Bài viết bị trả về để chỉnh sửa',
        content: `Bài viết "${existingPost.title}" đã bị trả về. Lý do: ${reason.trim()}`,
        linkUrl: '/admin/posts',
        metadata: { postId: id, reason: reason.trim() },
      }).catch((err) => console.error('Lỗi tạo thông báo return post:', err));
    }

    redisService.clearPattern('posts:list:');
    return sendApiResponse(res, post, 'Đã trả bài viết về cho tác giả chỉnh sửa (DRAFT)');
  } catch (error) {
    next(error);
  }
});

// BƯỚC 3: PATCH /api/v1/posts/:id/approve - Lãnh đạo phê duyệt bài & chấm nhuận bút (PENDING_APPROVAL -> APPROVED, REJECTED hoặc RETURN)
postsRouter.patch('/:id/approve', JwtAuthGuard, RolesGuard(['SUPER_ADMIN', 'ADMIN', 'APPROVER', 'EDITOR_LEAD']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { action, reason, approvalNotes, royaltyScore, royaltyNotes, autoPublish, nextAssigneeId, nextAssigneeName } = req.body;

    if (!action || !['APPROVE', 'REJECT', 'RETURN'].includes(action)) {
      return res.status(400).json({
        type: 'https://mbs.hochiminhcity.gov.vn/errors/bad-request',
        title: 'Bad Request',
        status: 400,
        detail: 'Hành động phê duyệt phải là APPROVE, REJECT hoặc RETURN.',
        instance: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }

    let targetStatus: any = 'APPROVED';
    let targetStep = 4;

    if (action === 'APPROVE') {
      targetStatus = autoPublish ? 'PUBLISHED' : 'APPROVED';
    } else if (action === 'REJECT') {
      targetStatus = 'REJECTED';
      targetStep = 3;
    } else if (action === 'RETURN') {
      targetStatus = 'DRAFT';
      targetStep = 1;
    }

    let targetAssigneeName = nextAssigneeName;
    if (nextAssigneeId && !targetAssigneeName) {
      const u = await prisma.user.findUnique({ where: { id: nextAssigneeId } });
      targetAssigneeName = u?.fullName || u?.email || 'Cán bộ xuất bản';
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        status: targetStatus,
        currentStep: targetStep,
        assignedToId: action === 'APPROVE' ? (nextAssigneeId || req.user!.id) : undefined,
        assignedToName: action === 'APPROVE' ? (targetAssigneeName || req.user!.fullName || req.user!.email) : undefined,
        approvalNotes: approvalNotes || null,
        royaltyScore: action === 'APPROVE' ? (royaltyScore ? parseInt(royaltyScore) : null) : undefined,
        royaltyNotes: action === 'APPROVE' ? (royaltyNotes || null) : undefined,
        scoredById: action === 'APPROVE' ? req.user!.id : undefined,
        scoredByName: action === 'APPROVE' ? (req.user!.fullName || req.user!.email || 'Lãnh đạo phê duyệt') : undefined,
        scoredAt: action === 'APPROVE' ? new Date() : undefined,
        rejectionReason: (action === 'REJECT' || action === 'RETURN') ? reason || 'Chưa đạt yêu cầu biên tập' : null,
        publishedAt: action === 'APPROVE' && autoPublish ? new Date() : null,
      },
    });

    await prisma.postWorkflowLog.create({
      data: {
        postId: id,
        step: 3,
        stepName: '3. Lãnh đạo Duyệt & Chấm nhuận bút',
        action: action,
        actorId: req.user!.id,
        actorName: req.user!.fullName || req.user!.email,
        actorRole: req.user!.role,
        assignedToId: nextAssigneeId,
        assignedToName: targetAssigneeName,
        note: action === 'APPROVE' ? (approvalNotes || 'Lãnh đạo đã phê duyệt bài viết và chấm nhuận bút') : (reason || 'Từ chối/Trả bài'),
        metadata: action === 'APPROVE' ? { royaltyScore, royaltyNotes, approvalNotes } : { reason },
      },
    }).catch(() => {});

    // Notification trigger based on action
    if (action === 'APPROVE') {
      if (updatedPost.authorId) {
        NotificationService.createNotification({
          userId: updatedPost.authorId,
          type: 'POST_APPROVED',
          title: 'Bài viết đã được phê duyệt',
          content: `Bài viết "${updatedPost.title}" đã được Lãnh đạo phê duyệt!${royaltyScore ? ` (Nhuận bút: ${royaltyScore} điểm)` : ''}`,
          linkUrl: '/admin/posts',
          metadata: { postId: id, royaltyScore },
        }).catch((err) => console.error('Lỗi tạo thông báo approve post:', err));
      }
      if (nextAssigneeId) {
        NotificationService.createNotification({
          userId: nextAssigneeId,
          type: 'TASK_ASSIGNED',
          title: 'Nhiệm vụ mới: Xuất bản bài viết',
          content: `Bài viết "${updatedPost.title}" đã được duyệt và phân công cho bạn xuất bản.`,
          linkUrl: '/admin/posts',
          metadata: { postId: id, step: 4 },
        }).catch(() => {});
      }
    } else if (action === 'REJECT') {
      if (updatedPost.authorId) {
        NotificationService.createNotification({
          userId: updatedPost.authorId,
          type: 'POST_REJECTED',
          title: 'Bài viết bị từ chối phê duyệt',
          content: `Bài viết "${updatedPost.title}" đã bị từ chối. Lý do: ${reason || 'Không đạt yêu cầu'}`,
          linkUrl: '/admin/posts',
          metadata: { postId: id, reason },
        }).catch((err) => console.error('Lỗi tạo thông báo reject post:', err));
      }
    } else if (action === 'RETURN') {
      if (updatedPost.authorId) {
        NotificationService.createNotification({
          userId: updatedPost.authorId,
          type: 'POST_REJECTED',
          title: 'Bài viết bị trả về để chỉnh sửa',
          content: `Bài viết "${updatedPost.title}" đã bị trả về. Lý do: ${reason || 'Yêu cầu sửa đổi'}`,
          linkUrl: '/admin/posts',
          metadata: { postId: id, reason },
        }).catch((err) => console.error('Lỗi tạo thông báo return post:', err));
      }
    }

    redisService.clearPattern('posts:list:');
    const msg = action === 'APPROVE' ? 'Lãnh đạo đã phê duyệt bài viết và chấm nhuận bút (APPROVED)' : action === 'RETURN' ? 'Đã trả lại bài viết về cho tác giả chỉnh sửa' : 'Bài viết đã bị từ chối';
    return sendApiResponse(res, updatedPost, msg);
  } catch (error) {
    next(error);
  }
});

// BƯỚC 4: PATCH /api/v1/posts/:id/publish - Kích hoạt xuất bản / Hẹn giờ xuất bản bài viết
postsRouter.patch('/:id/publish', JwtAuthGuard, RolesGuard(['SUPER_ADMIN', 'ADMIN', 'APPROVER', 'EDITOR_LEAD']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { scheduledPublishAt } = req.body;

    let targetStatus: any = 'PUBLISHED';
    let isScheduled = false;
    let scheduledDate: Date | null = null;

    if (scheduledPublishAt) {
      const parsedDate = new Date(scheduledPublishAt);
      if (!isNaN(parsedDate.getTime()) && parsedDate > new Date()) {
        targetStatus = 'SCHEDULED';
        isScheduled = true;
        scheduledDate = parsedDate;
      }
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        status: targetStatus,
        currentStep: 4,
        publishedAt: isScheduled ? null : new Date(),
        scheduledPublishAt: scheduledDate,
      },
      include: {
        author: { select: { id: true, fullName: true, email: true } },
      },
    });

    await prisma.postWorkflowLog.create({
      data: {
        postId: id,
        step: 4,
        stepName: '4. Xuất bản Cổng thông tin',
        action: isScheduled ? 'SCHEDULE_PUBLISH' : 'PUBLISH',
        actorId: req.user!.id,
        actorName: req.user!.fullName || req.user!.email,
        actorRole: req.user!.role,
        note: isScheduled
          ? `Đã hẹn giờ xuất bản công khai vào lúc: ${scheduledDate?.toLocaleString('vi-VN')}`
          : 'Đã xuất bản bài viết công khai ngay trên Portal',
        metadata: isScheduled ? { scheduledPublishAt } : undefined,
      },
    }).catch(() => {});

    // Notification trigger to Author
    if (updatedPost.authorId) {
      NotificationService.createNotification({
        userId: updatedPost.authorId,
        type: 'POST_APPROVED',
        title: isScheduled ? 'Bài viết đã được hẹn giờ xuất bản' : 'Bài viết đã được xuất bản công khai',
        content: isScheduled
          ? `Bài viết "${updatedPost.title}" đã được hẹn giờ xuất bản vào lúc ${scheduledDate?.toLocaleString('vi-VN')}`
          : `Bài viết "${updatedPost.title}" đã được xuất bản ra Cổng thông tin công khai!`,
        linkUrl: `/tin-tuc/${updatedPost.slug}`,
        metadata: { postId: id, isScheduled, scheduledPublishAt },
      }).catch((err) => console.error('Lỗi tạo thông báo publish post:', err));
    }

    redisService.clearPattern('posts:list:');
    const msg = isScheduled
      ? `Đã hẹn giờ xuất bản bài viết vào lúc ${scheduledDate?.toLocaleString('vi-VN')}`
      : 'Đã xuất bản bài viết ra Cổng thông tin (PUBLISHED)';
    return sendApiResponse(res, updatedPost, msg);
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
        currentStep: 5,
        unpublishReason: reason.trim(),
        unpublishedAt: new Date(),
        unpublishedById: req.user!.id,
      },
    });

    await prisma.postWorkflowLog.create({
      data: {
        postId: id,
        step: 5,
        stepName: '5. Thu hồi khẩn cấp',
        action: 'UNPUBLISH',
        actorId: req.user!.id,
        actorName: req.user!.fullName || req.user!.email,
        actorRole: req.user!.role,
        note: `Gỡ bài khẩn cấp. Lý do: ${reason.trim()}`,
      },
    }).catch(() => {});

    // Notification trigger to Author
    if (updatedPost.authorId) {
      NotificationService.createNotification({
        userId: updatedPost.authorId,
        type: 'SYSTEM_ALERT',
        title: 'Bài viết bị thu hồi/gỡ khẩn cấp',
        content: `Bài viết "${updatedPost.title}" đã bị thu hồi khỏi Cổng thông tin. Lý do: ${reason.trim()}`,
        linkUrl: '/admin/posts',
        metadata: { postId: id, reason: reason.trim() },
      }).catch((err) => console.error('Lỗi tạo thông báo unpublish post:', err));
    }

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
