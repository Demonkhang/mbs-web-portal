import { prisma } from '@mbs/database';

async function checkUsers() {
  try {
    const users = await prisma.user.findMany();
    console.log('=== USERS IN POSTGRESQL DB ===');
    console.dir(users, { depth: null });
    console.log('=== END USERS LIST ===');
  } catch (err) {
    console.error('Error reading users from DB:', err);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
