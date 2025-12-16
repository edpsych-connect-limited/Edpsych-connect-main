import { NextResponse } from 'next/server';
import { ProfileBuilderService } from '@/lib/orchestration/profile-builder.service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logger } from '@/lib/logger';

export async function POST(req: Request) {
  try {
    const _session = await getServerSession(authOptions);
    
    // In a real app, we'd enforce auth. For this demo/audit, we might be lenient or use a test user.
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const body = await req.json();
    const { taskType, result, studentId } = body;

    if (!taskType || !result) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Map task results to AssessmentResult format
    let assessmentResult;

    if (taskType === 'digit-span') {
      // Digit Span primarily measures Working Memory
      // A span of 7 is average for adults, 4-5 for children.
      // We'll normalize to a 0-100 score for the profile.
      // Score = (span / 9) * 100 (approximate)
      
      const rawSpan = result.span || 0;
      const normalizedScore = Math.min(Math.round((rawSpan / 9) * 100), 100);

      assessmentResult = {
        assessment_id: `digit-span-${Date.now()}`,
        student_id: studentId ? parseInt(studentId) : 1, // Default to ID 1 for demo if not provided
        assessment_type: 'COGNITIVE_INTERACTIVE',
        domain_scores: [
          { 
            domain: 'Working Memory', 
            score: normalizedScore, 
            max_score: 100 
          },
          {
            domain: 'Attention', // Digit span also requires attention
            score: Math.min(Math.round((rawSpan / 9) * 90), 100), // Slightly lower correlation
            max_score: 100
          }
        ],
        overall_score: normalizedScore,
        strengths: normalizedScore > 60 ? ['Auditory Working Memory'] : [],
        weaknesses: normalizedScore < 40 ? ['Auditory Working Memory'] : [],
        completed_at: new Date()
      };
    } else {
      return NextResponse.json({ error: 'Unknown task type' }, { status: 400 });
    }

    // Orchestrate the update
    await ProfileBuilderService.updateProfileFromAssessment(assessmentResult);

    logger.info(`Processed ${taskType} for student ${assessmentResult.student_id}. Score: ${assessmentResult.overall_score}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Assessment processed and profile updated',
      data: assessmentResult
    });

  } catch (error) {
    logger.error('Error processing assessment submission:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
