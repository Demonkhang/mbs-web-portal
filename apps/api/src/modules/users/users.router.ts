import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '@mbs/database';
import { sendApiResponse } from '../../common/interceptors/response.interceptor';
import { JwtAuthGuard, OptionalJwtAuthGuard, RolesGuard } from '../../common/guards/roles.guard';

export const usersRouter = Router();

// GET /api/v1/users/me - Retrieve current logged in user profile from PostgreSQL DB
usersRouter.get('/me', OptionalJwtAuthGuard, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    let dbUser: any = null;
    if (userId) {
      dbUser = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          email: true,
          fullName: true,
          role: true,
          department: true,
          avatarUrl: true,
          isActive: true,
          createdAt: true,
        },
      });
    }

    if (!dbUser) {
      dbUser = await prisma.user.findFirst({
        select: {
          id: true,
          username: true,
          email: true,
          fullName: true,
          role: true,
          department: true,
          avatarUrl: true,
          isActive: true,
          createdAt: true,
        },
      });
    }

    if (!dbUser) {
      return res.status(404).json({
        type: 'https://mbs.hochiminhcity.gov.vn/errors/not-found',
        title: 'Not Found',
        status: 404,
        detail: 'Không tìm thấy thông tin tài khoản cán bộ trong CSDL PostgreSQL.',
        instance: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }

    const permissionsMatrix = {
      canPublishPosts: ['SUPER_ADMIN', 'ADMIN', 'EDITOR_LEAD'].includes(dbUser.role),
      canWritePosts: ['SUPER_ADMIN', 'ADMIN', 'EDITOR_LEAD', 'EDITOR'].includes(dbUser.role),
      canManageForms: ['SUPER_ADMIN', 'ADMIN'].includes(dbUser.role),
      canProcessSubmissions: ['SUPER_ADMIN', 'ADMIN', 'OFFICER'].includes(dbUser.role),
      canViewAuditLogs: ['SUPER_ADMIN', 'ADMIN'].includes(dbUser.role),
      canManageUsers: ['SUPER_ADMIN', 'ADMIN'].includes(dbUser.role),
    };

    return sendApiResponse(
      res,
      { user: dbUser, permissions: permissionsMatrix },
      'Lấy thông tin tài khoản từ CSDL PostgreSQL thành công'
    );
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/users - List all users (SUPER_ADMIN, ADMIN)
usersRouter.get('/', JwtAuthGuard, RolesGuard(['SUPER_ADMIN', 'ADMIN']), async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        department: true,
        isActive: true,
        avatarUrl: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return sendApiResponse(res, users, 'Danh sách người dùng thực tế từ CSDL PostgreSQL');
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/users/:id - Get single user by ID (SUPER_ADMIN, ADMIN)
usersRouter.get('/:id', JwtAuthGuard, RolesGuard(['SUPER_ADMIN', 'ADMIN']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        department: true,
        isActive: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        type: 'https://mbs.hochiminhcity.gov.vn/errors/not-found',
        title: 'Not Found',
        status: 404,
        detail: `Không tìm thấy tài khoản với ID '${id}' trong CSDL PostgreSQL.`,
        instance: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }

    return sendApiResponse(res, user, 'Chi tiết tài khoản cán bộ từ CSDL PostgreSQL');
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/users - Create new user (SUPER_ADMIN, ADMIN)
usersRouter.post('/', JwtAuthGuard, RolesGuard(['SUPER_ADMIN', 'ADMIN']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, fullName, email, role, department, avatarUrl, password, isActive } = req.body;

    if (!username || !fullName || !email) {
      return res.status(400).json({
        type: 'https://mbs.hochiminhcity.gov.vn/errors/bad-request',
        title: 'Bad Request',
        status: 400,
        detail: 'Username, Họ và tên và Email là bắt buộc.',
        instance: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }

    const cleanUsername = username.trim().toLowerCase();

    // Check duplicate username/email in DB
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ username: cleanUsername }, { email: email.trim().toLowerCase() }],
      },
    });
    if (existing) {
      return res.status(409).json({
        type: 'https://mbs.hochiminhcity.gov.vn/errors/conflict',
        title: 'Conflict',
        status: 409,
        detail: `Tên đăng nhập '${cleanUsername}' hoặc Email '${email}' đã tồn tại trong CSDL PostgreSQL.`,
        instance: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }

    const newUser = await prisma.user.create({
      data: {
        username: cleanUsername,
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        role: role || 'OFFICER',
        department: department || 'Ban Quản lý MBS',
        avatarUrl: avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
        passwordHash: password || 'admin123',
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        department: true,
        avatarUrl: true,
        isActive: true,
        createdAt: true,
      },
    });

    return sendApiResponse(res, newUser, 'Tạo mới tài khoản cán bộ vào CSDL PostgreSQL thành công', 201);
  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/users/:id - Edit/Update existing user (SUPER_ADMIN, ADMIN)
usersRouter.put('/:id', JwtAuthGuard, RolesGuard(['SUPER_ADMIN', 'ADMIN']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { fullName, email, role, department, avatarUrl, isActive, password } = req.body;

    const updateData: any = {};
    if (fullName) updateData.fullName = fullName.trim();
    if (email) updateData.email = email.trim().toLowerCase();
    if (role) updateData.role = role;
    if (department !== undefined) updateData.department = department;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);
    if (password) updateData.passwordHash = password;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        department: true,
        avatarUrl: true,
        isActive: true,
        createdAt: true,
      },
    });

    return sendApiResponse(res, updatedUser, 'Cập nhật tài khoản cán bộ thành công trong CSDL PostgreSQL');
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/users/:id/toggle-status - Toggle Active/Inactive status (SUPER_ADMIN, ADMIN)
usersRouter.patch('/:id/toggle-status', JwtAuthGuard, RolesGuard(['SUPER_ADMIN', 'ADMIN']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const current = await prisma.user.findUnique({ where: { id } });
    if (!current) {
      return res.status(404).json({
        type: 'https://mbs.hochiminhcity.gov.vn/errors/not-found',
        title: 'Not Found',
        status: 404,
        detail: `Không tìm thấy tài khoản với ID '${id}' trong CSDL PostgreSQL.`,
        instance: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { isActive: !current.isActive },
      select: { id: true, username: true, fullName: true, isActive: true },
    });

    return sendApiResponse(res, user, 'Thay đổi trạng thái tài khoản thành công trong CSDL PostgreSQL');
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/users/:id - Delete user from PostgreSQL DB (SUPER_ADMIN only)
usersRouter.delete('/:id', JwtAuthGuard, RolesGuard(['SUPER_ADMIN']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id } });
    return sendApiResponse(res, { id, deleted: true }, 'Xóa tài khoản cán bộ thành công khỏi CSDL PostgreSQL');
  } catch (error) {
    next(error);
  }
});
