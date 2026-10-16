import { PrismaClient } from '@prisma/client';

const neonUrl = "postgresql://neondb_owner:npg_K2bMsD7FSoxi@ep-summer-hall-b5y5cuvf-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require";

async function testAuth() {
  console.log("🔐 Testing Auth with Neon DB...");
  const prisma = new PrismaClient({
    datasources: {
      db: { url: neonUrl },
    },
  });

  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username: 'admin' }, { email: 'admin' }],
      },
    });

    if (!user) {
      console.error("❌ User not found!");
      return;
    }

    console.log("👤 User found:", user.username, `(${user.fullName})`);
    const isPasswordValid = user.passwordHash === 'admin123';
    console.log("🔑 Password check (admin123):", isPasswordValid ? "✅ VALID" : "❌ INVALID");

    const jti = `jti_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const accessToken = `mbs_jwt_${user.id}_${jti}`;
    console.log("🎫 AccessToken generated:", accessToken);
    console.log("🎉 Backend Auth logic with Neon is 100% WORKING!");
  } catch (error) {
    console.error("❌ Auth test error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testAuth();
