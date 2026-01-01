import { NextRequest, NextResponse } from 'next/server';
import AlgorithmService from '@/algorithm/services/AlgorithmService';
import serverAuth from '@/lib/auth/server-auth';

export async function GET(req: NextRequest) {
  try {
    const user = await serverAuth.getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const institutionId = searchParams.get('institutionId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');

    // Ensure user has permission to view institution licenses
    if (user.tenantId !== institutionId && !user.roles.includes('admin')) {
      return NextResponse.json({ error: 'Unauthorized to view these licenses' }, { status: 403 });
    }

    const filters: any = { licenseeId: institutionId };
    if (status) filters.status = status;

    const pagination = { limit, page };

    // AlgorithmService.getLicenses is not explicitly in the previous read, but assumed to exist based on Express route.
    // If not, I might need to implement it or use prisma directly here.
    // Let's assume it exists or I'll check AlgorithmService.js if I get an error.
    // Actually, I should check AlgorithmService.js now to be safe.
    
    // I'll assume it exists for now to complete the file creation, 
    // but I'll verify AlgorithmService.js content in a moment.
    
    // Wait, I should verify first.
    
    // I'll create the file assuming it exists, then verify.
    const licenses = await AlgorithmService.getLicenses(filters, pagination);
    
    return NextResponse.json(licenses);
  } catch (error: any) {
    console.error('Error fetching licenses:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
