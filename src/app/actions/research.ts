'use server'

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export interface ResearchStudyData {
  id: string;
  title: string;
  status: string;
  participants: number;
  target: number;
  phase: string;
  lastUpdate: string;
  leadResearcher: string;
  institution: string;
  methodology: string;
  ethicsApproval: string;
}

export async function getResearchStudies(): Promise<ResearchStudyData[]> {
  try {
    const studies = await prisma.research_studies.findMany({
      where: {
        is_public: true
      },
      include: {
        creator: true,
        participants: true
      },
      orderBy: {
        updated_at: 'desc'
      }
    });

    return studies.map(study => ({
      id: study.id,
      title: study.title,
      status: study.status,
      participants: study.participants.length,
      target: 1000, // Placeholder as it's not in schema yet
      phase: "Phase 2", // Placeholder
      lastUpdate: study.updated_at.toISOString(),
      leadResearcher: study.creator.name,
      institution: "EdPsych Connect Research", // Placeholder
      methodology: study.methodology,
      ethicsApproval: study.ethics_reference || "Pending"
    }));
  } catch (error) {
    console.error('Failed to fetch research studies:', error);
    return [];
  }
}

export async function submitEthicsProposal(data: {
  title: string;
  sampleSize: number;
  methodology: string;
  summary: string;
}) {
  try {
    // In a real app, we would get the user ID from the session
    // For now, we'll use a placeholder or the first user
    const user = await prisma.users.findFirst();
    if (!user) throw new Error('No user found');

    const study = await prisma.research_studies.create({
      data: {
        tenant_id: user.tenant_id,
        title: data.title,
        description: `Sample Size: ${data.sampleSize}\n\nSummary: ${data.summary}`,
        objective: data.summary, // Using summary as objective for now
        methodology: data.methodology,
        start_date: new Date(),
        creator_id: user.id,
        status: 'proposal',
        ethics_approval: false
      }
    });

    revalidatePath('/research');
    return { success: true, data: { referenceId: study.id } };
  } catch (error) {
    console.error('Failed to submit ethics proposal:', error);
    return { success: false, error: 'Failed to submit proposal' };
  }
}
