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
    const body = await req.json();
    
    const version = await AlgorithmService.addAlgorithmVersion(id, body, user.id);
    
    return NextResponse.json(version, { status: 201 });
  } catch (error: any) {
    console.error('Error adding algorithm version:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
