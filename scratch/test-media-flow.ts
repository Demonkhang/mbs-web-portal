import fs from 'fs';
import path from 'path';
import { prisma } from '../packages/database/src/index.ts';

async function testMediaFlow() {
  console.log('--- START MEDIA FLOW VERIFICATION ---');

  // 1. Verify Prisma DB model 'Media'
  const countBefore = await (prisma as any).media.count();
  console.log(`[DB Check] Current media records count in PostgreSQL: ${countBefore}`);

  // 2. Create dummy test image file
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const dummyFilename = `mbs_test_${Date.now()}.png`;
  const dummyFilePath = path.join(uploadsDir, dummyFilename);
  // Create 1x1 transparent PNG buffer
  const pngBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );
  fs.writeFileSync(dummyFilePath, pngBuffer);
  console.log(`[Disk Check] Created test image file at: ${dummyFilePath}`);

  // 3. Create database record
  const createdRecord = await (prisma as any).media.create({
    data: {
      originalName: 'test-banner-2026.png',
      filename: dummyFilename,
      mimeType: 'image/png',
      size: pngBuffer.length,
      url: `http://localhost:4000/uploads/${dummyFilename}`,
      relativeUrl: `/uploads/${dummyFilename}`,
      storageDriver: 'local',
    },
  });
  console.log('[DB Insert] Inserted test media record:', createdRecord.id, createdRecord.originalName);

  // 4. Query DB records
  const allMedia = await (prisma as any).media.findMany({
    orderBy: { createdAt: 'desc' },
  });
  console.log(`[DB Query] Total media records found: ${allMedia.length}`);

  // 5. Test Delete
  await (prisma as any).media.delete({ where: { id: createdRecord.id } });
  if (fs.existsSync(dummyFilePath)) {
    fs.unlinkSync(dummyFilePath);
  }
  console.log('[Cleanup] Successfully deleted test media record and test file.');

  console.log('--- MEDIA FLOW VERIFICATION PASSED SUCCESSFULLY! ---');
  await prisma.$disconnect();
}

testMediaFlow().catch((err) => {
  console.error('Test media flow failed:', err);
  process.exit(1);
});
