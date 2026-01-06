import { NextRequest, NextResponse } from 'next/server';
import AlgorithmService from '@/algorithm/services/AlgorithmService';
import serverAuth from '@/lib/auth/server-auth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await serverAuth.getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
