import { NextRequest, NextResponse } from 'next/server';
import AlgorithmService from '@/algorithm/services/AlgorithmService';
import { authenticateRequest, isAdminRole } from '@/lib/middleware/auth';

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
    const normalizedRole = user.role?.toUpperCase?.() || '';

    // Check reviewer role
    if (!isAdminRole(user.role) && normalizedRole !== 'REVIEWER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { reason } = body;
    
    const algorithm = await AlgorithmService.rejectAlgorithm(id, user.id, reason);
    
    return NextResponse.json(algorithm);
  } catch (error: any) {
    console.error('Error rejecting algorithm:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
