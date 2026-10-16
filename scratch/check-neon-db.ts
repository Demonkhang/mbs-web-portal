import { PrismaClient } from '@prisma/client';

const neonUrl = "postgresql://neondb_owner:npg_K2bMsD7FSoxi@ep-summer-hall-b5y5cuvf-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require";

async function checkNeon() {
  console.log("🔍 Checking connection to Neon PostgreSQL DB...");
  const prisma = new PrismaClient({
    datasources: {
      db: { url: neonUrl },
    },
  });

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
      },
    });

    console.log(`✅ Kết nối Neon DB thành công! Tìm thấy ${users.length} người dùng:`);
    console.table(users);

    const postCount = await prisma.post.count();
    const docCount = await prisma.legalDocument.count();
    const catCount = await prisma.category.count();

    console.log("📊 Thống kê dữ liệu trên Neon DB:");
    console.log(`- Bài viết (Posts): ${postCount}`);
    console.log(`- Tài liệu (Legal Documents): ${docCount}`);
    console.log(`- Chuyên mục (Categories): ${catCount}`);
  } catch (error) {
    console.error("❌ Lỗi kết nối Neon DB:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkNeon();
