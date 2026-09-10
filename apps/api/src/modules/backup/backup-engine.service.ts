import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { prisma, BackupTriggerType } from '@mbs/database';

const BACKUP_DIR = path.resolve(process.cwd(), 'backups');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

export class BackupEngineService {
  /**
   * Generates a full snapshot backup of all PostgreSQL database tables.
   */
  static async createBackup(options: {
    triggerType?: BackupTriggerType;
    description?: string;
    createdById?: string;
  }) {
    const { triggerType = BackupTriggerType.MANUAL, description = 'Sao lưu snapshot CSDL hệ thống', createdById } = options;

    const timestamp = new Date();
    const dateStr = timestamp.toISOString().replace(/[-T:]/g, '').slice(0, 14); // YYYYMMDDHHmmss
    const filename = `MBS_Backup_${triggerType}_${dateStr}.json`;
    const filepath = path.join(BACKUP_DIR, filename);

    // 1. Fetch data from all core models
    const [
      users,
      roleDefinitions,
      categories,
      posts,
      postWorkflowLogs,
      postHistories,
      legalDocuments,
      publicServiceSubmissions,
      environmentalFeedbacks,
      inquiries,
      faqs,
      forms,
      polls,
      pollVotes,
      weeklySchedules,
      auditLogs,
      staticPages,
      media,
      mediaCategories,
    ] = await Promise.all([
      prisma.user.findMany(),
      prisma.roleDefinition.findMany(),
      prisma.category.findMany(),
      prisma.post.findMany(),
      prisma.postWorkflowLog.findMany(),
      prisma.postHistory.findMany(),
      prisma.legalDocument.findMany(),
      prisma.publicServiceSubmission.findMany(),
      prisma.environmentalFeedback.findMany(),
      prisma.inquiry.findMany(),
      prisma.faq.findMany(),
      prisma.form.findMany(),
      prisma.poll.findMany(),
      prisma.pollVote.findMany(),
      prisma.weeklySchedule.findMany(),
      prisma.auditLog.findMany(),
      prisma.staticPage.findMany(),
      prisma.media.findMany(),
      prisma.mediaCategory.findMany(),
    ]);

    const recordCount =
      users.length +
      roleDefinitions.length +
      categories.length +
      posts.length +
      postWorkflowLogs.length +
      postHistories.length +
      legalDocuments.length +
      publicServiceSubmissions.length +
      environmentalFeedbacks.length +
      inquiries.length +
      faqs.length +
      forms.length +
      polls.length +
      pollVotes.length +
      weeklySchedules.length +
      auditLogs.length +
      staticPages.length +
      media.length +
      mediaCategories.length;

    const backupData = {
      meta: {
        version: '1.0.0',
        createdAt: timestamp.toISOString(),
        triggerType,
        description,
        totalRecords: recordCount,
      },
      tables: {
        users,
        roleDefinitions,
        categories,
        posts,
        postWorkflowLogs,
        postHistories,
        legalDocuments,
        publicServiceSubmissions,
        environmentalFeedbacks,
        inquiries,
        faqs,
        forms,
        polls,
        pollVotes,
        weeklySchedules,
        auditLogs,
        staticPages,
        media,
        mediaCategories,
      },
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    const fileSize = Buffer.byteLength(jsonString, 'utf-8');

    // 2. Compute SHA-256 checksum for integrity check
    const checksum = crypto.createHash('sha256').update(jsonString).digest('hex');

    // 3. Save to filesystem
    fs.writeFileSync(filepath, jsonString, 'utf-8');

    // 4. Save metadata record to DB
    const backupRecord = await prisma.systemBackup.create({
      data: {
        filename,
        filepath,
        fileSize,
        triggerType,
        description: description || `Tự động sao lưu [${triggerType}]`,
        checksum,
        recordCount,
        status: 'SUCCESS',
        createdById: createdById || null,
      },
    });

    // 5. Auto rotation: keep maximum 30 backup files, clean up older ones
    try {
      const allBackups = await prisma.systemBackup.findMany({
        orderBy: { createdAt: 'desc' },
      });

      if (allBackups.length > 30) {
        const backupsToDelete = allBackups.slice(30);
        for (const oldBackup of backupsToDelete) {
          if (fs.existsSync(oldBackup.filepath)) {
            fs.unlinkSync(oldBackup.filepath);
          }
          await prisma.systemBackup.delete({ where: { id: oldBackup.id } });
        }
      }
    } catch (rotationErr) {
      console.warn('Auto rotation cleanup warning:', rotationErr);
    }

    return backupRecord;
  }

  /**
   * Triggers an automatic backup before any critical update operation.
   */
  static async triggerAutoBackupOnUpdate(reason: string, createdById?: string) {
    try {
      return await this.createBackup({
        triggerType: BackupTriggerType.AUTO_UPDATE,
        description: `Sao lưu tự động trước cập nhật: ${reason}`,
        createdById,
      });
    } catch (err) {
      console.error('Failed to execute auto backup before update:', err);
      return null;
    }
  }

  /**
   * Restores system database state from a backup record.
   */
  static async restoreFromBackup(backupId: string) {
    const backupRecord = await prisma.systemBackup.findUnique({
      where: { id: backupId },
    });

    if (!backupRecord) {
      throw new Error(`Không tìm thấy bản sao lưu với mã ID ${backupId}`);
    }

    if (!fs.existsSync(backupRecord.filepath)) {
      throw new Error(`Tệp sao lưu '${backupRecord.filename}' không còn tồn tại trên server.`);
    }

    const jsonContent = fs.readFileSync(backupRecord.filepath, 'utf-8');

    // 1. Verify SHA-256 Checksum integrity
    const computedChecksum = crypto.createHash('sha256').update(jsonContent).digest('hex');
    if (computedChecksum !== backupRecord.checksum) {
      throw new Error('Cảnh báo an toàn: Mã SHA-256 Checksum không trùng khớp. Tệp sao lưu có thể đã bị sửa đổi!');
    }

    const parsedData = JSON.parse(jsonContent);
    const { tables } = parsedData;

    if (!tables) {
      throw new Error('Cấu trúc file sao lưu không hợp lệ.');
    }

    // 2. Perform DB Restoration inside transaction / ordered operations
    await prisma.$transaction(async (tx) => {
      // Clear dependent tables first
      await tx.pollVote.deleteMany();
      await tx.postWorkflowLog.deleteMany();
      await tx.postHistory.deleteMany();
      await tx.post.deleteMany();
      await tx.category.deleteMany();
      await tx.legalDocument.deleteMany();
      await tx.publicServiceSubmission.deleteMany();
      await tx.environmentalFeedback.deleteMany();
      await tx.inquiry.deleteMany();
      await tx.faq.deleteMany();
      await tx.form.deleteMany();
      await tx.poll.deleteMany();
      await tx.weeklySchedule.deleteMany();
      await tx.auditLog.deleteMany();
      await tx.staticPage.deleteMany();
      await tx.media.deleteMany();
      await tx.mediaCategory.deleteMany();

      // Note: Preserve users and role definitions to prevent locking out admins if missing,
      // but re-hydrate if present
      if (tables.roleDefinitions?.length > 0) {
        for (const roleDef of tables.roleDefinitions) {
          await tx.roleDefinition.upsert({
            where: { code: roleDef.code },
            update: roleDef,
            create: roleDef,
          });
        }
      }

      if (tables.categories?.length > 0) {
        await tx.category.createMany({ data: tables.categories, skipDuplicates: true });
      }

      if (tables.posts?.length > 0) {
        await tx.post.createMany({ data: tables.posts, skipDuplicates: true });
      }

      if (tables.postWorkflowLogs?.length > 0) {
        await tx.postWorkflowLog.createMany({ data: tables.postWorkflowLogs, skipDuplicates: true });
      }

      if (tables.postHistories?.length > 0) {
        await tx.postHistory.createMany({ data: tables.postHistories, skipDuplicates: true });
      }

      if (tables.legalDocuments?.length > 0) {
        await tx.legalDocument.createMany({ data: tables.legalDocuments, skipDuplicates: true });
      }

      if (tables.publicServiceSubmissions?.length > 0) {
        await tx.publicServiceSubmission.createMany({ data: tables.publicServiceSubmissions, skipDuplicates: true });
      }

      if (tables.environmentalFeedbacks?.length > 0) {
        await tx.environmentalFeedback.createMany({ data: tables.environmentalFeedbacks, skipDuplicates: true });
      }

      if (tables.inquiries?.length > 0) {
        await tx.inquiry.createMany({ data: tables.inquiries, skipDuplicates: true });
      }

      if (tables.faqs?.length > 0) {
        await tx.faq.createMany({ data: tables.faqs, skipDuplicates: true });
      }

      if (tables.forms?.length > 0) {
        await tx.form.createMany({ data: tables.forms, skipDuplicates: true });
      }

      if (tables.polls?.length > 0) {
        await tx.poll.createMany({ data: tables.polls, skipDuplicates: true });
      }

      if (tables.pollVotes?.length > 0) {
        await tx.pollVote.createMany({ data: tables.pollVotes, skipDuplicates: true });
      }

      if (tables.weeklySchedules?.length > 0) {
        await tx.weeklySchedule.createMany({ data: tables.weeklySchedules, skipDuplicates: true });
      }

      if (tables.staticPages?.length > 0) {
        await tx.staticPage.createMany({ data: tables.staticPages, skipDuplicates: true });
      }

      if (tables.mediaCategories?.length > 0) {
        await tx.mediaCategory.createMany({ data: tables.mediaCategories, skipDuplicates: true });
      }

      if (tables.media?.length > 0) {
        await tx.media.createMany({ data: tables.media, skipDuplicates: true });
      }
    });

    return backupRecord;
  }
}
