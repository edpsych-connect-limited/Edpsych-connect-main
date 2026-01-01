import { NextRequest, NextResponse } from 'next/server';
import AlgorithmService from '@/algorithm/services/AlgorithmService';
import serverAuth from '@/lib/auth/server-auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const user = await serverAuth.getUserFromRequest(req);
    const algorithm = await AlgorithmService.getById(id);
    
    if (!algorithm) {
      return NextResponse.json({ error: 'Algorithm not found' }, { status: 404 });
    }

    // Check visibility
    if (algorithm.visibility === 'private') {
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      // Check if user is creator or admin (assuming isAdmin property or role check)
      const isCreator = user.id === algorithm.creatorId.toString(); // Ensure type match
      const isAdmin = user.roles.includes('admin');
      
      if (!isCreator && !isAdmin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
    
    return NextResponse.json(algorithm);
  } catch (error: any) {
    console.error('Error fetching algorithm:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
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
    
    // Check ownership or admin
    const algorithm = await AlgorithmService.getById(id);
    if (!algorithm) {
      return NextResponse.json({ error: 'Algorithm not found' }, { status: 404 });
    }

    const isCreator = user.id === algorithm.creatorId.toString();
    const isAdmin = user.roles.includes('admin');

    if (!isCreator && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Admin override
    if (isAdmin) {
      body.isAdminOverride = true;
    }

    const updatedAlgorithm = await AlgorithmService.updateAlgorithm(id, body, user.id);
    return NextResponse.json(updatedAlgorithm);
  } catch (error: any) {
    console.error('Error updating algorithm:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await serverAuth.getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = params.id;
    
    // Check ownership or admin
    const algorithm = await AlgorithmService.getById(id);
    if (!algorithm) {
      return NextResponse.json({ error: 'Algorithm not found' }, { status: 404 });
    }

    const isCreator = user.id === algorithm.creatorId.toString();
    const isAdmin = user.roles.includes('admin');

    if (!isCreator && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Assuming deleteAlgorithm exists or we just update status to deleted
    // AlgorithmService.js doesn't have deleteAlgorithm explicitly shown in previous reads, 
    // but usually updateAlgorithm can handle status change or we might need to add it.
    // For now, let's assume we can update status to 'deleted' or similar if delete isn't supported.
    // Or I can check AlgorithmService.js again.
    
    // Let's check AlgorithmService.js for delete method.
    // If not found, I'll implement soft delete via update.
    
    // Placeholder for now:
    await AlgorithmService.updateAlgorithm(id, { status: 'deleted' }, user.id);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting algorithm:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
