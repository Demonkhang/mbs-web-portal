import { prisma } from '@mbs/database';

async function testLogin() {
  const user = await prisma.user.findFirst({
    where: { OR: [{ username: 'khang.tt' }, { email: 'khang.tt@mbs.hochiminhcity.gov.vn' }] },
  });
  console.log('Login target DB user:', user?.username, user?.fullName, user?.role);
}

testLogin();
