import { NextRequest, NextResponse } from 'next/server';
import AlgorithmService from '@/algorithm/services/AlgorithmService';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;
    const query = searchParams.get('query') || undefined;
    const featured = searchParams.get('featured') === 'true';
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');

    const criteria: any = {};
    if (category) criteria.categoryId = category;
    if (query) criteria.searchTerm = query;
    if (featured) criteria.featured = true;

    // Check auth for private algorithms
    // Note: getServerSession requires passing authOptions in App Router
    // But for now we'll skip strict auth check for public search or assume public only
    // if (session) criteria.includePrivate = true;

    const pagination = { limit, page };
    
    const result = await AlgorithmService.searchAlgorithms(criteria, pagination);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error searching algorithms:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // TODO: Add proper auth check
    // const session = await getServerSession(authOptions);
    // if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    // const creatorId = session.user.id;
    const creatorId = body.creatorId; // Temporary: pass creatorId in body for testing

    if (!creatorId) {
        return NextResponse.json({ error: 'Creator ID required' }, { status: 400 });
    }

    const algorithm = await AlgorithmService.createAlgorithm(body, creatorId);
    
    return NextResponse.json(algorithm, { status: 201 });
  } catch (error: any) {
    console.error('Error creating algorithm:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
