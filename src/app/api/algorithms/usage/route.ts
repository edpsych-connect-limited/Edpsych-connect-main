import { NextRequest, NextResponse } from 'next/server';
import AlgorithmUsageService from '@/algorithm/services/AlgorithmUsageService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate required fields
    if (!body.algorithmId || !body.tenantId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await AlgorithmUsageService.recordUsage(body);
    
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Error recording usage:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
