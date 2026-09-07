import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '@mbs/database';
import { sendApiResponse } from '../../common/interceptors/response.interceptor';
import { OptionalJwtAuthGuard } from '../../common/guards/roles.guard';

export const usersRouter = Router();

// Default seed officers for assignment if DB is fresh
const defaultOfficers = [
  {
    username: 'nguyenhoangnam',
    email: 'nam.nh@mbs.gov.vn',
    fullName: 'Kỹ sư Nguyễn Hoàng Nam',
    role: 'EDITOR_LEAD',
    department: 'Phòng Quản lý Môi trường',
    passwordHash: '$2b$10$hashedpasswordplaceholder',
    isActive: true,
  },
  {
    username: 'lethanhhai',
    email: 'hai.lt@mbs.gov.vn',
    fullName: 'ThS. Lê Thanh Hải',
    role: 'EDITOR',
    department: 'Phòng Giám sát Môi trường',
    passwordHash: '$2b$10$hashedpasswordplaceholder',
    isActive: true,
  },
  {
    username: 'phamquocbao',
    email: 'bao.pq@mbs.gov.vn',
    fullName: 'CN. Phạm Quốc Bảo',
    role: 'EDITOR',
    department: 'Tổ Trực ban 24/7',
    passwordHash: '$2b$10$hashedpasswordplaceholder',
    isActive: true,
  },
  {
    username: 'doigiamsatdaphuoc',
    email: 'giam-sat-daphuoc@mbs.gov.vn',
    fullName: 'Đội Giám sát Hiện trường Đa Phước',
    role: 'EDITOR',
    department: 'Phòng Quản lý Kỹ thuật',
    passwordHash: '$2b$10$hashedpasswordplaceholder',
    isActive: true,
  },
  {
    username: 'lanhdaombs',
    email: 'lanh-dao@mbs.gov.vn',
    fullName: 'Lãnh đạo Ban Quản lý MBS',
    role: 'ADMIN',
    department: 'Ban Giám đốc MBS',
    passwordHash: '$2b$10$hashedpasswordplaceholder',
    isActive: true,
  },
];

async function ensureSeedUsers() {
  try {
    const count = await prisma.user.count();
    if (count === 0) {
      for (const u of defaultOfficers) {
        await prisma.user.create({ data: u as any });
      }
    }
  } catch (e) {
    console.error('Error seeding users:', e);
  }
}

// GET /api/v1/users/me - Retrieve current logged in user profile from PostgreSQL DB
usersRouter.get('/me', OptionalJwtAuthGuard, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await ensureSeedUsers();
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

    if (dbUser) {
      const roleDef = await prisma.roleDefinition.findFirst({
        where: {
          OR: [
            { code: dbUser.role },
            { id: (dbUser as any).roleDefinitionId || '' },
          ],
        },
      });
      dbUser.permissions = roleDef ? roleDef.permissions : [];
    }

    return sendApiResponse(res, dbUser, 'Thông tin tài khoản cán bộ từ CSDL PostgreSQL');
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/users/assignees - List active staff members for workflow assignment dropdown from PostgreSQL DB
usersRouter.get('/assignees', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    await ensureSeedUsers();
    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        department: true,
        avatarUrl: true,
      },
      orderBy: { fullName: 'asc' },
    });

    return sendApiResponse(res, users, 'Danh sách Cán bộ Thụ lý CSDL PostgreSQL');
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/users - List all users
usersRouter.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    await ensureSeedUsers();
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

// POST /api/v1/users - Create new user into PostgreSQL DB
usersRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, fullName, role, department, avatarUrl, password, isActive } = req.body;

    if (!username || !fullName || !email) {
      return res.status(400).json({
        type: 'https://mbs.hochiminhcity.gov.vn/errors/bad-request',
        title: 'Bad Request',
        status: 400,
        detail: 'Username, Họ tên và Email là thông tin bắt buộc.',
        instance: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    // Check existing
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { username: cleanUsername },
          { email: cleanEmail },
        ],
      },
    });

    if (existing) {
      return res.status(400).json({
        type: 'https://mbs.hochiminhcity.gov.vn/errors/bad-request',
        title: 'Conflict',
        status: 400,
        detail: `Tên đăng nhập '${cleanUsername}' hoặc email '${cleanEmail}' đã tồn tại trong CSDL.`,
        instance: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }

    const newUser = await prisma.user.create({
      data: {
        username: cleanUsername,
        email: cleanEmail,
        fullName: fullName.trim(),
        role: (role as any) || 'OFFICER',
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

    // Record Audit Log if table exists
    try {
      await prisma.auditLog.create({
        data: {
          action: 'CREATE_USER',
          module: 'USER_MANAGEMENT',
          details: `Tạo tài khoản cán bộ mới: ${newUser.fullName} (@${newUser.username})`,
          userId: newUser.id,
        },
      });
    } catch (e) {}

    return sendApiResponse(res, newUser, 'Tạo mới tài khoản cán bộ thành công vào CSDL PostgreSQL', 201);
  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/users/:id - Update existing user in PostgreSQL DB
usersRouter.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { fullName, email, role, department, avatarUrl, isActive, password } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return res.status(404).json({
        type: 'https://mbs.hochiminhcity.gov.vn/errors/not-found',
        title: 'Not Found',
        status: 404,
        detail: 'Không tìm thấy tài khoản cán bộ trong CSDL.',
        instance: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }

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

    try {
      await prisma.auditLog.create({
        data: {
          action: 'UPDATE_USER',
          module: 'USER_MANAGEMENT',
          details: `Cập nhật thông tin cán bộ: ${updatedUser.fullName} (@${updatedUser.username})`,
          userId: updatedUser.id,
        },
      });
    } catch (e) {}

    return sendApiResponse(res, updatedUser, 'Cập nhật tài khoản cán bộ thành công');
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/users/:id/toggle-status - Toggle user active status
usersRouter.patch('/:id/toggle-status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return res.status(404).json({
        type: 'https://mbs.hochiminhcity.gov.vn/errors/not-found',
        title: 'Not Found',
        status: 404,
        detail: 'Không tìm thấy tài khoản cán bộ.',
        instance: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive: !existingUser.isActive },
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

    return sendApiResponse(res, updatedUser, `Đã ${updatedUser.isActive ? 'kích hoạt' : 'tạm khóa'} tài khoản cán bộ thành công`);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/users/:id - Permanent delete user from PostgreSQL DB
usersRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return res.status(404).json({
        type: 'https://mbs.hochiminhcity.gov.vn/errors/not-found',
        title: 'Not Found',
        status: 404,
        detail: 'Tài khoản không tồn tại hoặc đã bị xóa.',
        instance: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }

    await prisma.user.delete({ where: { id } });

    try {
      await prisma.auditLog.create({
        data: {
          action: 'DELETE_USER',
          module: 'USER_MANAGEMENT',
          details: `Đã xóa tài khoản cán bộ: ${existingUser.fullName} (@${existingUser.username})`,
        },
      });
    } catch (e) {}

    return sendApiResponse(res, { id }, 'Xóa tài khoản cán bộ vĩnh viễn khỏi CSDL PostgreSQL');
  } catch (error) {
    next(error);
  }
});
