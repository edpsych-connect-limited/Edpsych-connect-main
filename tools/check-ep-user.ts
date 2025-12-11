
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const user = await prisma.users.findUnique({ where: { email: 'ep@demo.com' } });
  console.log(user);
}
main().catch(console.error).finally(() => prisma.$disconnect());
