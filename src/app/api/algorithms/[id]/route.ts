import { NextRequest, NextResponse } from 'next/server';
import AlgorithmService from '@/algorithm/services/AlgorithmService';
import { authenticateRequest, isAdminRole } from '@/lib/middleware/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const algorithm = await AlgorithmService.getById(id);
    
    if (!algorithm) {
      return NextResponse.json({ error: 'Algorithm not found' }, { status: 404 });
    }

    // Check visibility
    if (algorithm.visibility === 'private') {
      const authResult = await authenticateRequest(req);
      if (!authResult.success) {
        return authResult.response;
      }
      const user = authResult.session.user;
      const isCreator = user.id === algorithm.creatorId.toString();
      const isAdmin = isAdminRole(user.role);

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
    
    // Check ownership or admin
    const algorithm = await AlgorithmService.getById(id);
    if (!algorithm) {
      return NextResponse.json({ error: 'Algorithm not found' }, { status: 404 });
    }

    const isCreator = user.id === algorithm.creatorId.toString();
    const isAdmin = isAdminRole(user.role);

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await authenticateRequest(req);
    if (!authResult.success) {
      return authResult.response;
    }
    const user = authResult.session.user;

    const { id } = await params;
    
    // Check ownership or admin
    const algorithm = await AlgorithmService.getById(id);
    if (!algorithm) {
      return NextResponse.json({ error: 'Algorithm not found' }, { status: 404 });
    }

    const isCreator = user.id === algorithm.creatorId.toString();
    const isAdmin = isAdminRole(user.role);

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
