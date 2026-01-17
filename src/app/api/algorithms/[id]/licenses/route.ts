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

    const { id } = await params;
    const body = await req.json();
    
    if (isAdminRole(user.role)) {
      body.isAdminOverride = true;
    }

    const license = await AlgorithmService.addAlgorithmLicense(id, body, user.id);
    
    return NextResponse.json(license, { status: 201 });
  } catch (error: any) {
    console.error('Error adding algorithm license option:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
