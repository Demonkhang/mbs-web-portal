import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ select: { username: true, role: true, passwordHash: true } });
  console.log('Users in DB:', users);
}

main().finally(() => prisma.$disconnect());
