'use server';

import { prisma } from '@/lib/prisma/client';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { revalidatePath } from 'next/cache';

export async function toggleEndorsement(skillId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token');

  if (!token) {
    throw new Error('Unauthorized: You must be logged in to endorse a skill');
  }

  let userId: number;

  try {
    const secret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;
    if (!secret) throw new Error('Server config error');
    
    // Validate token
    const payload = jwt.verify(token.value, secret) as any;
    userId = parseInt(payload.id);

  } catch (error) {
    throw new Error('Unauthorized');
  }

  if (!skillId) {
    throw new Error('Missing skill ID');
  }

  // Check if skill exists and get owner
  const skill = await prisma.professionalSkill.findUnique({
    where: { id: skillId },
    select: { user_id: true }
  });

  if (!skill) {
    throw new Error('Skill not found');
  }

  if (skill.user_id === userId) {
    throw new Error('You cannot endorse your own skill');
  }

  // Check if already endorsed
  const existingEndorsement = await prisma.skillEndorsement.findUnique({
    where: {
      skill_id_endorser_id: {
        skill_id: skillId,
        endorser_id: userId
      }
    }
  });

  if (existingEndorsement) {
    // Remove endorsement
    await prisma.skillEndorsement.delete({
      where: {
        id: existingEndorsement.id
      }
    });
    revalidatePath(`/professional/${skill.user_id}`);
    return { status: 'removed' };
  } else {
    // Add endorsement
    await prisma.skillEndorsement.create({
      data: {
        skill_id: skillId,
        endorser_id: userId
      }
    });
    revalidatePath(`/professional/${skill.user_id}`);
    return { status: 'added' };
  }
}
