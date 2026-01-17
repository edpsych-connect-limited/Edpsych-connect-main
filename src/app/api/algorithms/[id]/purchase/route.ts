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
    const { licenseId, institutionId, departmentId, institutionName, departmentName } = body;
    
    const purchaseData = {
      purchaserName: user.name || user.email,
      institutionName,
      departmentId,
      departmentName
    };

    const license = await AlgorithmService.purchaseLicense(
      id,
      licenseId,
      institutionId,
      user.id,
      purchaseData
    );
    
    return NextResponse.json(license, { status: 201 });
  } catch (error: any) {
    console.error('Error purchasing license:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
