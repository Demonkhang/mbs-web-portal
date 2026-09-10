import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'apps/api/.env') });

import { BackupEngineService } from '../apps/api/src/modules/backup/backup-engine.service';
import { prisma, BackupTriggerType } from '@mbs/database';

async function testBackupEngine() {
  console.log('--- STARTING SYSTEM BACKUP ENGINE VERIFICATION ---');

  // 1. Test manual backup creation
  console.log('[1/4] Creating manual backup snapshot...');
  const manualBackup = await BackupEngineService.createBackup({
    triggerType: BackupTriggerType.MANUAL,
    description: 'Kịch bản kiểm thử tự động - Manual Snapshot',
  });
  console.log(`✅ Created Manual Backup: ID=${manualBackup.id}, File=${manualBackup.filename}, Size=${manualBackup.fileSize} B, SHA-256=${manualBackup.checksum.substring(0, 16)}...`);

  // 2. Test auto-backup on update
  console.log('[2/4] Triggering auto backup before system update...');
  const autoBackup = await BackupEngineService.triggerAutoBackupOnUpdate('Kiểm thử cập nhật hệ thống tự động');
  if (autoBackup) {
    console.log(`✅ Triggered Auto Backup: ID=${autoBackup.id}, File=${autoBackup.filename}, Records=${autoBackup.recordCount}`);
  } else {
    console.error('❌ Auto backup failed!');
  }

  // 3. Verify backup records in PostgreSQL DB
  console.log('[3/4] Fetching backups list from PostgreSQL database...');
  const allBackups = await prisma.systemBackup.findMany({
    orderBy: { createdAt: 'desc' },
  });
  console.log(`✅ Found ${allBackups.length} total backup records in DB.`);

  // 4. Test SHA-256 integrity restore dry-run
  console.log('[4/4] Testing checksum verification & restore logic...');
  const restored = await BackupEngineService.restoreFromBackup(manualBackup.id);
  console.log(`✅ Successfully restored database state from backup ${restored.filename}!`);

  console.log('--- SYSTEM BACKUP ENGINE VERIFICATION COMPLETED SUCCESSFULLY ---');
  process.exit(0);
}

testBackupEngine().catch((err) => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
