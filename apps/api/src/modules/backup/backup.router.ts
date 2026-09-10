import { Router, Request, Response, NextFunction } from 'express';
import fs from 'fs';
import { prisma, BackupTriggerType } from '@mbs/database';
import { sendApiResponse } from '../../common/interceptors/response.interceptor';
import { OptionalJwtAuthGuard } from '../../common/guards/roles.guard';
import { BackupEngineService } from './backup-engine.service';

export const backupRouter = Router();

// GET /api/v1/backups - List all backups
backupRouter.get('/', OptionalJwtAuthGuard, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const backups = await prisma.systemBackup.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Calculate total backup storage size
    const totalSizeBytes = backups.reduce((acc, curr) => acc + (curr.fileSize || 0), 0);
    const lastBackupAt = backups.length > 0 ? backups[0].createdAt : null;

    return sendApiResponse(res, {
      backups,
      stats: {
        totalCount: backups.length,
        totalSizeBytes,
        totalSizeMb: (totalSizeBytes / (1024 * 1024)).toFixed(2),
        lastBackupAt,
        autoBackupEnabled: true,
      },
    }, 'Danh sách bản sao lưu dữ liệu hệ thống');
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/backups/create - Create immediate snapshot backup
backupRouter.post('/create', OptionalJwtAuthGuard, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { triggerType = BackupTriggerType.MANUAL, description } = req.body;
    const user = (req as any).user;

    const backupRecord = await BackupEngineService.createBackup({
      triggerType: triggerType as BackupTriggerType,
      description: description || 'Tạo bản sao lưu snapshot hệ thống từ Dashboard Quản trị',
      createdById: user?.id,
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: 'BACKUP_CREATE',
        module: 'SYSTEM_BACKUP',
        userId: user?.id || null,
        ipAddress: req.ip || '127.0.0.1',
        details: `Tạo bản sao lưu ${backupRecord.filename} (Dung lượng: ${backupRecord.fileSize} bytes, Records: ${backupRecord.recordCount}, SHA-256: ${backupRecord.checksum.substring(0, 12)}...)`,
      },
    });

    return sendApiResponse(res, backupRecord, 'Tạo bản sao lưu CSDL hệ thống thành công', 201);
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/backups/restore/:id - Restore database from backup snapshot
backupRouter.post('/restore/:id', OptionalJwtAuthGuard, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    const restoredBackup = await BackupEngineService.restoreFromBackup(id);

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: 'BACKUP_RESTORE',
        module: 'SYSTEM_BACKUP',
        userId: user?.id || null,
        ipAddress: req.ip || '127.0.0.1',
        details: `Đã khôi phục CSDL hệ thống về bản sao lưu ${restoredBackup.filename} (${restoredBackup.createdAt.toISOString()})`,
      },
    });

    return sendApiResponse(res, restoredBackup, `Đã phục hồi CSDL hệ thống về trạng thái bản sao lưu ${restoredBackup.filename} thành công!`);
  } catch (error: any) {
    return res.status(400).json({
      type: 'https://mbs.hochiminhcity.gov.vn/errors/restore-failed',
      title: 'Restore Failed',
      status: 400,
      detail: error.message || 'Lỗi trong quá trình phục hồi dữ liệu.',
      instance: req.originalUrl,
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/v1/backups/download/:id - Download backup file
backupRouter.get('/download/:id', OptionalJwtAuthGuard, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const backupRecord = await prisma.systemBackup.findUnique({ where: { id } });

    if (!backupRecord || !fs.existsSync(backupRecord.filepath)) {
      return res.status(404).json({
        type: 'https://mbs.hochiminhcity.gov.vn/errors/not-found',
        title: 'File Not Found',
        status: 404,
        detail: 'Tệp sao lưu không tồn tại hoặc đã bị xóa khỏi đĩa.',
        instance: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${backupRecord.filename}"`);
    return res.sendFile(backupRecord.filepath);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/backups/:id - Delete backup record & file
backupRouter.delete('/:id', OptionalJwtAuthGuard, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const backupRecord = await prisma.systemBackup.findUnique({ where: { id } });

    if (!backupRecord) {
      return res.status(404).json({
        type: 'https://mbs.hochiminhcity.gov.vn/errors/not-found',
        title: 'Backup Not Found',
        status: 404,
        detail: 'Không tìm thấy bản sao lưu cần xóa.',
        instance: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }

    if (fs.existsSync(backupRecord.filepath)) {
      fs.unlinkSync(backupRecord.filepath);
    }

    await prisma.systemBackup.delete({ where: { id } });

    return sendApiResponse(res, { id, deleted: true }, `Đã xóa bản sao lưu ${backupRecord.filename} khỏi hệ thống.`);
  } catch (error) {
    next(error);
  }
});
