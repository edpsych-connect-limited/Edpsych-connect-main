'use server'

import { getSession } from '@/lib/auth/auth-service';
import { ProfessionalProfileService } from '@/services/professional-profile-service';
import { prisma } from '@/lib/prisma/client';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const experienceSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  company: z.string().min(1, "Company is required"),
  location: z.string().optional(),
  start_date: z.coerce.date(),
  end_date: z.coerce.date().optional().nullable(),
  is_current: z.boolean().default(false),
  description: z.string().optional(),
});

export type ExperienceFormData = z.infer<typeof experienceSchema>;

export async function upsertExperience(data: ExperienceFormData) {
  const user = await getSession();
  if (!user) throw new Error("Unauthorized");

  const userId = parseInt(user.id);
  if (isNaN(userId)) throw new Error("Invalid User ID");

  // Validate data
  const validated = experienceSchema.parse(data);

  // If is_current is true, verify end_date is null or handle logic
  if (validated.is_current) {
    validated.end_date = null;
  }

  await ProfessionalProfileService.upsertExperience(userId, {
    ...validated,
    location: validated.location || null,
    description: validated.description || null,
    end_date: validated.end_date || null
  });

  revalidatePath('/marketplace/profile');
  return { success: true };
}

export async function removeExperience(id: string) {
  const user = await getSession();
  if (!user) throw new Error("Unauthorized");
  
  const userId = parseInt(user.id);
  if (isNaN(userId)) throw new Error("Invalid User ID");
  
  await prisma.professionalExperience.deleteMany({
    where: {
      id: id,
      user_id: userId
    }
  });

  revalidatePath('/marketplace/profile');
  return { success: true };
}

export async function updateProfileImage(avatarUrl: string) {
  const user = await getSession();
  if (!user) throw new Error("Unauthorized");
  
  const userId = parseInt(user.id);
  if (isNaN(userId)) throw new Error("Invalid User ID");
  
  await prisma.users.update({
    where: { id: userId },
    data: { avatar_url: avatarUrl }
  });

  revalidatePath('/marketplace/profile');
  return { success: true };
}

const educationSchema = z.object({
  id: z.string().optional(),
  institution: z.string().min(1, "Institution is required"),
  degree: z.string().min(1, "Degree is required"),
  field_of_study: z.string().min(1, "Field of study is required"),
  start_date: z.coerce.date(),
  end_date: z.coerce.date().optional().nullable(),
  grade: z.string().optional(),
  description: z.string().optional(),
});

export type EducationFormData = z.infer<typeof educationSchema>;

export async function upsertEducation(data: EducationFormData) {
  const user = await getSession();
  if (!user) throw new Error("Unauthorized");

  const userId = parseInt(user.id);
  if (isNaN(userId)) throw new Error("Invalid User ID");

  const validated = educationSchema.parse(data);

  await ProfessionalProfileService.upsertEducation(userId, {
    ...validated,
    grade: validated.grade || null,
    description: validated.description || null,
    end_date: validated.end_date || null
  });

  revalidatePath('/marketplace/profile');
  return { success: true };
}

export async function removeEducation(id: string) {
  const user = await getSession();
  if (!user) throw new Error("Unauthorized");
  
  const userId = parseInt(user.id);
  if (isNaN(userId)) throw new Error("Invalid User ID");
  
  await prisma.professionalEducation.deleteMany({
    where: {
      id: id,
      user_id: userId
    }
  });

  revalidatePath('/marketplace/profile');
  return { success: true };
}

const skillSchema = z.object({
  name: z.string().min(1, "Skill name is required").max(50, "Skill name too long"),
});

export async function addSkill(name: string) {
  const user = await getSession();
  if (!user) throw new Error("Unauthorized");

  const userId = parseInt(user.id);
  if (isNaN(userId)) throw new Error("Invalid User ID");

  const validated = skillSchema.parse({ name });

  try {
    await prisma.professionalSkill.create({
      data: {
        user_id: userId,
        name: validated.name,
        is_verified: false 
      }
    });

    revalidatePath('/marketplace/profile');
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, error: "You have already added this skill." };
    }
    throw error;
  }
}

export async function removeSkill(skillId: string) {
  const user = await getSession();
  if (!user) throw new Error("Unauthorized");
  
  const userId = parseInt(user.id);
  if (isNaN(userId)) throw new Error("Invalid User ID");
  
  await prisma.professionalSkill.deleteMany({
    where: {
      id: skillId,
      user_id: userId
    }
  });

  revalidatePath('/marketplace/profile');
  return { success: true };
}
