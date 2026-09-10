import { Router, Request, Response, NextFunction } from 'express';
import { sendApiResponse } from '../../common/interceptors/response.interceptor';
import { OptionalJwtAuthGuard } from '../../common/guards/roles.guard';
import { NotificationService } from './notification.service';

export const notificationsRouter = Router();

// GET /api/v1/notifications - List notifications for logged-in user
notificationsRouter.get('/', OptionalJwtAuthGuard, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    const userId = user?.id || 'd3b07384-d113-44a6-a78b-000000000001'; // Default system admin fallback ID if guest

    const limit = parseInt(req.query.limit as string) || 20;
    const result = await NotificationService.getUserNotifications(userId, limit);

    return sendApiResponse(res, result, 'Danh sách thông báo của tài khoản');
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/notifications/:id/read - Mark single notification as read
notificationsRouter.patch('/:id/read', OptionalJwtAuthGuard, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    const userId = user?.id || 'd3b07384-d113-44a6-a78b-000000000001';

    await NotificationService.markAsRead(id, userId);
    return sendApiResponse(res, { id, isRead: true }, 'Đã đánh dấu thông báo là đã đọc');
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/notifications/read-all - Mark all user notifications as read
notificationsRouter.patch('/read-all', OptionalJwtAuthGuard, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    const userId = user?.id || 'd3b07384-d113-44a6-a78b-000000000001';

    await NotificationService.markAllAsRead(userId);
    return sendApiResponse(res, { success: true }, 'Đã đánh dấu tất cả thông báo là đã đọc');
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/notifications/:id - Delete notification
notificationsRouter.delete('/:id', OptionalJwtAuthGuard, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    const userId = user?.id || 'd3b07384-d113-44a6-a78b-000000000001';

    await NotificationService.deleteNotification(id, userId);
    return sendApiResponse(res, { id, deleted: true }, 'Đã xóa thông báo khỏi hệ thống');
  } catch (error) {
    next(error);
  }
});
