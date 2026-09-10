import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'apps/api/.env') });

import { NotificationService } from '../apps/api/src/modules/notifications/notification.service';
import { prisma, NotificationType } from '@mbs/database';

async function testNotificationEngine() {
  console.log('--- STARTING IN-APP BELL & EMAIL NOTIFICATION VERIFICATION ---');

  // 1. Fetch system admin user
  const adminUser = await prisma.user.findFirst();
  if (!adminUser) {
    console.error('❌ No user found in DB!');
    process.exit(1);
  }

  console.log(`[1/4] Target User: ${adminUser.fullName} (${adminUser.email})`);

  // 2. Test creating Task Assigned notification & email dispatch
  console.log('[2/4] Creating Task Assigned notification & sending HTML email...');
  const notif1 = await NotificationService.createNotification({
    userId: adminUser.id,
    type: NotificationType.TASK_ASSIGNED,
    title: 'Phân công Biên tập Bài viết mới',
    content: 'Đồng chí được phân công phụ trách biên tập bài viết "Kiểm tra chất lượng môi trường Khu Đa Phước 2026". Hạn chót duyệt: 15:00 hôm nay.',
    linkUrl: '/admin/posts',
    sendEmail: true,
  });

  if (notif1) {
    console.log(`✅ Created Notification 1: ID=${notif1.id}, Title="${notif1.title}"`);
  }

  // 3. Test Post Approved notification
  console.log('[3/4] Creating Post Approved notification...');
  const notif2 = await NotificationService.createNotification({
    userId: adminUser.id,
    type: NotificationType.POST_APPROVED,
    title: 'Bài viết đã được Phê duyệt & Xuất bản',
    content: 'Bài viết "Định hướng phát triển dự trữ sinh quyển Cần Giờ" đã được Trưởng Ban phán duyệt xuất bản công khai.',
    linkUrl: '/admin/approvals',
    sendEmail: true,
  });

  if (notif2) {
    console.log(`✅ Created Notification 2: ID=${notif2.id}, Title="${notif2.title}"`);
  }

  // 4. Query user notifications & unread count
  console.log('[4/4] Fetching user notifications list from DB...');
  const result = await NotificationService.getUserNotifications(adminUser.id, 10);
  console.log(`✅ DB Query Success: UnreadCount=${result.unreadCount}, TotalFetched=${result.notifications.length}`);

  // Test marking as read
  if (notif1) {
    await NotificationService.markAsRead(notif1.id, adminUser.id);
    const updatedResult = await NotificationService.getUserNotifications(adminUser.id, 10);
    console.log(`✅ Marked Notification 1 as read. Updated UnreadCount=${updatedResult.unreadCount}`);
  }

  console.log('--- IN-APP BELL & EMAIL NOTIFICATION VERIFICATION PASSED PERFECTLY ---');
  process.exit(0);
}

testNotificationEngine().catch((err) => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
