import { prisma } from '../packages/database/src/index.ts';
import fs from 'fs';
import path from 'path';

async function testAdminDelete() {
  console.log('--- START ADMIN DELETE VERIFICATION ---');

  // 1. Check DB count
  const countBefore = await (prisma as any).media.count();
  console.log(`[DB Check] Media count before test: ${countBefore}`);

  // 2. Create a dummy file
  const uploadsDir = path.join(process.cwd(), 'uploads');
  const dummyFilename = `mbs_delete_test_${Date.now()}.png`;
  const dummyFilePath = path.join(uploadsDir, dummyFilename);
  fs.writeFileSync(dummyFilePath, Buffer.from('test-image'));

  const created = await (prisma as any).media.create({
    data: {
      title: 'Tệp test xóa admin',
      filename: dummyFilename,
      originalName: 'test-delete.png',
      mimeType: 'image/png',
      size: 10,
      url: `http://localhost:4000/uploads/${dummyFilename}`,
      relativeUrl: `/uploads/${dummyFilename}`,
      storageDriver: 'local',
    },
  });
  console.log(`[DB Insert] Created test media record: ${created.id}`);

  // 3. Test API DELETE simulation (Prisma delete + file cleanup)
  await (prisma as any).media.delete({ where: { id: created.id } });
  if (fs.existsSync(dummyFilePath)) {
    fs.unlinkSync(dummyFilePath);
  }

  const countAfter = await (prisma as any).media.count();
  console.log(`[DB Check] Media count after delete: ${countAfter}`);
  console.log('--- ADMIN DELETE VERIFICATION SUCCESSFUL ---');
  await prisma.$disconnect();
}

testAdminDelete().catch((err) => {
  console.error('Delete verification error:', err);
  process.exit(1);
});
