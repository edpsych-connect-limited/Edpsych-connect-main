
import { prisma } from './lib/prisma';

async function test() {
  // @ts-expect-error - Testing invalid type
  const game = await prisma.battleRoyaleGame.findFirst();
  console.log(game);
}
