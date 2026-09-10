import { prisma, NotificationType } from '@mbs/database';
import { EmailDispatcherService } from './email-dispatcher.service';

export interface CreateNotificationPayload {
  userId: string;
  type: NotificationType;
  title: string;
  content: string;
  linkUrl?: string;
  metadata?: any;
  sendEmail?: boolean;
}

export class NotificationService {
  /**
   * Creates an in-app Notification record in DB and optionally dispatches an automated Email.
   */
  static async createNotification(payload: CreateNotificationPayload) {
    const { userId, type, title, content, linkUrl, metadata, sendEmail = true } = payload;

    // 1. Fetch recipient user details
    const recipientUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, fullName: true, username: true, email: true },
    });

    if (!recipientUser) {
      console.warn(`Cannot create notification: User ID ${userId} not found.`);
      return null;
    }

    // 2. Create Notification record in PostgreSQL DB
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        content,
        linkUrl: linkUrl || '/admin/dashboard',
        metadata: metadata || null,
        isRead: false,
        isEmailSent: false,
      },
    });

    // 3. Dispatch Email asynchronously
    if (sendEmail && recipientUser.email) {
      EmailDispatcherService.sendEmail({
        toEmail: recipientUser.email,
        toName: recipientUser.fullName || recipientUser.username,
        type,
        title,
        content,
        linkUrl,
        metadata,
      })
        .then((success) => {
          if (success) {
            prisma.notification.update({
              where: { id: notification.id },
              data: { isEmailSent: true },
            }).catch(() => {});
          }
        })
        .catch((err) => {
          console.error('Error dispatching email:', err);
        });
    }

    return notification;
  }

  /**
   * Fetches user notifications list + unread count
   */
  static async getUserNotifications(userId: string, limit = 20) {
    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      prisma.notification.count({
        where: { userId, isRead: false },
      }),
    ]);

    return {
      notifications,
      unreadCount,
    };
  }

  /**
   * Marks a single notification as read
   */
  static async markAsRead(notificationId: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }

  /**
   * Marks all user notifications as read
   */
  static async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  /**
   * Deletes a notification
   */
  static async deleteNotification(notificationId: string, userId: string) {
    return prisma.notification.deleteMany({
      where: { id: notificationId, userId },
    });
  }
}
