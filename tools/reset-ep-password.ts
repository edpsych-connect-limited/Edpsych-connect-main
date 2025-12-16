
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const RESET_USER_EMAIL = process.env.RESET_USER_EMAIL;
const RESET_USER_PASSWORD = process.env.RESET_USER_PASSWORD;
const CONFIRM_PASSWORD_RESET = process.env.CONFIRM_PASSWORD_RESET;

if (!RESET_USER_EMAIL || !RESET_USER_PASSWORD) {
  console.error('ERROR: RESET_USER_EMAIL and RESET_USER_PASSWORD must be set');
  process.exit(1);
}

if (CONFIRM_PASSWORD_RESET !== 'YES') {
  console.error('ERROR: Refusing to reset password without CONFIRM_PASSWORD_RESET=YES');
  process.exit(1);
}

const REQUIRED_RESET_USER_EMAIL: string = RESET_USER_EMAIL;
const REQUIRED_RESET_USER_PASSWORD: string = RESET_USER_PASSWORD;

async function main() {
  const hashedPassword = await bcrypt.hash(REQUIRED_RESET_USER_PASSWORD, 10);
  await prisma.users.update({
    where: { email: REQUIRED_RESET_USER_EMAIL },
    data: { password_hash: hashedPassword },
  });
  console.log(`Password updated for ${REQUIRED_RESET_USER_EMAIL}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
