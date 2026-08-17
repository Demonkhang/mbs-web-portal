import { Request, Response, NextFunction } from 'express';

export function RolesGuard(allowedRoles: string[]) {
  return (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        statusCode: 403,
        message: 'Bạn không có quyền thực hiện hành động này.',
        error: 'Forbidden',
      });
    }
    return next();
  };
}
