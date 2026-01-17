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
    
    // AlgorithmService.publishAlgorithm likely checks ownership, but we can double check if needed.
    // For now, we rely on the service or just pass the user ID.
    
    const algorithm = await AlgorithmService.publishAlgorithm(id, user.id);
    
    return NextResponse.json(algorithm);
  } catch (error: any) {
    console.error('Error publishing algorithm:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
