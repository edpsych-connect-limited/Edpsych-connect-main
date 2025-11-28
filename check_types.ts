
import { prisma } from './src/lib/prisma';

async function test() {
  const c = await prisma.course.findMany();
}
