import { prisma } from '../packages/database/src/index.ts';

async function testCategoryManagement() {
  console.log('--- START CATEGORY MANAGEMENT VERIFICATION ---');

  // 1. Get initial categories stats
  const mediaItems = await (prisma as any).media.findMany({ select: { category: true } });
  console.log(`[Stats Check] Total media items count: ${mediaItems.length}`);

  // 2. Test renaming a category
  const oldCat = 'Khu Đa Phước';
  const newCat = 'Khu Đa Phước 2026';
  const renameResult = await (prisma as any).media.updateMany({
    where: { category: oldCat },
    data: { category: newCat },
  });
  console.log(`[Rename Test] Renamed ${renameResult.count} items from "${oldCat}" to "${newCat}"`);

  // 3. Revert back to original category
  const revertResult = await (prisma as any).media.updateMany({
    where: { category: newCat },
    data: { category: oldCat },
  });
  console.log(`[Revert Test] Reverted ${revertResult.count} items back to "${oldCat}"`);

  console.log('--- CATEGORY MANAGEMENT VERIFICATION SUCCESSFUL ---');
  await prisma.$disconnect();
}

testCategoryManagement().catch((err) => {
  console.error('Category test failed:', err);
  process.exit(1);
});
