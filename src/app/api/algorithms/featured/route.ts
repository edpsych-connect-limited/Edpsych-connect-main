import { NextRequest, NextResponse } from 'next/server';
import AlgorithmService from '@/algorithm/services/AlgorithmService';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const algorithms = await AlgorithmService.getFeaturedAlgorithms(limit);
    
    return NextResponse.json(algorithms);
  } catch (error: any) {
    console.error('Error fetching featured algorithms:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
