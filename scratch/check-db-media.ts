import { prisma } from '../packages/database/src/index.ts';

async function main() {
  try {
    console.log('Testing prisma.media table...');
    const count = await (prisma as any).media.count();
    console.log('Media table exists! Current count:', count);
  } catch (error) {
    console.error('Error querying media table:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
