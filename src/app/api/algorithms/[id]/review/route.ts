import { NextRequest, NextResponse } from 'next/server';
import AlgorithmService from '@/algorithm/services/AlgorithmService';
import { authenticateRequest } from '@/lib/middleware/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await authenticateRequest(req);
    if (!authResult.success) {
      return authResult.response;
    }
    const user = authResult.session.user;

    const { id } = await params;
    
    const algorithm = await AlgorithmService.submitAlgorithmForReview(id, user.id);
    
    return NextResponse.json(algorithm);
  } catch (error: any) {
    console.error('Error submitting algorithm for review:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
