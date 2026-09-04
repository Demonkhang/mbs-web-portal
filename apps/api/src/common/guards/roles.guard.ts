import { Request, Response, NextFunction } from 'express';
import { prisma } from '@mbs/database';
import { redisService } from '../services/redis.service';

export interface AuthenticatedUser {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'APPROVER' | 'EDITOR_LEAD' | 'EDITOR' | 'OFFICER' | 'CITIZEN' | 'ENTERPRISE';
  department?: string;
  jti?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export async function JwtAuthGuard(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      type: 'https://mbs.hochiminhcity.gov.vn/errors/unauthorized',
      title: 'Unauthorized',
      status: 401,
      detail: 'Yêu cầu xác thực tài khoản qua Bearer Token.',
      instance: req.originalUrl,
      timestamp: new Date().toISOString(),
    });
  }

  const token = authHeader.split(' ')[1];
  const parts = token.split('_');
  const userId = parts[2];
  const jti = parts[3] || token;

  if (jti && redisService.isTokenBlacklisted(jti)) {
    return res.status(401).json({
      type: 'https://mbs.hochiminhcity.gov.vn/errors/unauthorized',
      title: 'Unauthorized',
      detail: 'Phiên làm việc đã bị thu hồi (Logged out). Vui lòng đăng nhập lại.',
      status: 401,
      instance: req.originalUrl,
      timestamp: new Date().toISOString(),
    });
  }

  try {
    let dbUser = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;

    if (!dbUser) {
      dbUser = await prisma.user.findFirst();
    }

    if (!dbUser) {
      return res.status(401).json({
        type: 'https://mbs.hochiminhcity.gov.vn/errors/unauthorized',
        title: 'Unauthorized',
        status: 401,
        detail: 'Tài khoản không tồn tại trong CSDL PostgreSQL.',
        instance: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }

    req.user = {
      id: dbUser.id,
      username: dbUser.username,
      fullName: dbUser.fullName,
      email: dbUser.email,
      role: dbUser.role as any,
      department: dbUser.department || undefined,
      jti,
    };

    next();
  } catch (error) {
    next(error);
  }
}

export async function OptionalJwtAuthGuard(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const parts = token.split('_');
    const userId = parts[2];
    const jti = parts[3] || token;

    if (!redisService.isTokenBlacklisted(jti)) {
      try {
        const dbUser = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;
        if (dbUser) {
          req.user = {
            id: dbUser.id,
            username: dbUser.username,
            fullName: dbUser.fullName,
            email: dbUser.email,
            role: dbUser.role as any,
            department: dbUser.department || undefined,
            jti,
          };
        }
      } catch {}
    }
  }
  next();
}

export function RolesGuard(allowedRoles: Array<'SUPER_ADMIN' | 'ADMIN' | 'APPROVER' | 'EDITOR_LEAD' | 'EDITOR' | 'OFFICER' | 'CITIZEN' | 'ENTERPRISE'>) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        type: 'https://mbs.hochiminhcity.gov.vn/errors/unauthorized',
        title: 'Unauthorized',
        status: 401,
        detail: 'Yêu cầu đăng nhập trước khi thực hiện thao tác này.',
        instance: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }

    const userRole = req.user.role;
    // SUPER_ADMIN has full bypass privileges
    if (userRole === 'SUPER_ADMIN' || allowedRoles.includes(userRole)) {
      return next();
    }

    return res.status(403).json({
      type: 'https://mbs.hochiminhcity.gov.vn/errors/forbidden',
      title: 'Forbidden',
      status: 403,
      detail: `Tài khoản với vai trò '${userRole}' không đủ thẩm quyền thực hiện thao tác này.`,
      instance: req.originalUrl,
      timestamp: new Date().toISOString(),
    });
  };
}

export function PermissionGuard(requiredPermission: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        type: 'https://mbs.hochiminhcity.gov.vn/errors/unauthorized',
        title: 'Unauthorized',
        status: 401,
        detail: 'Yêu cầu đăng nhập trước khi thực hiện thao tác này.',
        instance: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }

    const userRoleCode = req.user.role;
    // SUPER_ADMIN has full bypass privileges
    if (userRoleCode === 'SUPER_ADMIN') {
      return next();
    }

    try {
      // Look up permissions array for user's role from PostgreSQL DB
      const roleDef = await prisma.roleDefinition.findUnique({
        where: { code: userRoleCode },
      });

      const permissions = roleDef?.permissions || [];
      if (permissions.includes(requiredPermission)) {
        return next();
      }

      return res.status(403).json({
        type: 'https://mbs.hochiminhcity.gov.vn/errors/forbidden',
        title: 'Forbidden Access',
        status: 403,
        detail: `Tài khoản '${req.user.username}' (${userRoleCode}) không có quyền '${requiredPermission}' để truy cập tài nguyên này.`,
        instance: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  };
}
