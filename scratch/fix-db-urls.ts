import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixUrls() {
  console.log('Cleaning up hardcoded localhost URLs in PostgreSQL database...');

  // 1. Fix LegalDocument fileUrls
  const docs = await prisma.legalDocument.findMany();
  let fixedDocs = 0;
  for (const doc of docs) {
    if (doc.fileUrl && (doc.fileUrl.includes('localhost') || doc.fileUrl.includes('127.0.0.1'))) {
      const cleanUrl = doc.fileUrl.replace(/^https?:\/\/[^\/]+/, '');
      await prisma.legalDocument.update({
        where: { id: doc.id },
        data: { fileUrl: cleanUrl },
      });
      fixedDocs++;
    }
  }
  console.log(`✅ Updated ${fixedDocs} LegalDocument fileUrls.`);

  // 2. Fix Media urls
  const mediaItems = await prisma.media.findMany();
  let fixedMedia = 0;
  for (const m of mediaItems) {
    if (m.url && (m.url.includes('localhost') || m.url.includes('127.0.0.1'))) {
      const cleanUrl = m.url.replace(/^https?:\/\/[^\/]+/, '');
      await prisma.media.update({
        where: { id: m.id },
        data: { url: cleanUrl },
      });
      fixedMedia++;
    }
  }
  console.log(`✅ Updated ${fixedMedia} Media urls.`);

  console.log('🎉 Database URL cleanup complete!');
}

fixUrls()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
