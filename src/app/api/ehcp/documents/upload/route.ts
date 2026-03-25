import authService from '@/lib/auth/auth-service';
import { NextRequest, NextResponse } from 'next/server';


import { DocumentManagementService } from '@/lib/ehcp/document-management-service';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const session = await authService.getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const applicationId = formData.get('applicationId') as string;
    const type = formData.get('type') as string;

    if (!file || !applicationId) {
      return NextResponse.json({ error: 'Missing file or applicationId' }, { status: 400 });
    }

    const tenantId = session.tenant_id || 1;
    const service = new DocumentManagementService(tenantId);
    
    // In a real implementation with S3/Azure, we would stream the file.
    // Here we covert to ArrayBuffer for the service to handle (mocked/local).
    const bytes = await file.arrayBuffer();
    // const buffer = Buffer.from(bytes); // Service takes File object directly if using local simulation, but let's check validation

    // Map role
    let role: 'LA' | 'SCHOOL' | 'PROFESSIONAL' = 'PROFESSIONAL';
    if ((session.role as string) === 'LA_ADMIN' || (session.role as string) === 'LA_OFFICER') role = 'LA';
    if (session.role === 'SENCO' || session.role === 'SCHOOL_ADMIN') role = 'SCHOOL';

    const doc = await service.uploadDocument(
        Number(applicationId),
        file,
        type as any, // Type check needed
        Number(session.id) || 0,
        session.name || 'Unknown',
        role
    );

    return NextResponse.json({
        success: true,
        document: doc
    });

  } catch (error: any) {
    logger.error('Document Upload API Error', { error });
    
    if (error.message?.includes('Virus')) {
         return NextResponse.json({ error: 'Security Alert: File rejected due to virus detection.' }, { status: 422 });
    }
    
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
