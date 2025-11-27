import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function listUsers() {
  const users = await prisma.users.findMany({
    select: { email: true, name: true, role: true, is_active: true },
    orderBy: { role: 'asc' }
  });
  console.log('================================================================================');
  console.log('ALL USERS IN PRODUCTION DATABASE');
  console.log('================================================================================');
  users.forEach(u => {
    const email = (u.email || '').padEnd(40);
    const role = (u.role || '').padEnd(15);
    const status = u.is_active ? 'ACTIVE' : 'INACTIVE';
    console.log(email + ' | ' + role + ' | ' + status + ' | ' + (u.name || ''));
  });
  console.log('================================================================================');
  console.log('Total: ' + users.length + ' users');
  await prisma.$disconnect();
}

listUsers().catch(e => { console.error(e); process.exit(1); });
