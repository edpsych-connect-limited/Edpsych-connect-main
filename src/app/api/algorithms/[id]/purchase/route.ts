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
    const body = await req.json();
    const { licenseId, institutionId, departmentId, institutionName, departmentName } = body;
    
    const purchaseData = {
      purchaserName: `${user.profile.firstName} ${user.profile.lastName}`,
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
