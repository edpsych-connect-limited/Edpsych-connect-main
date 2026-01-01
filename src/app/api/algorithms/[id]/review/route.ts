import { NextRequest, NextResponse } from 'next/server';
import AlgorithmService from '@/algorithm/services/AlgorithmService';
import serverAuth from '@/lib/auth/server-auth';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await serverAuth.getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = params.id;
    
    const algorithm = await AlgorithmService.submitAlgorithmForReview(id, user.id);
    
    return NextResponse.json(algorithm);
  } catch (error: any) {
    console.error('Error submitting algorithm for review:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
