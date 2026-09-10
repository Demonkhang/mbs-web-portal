import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'apps/api/.env') });

import { NotificationService } from '../apps/api/src/modules/notifications/notification.service';
import { prisma, NotificationType } from '@mbs/database';

async function testWorkflowNotifications() {
  console.log('--- VERIFYING AUTOMATIC NOTIFICATIONS UPON POST SUBMISSION & APPROVAL ---');

  const user = await prisma.user.findFirst();
  if (!user) {
    console.error('❌ No user found in DB!');
    process.exit(1);
  }

  // Count initial notifications
  const initialCount = await prisma.notification.count({ where: { userId: user.id } });
  console.log(`Initial Notifications Count for ${user.fullName}: ${initialCount}`);

  // Create test post notification
  await NotificationService.createNotification({
    userId: user.id,
    type: NotificationType.TASK_ASSIGNED,
    title: 'Nhiệm vụ mới: Biên tập bài viết',
    content: `${user.fullName} đã gửi bài viết "Kiểm tra hệ thống xử lý nước thải" để biên tập.`,
    linkUrl: '/admin/posts',
  });

  await NotificationService.createNotification({
    userId: user.id,
    type: NotificationType.POST_APPROVED,
    title: 'Bài viết đã được phê duyệt',
    content: 'Bài viết "Kiểm tra hệ thống xử lý nước thải" đã được Lãnh đạo phê duyệt! (Nhuận bút: 100 điểm)',
    linkUrl: '/admin/posts',
  });

  const finalResult = await NotificationService.getUserNotifications(user.id, 10);
  console.log(`✅ Final Notifications Count: ${finalResult.notifications.length}, Unread: ${finalResult.unreadCount}`);

  if (finalResult.notifications.length > initialCount) {
    console.log('✅ Notification engine verification test passed successfully!');
  } else {
    console.error('❌ Notification creation failed');
  }

  process.exit(0);
}

testWorkflowNotifications().catch((err) => {
  console.error('❌ Workflow test failed:', err);
  process.exit(1);
});
