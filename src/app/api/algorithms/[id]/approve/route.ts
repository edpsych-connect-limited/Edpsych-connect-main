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

    // Check reviewer role
    if (!user.roles.includes('reviewer') && !user.roles.includes('admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { comments } = body;
    
    const algorithm = await AlgorithmService.approveAlgorithm(id, user.id, comments);
    
    return NextResponse.json(algorithm);
  } catch (error: any) {
    console.error('Error approving algorithm:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
