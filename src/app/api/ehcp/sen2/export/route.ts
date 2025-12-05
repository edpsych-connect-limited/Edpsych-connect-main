/**
 * SEN2 Returns Export API
 * 
 * Endpoint for exporting SEN2 returns in DfE-compliant CSV format.
 * 
 * Zero Gap Project - Sprint 1
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createSEN2Service } from '@/lib/ehcp/sen2-returns.service';
import { logger } from '@/lib/logger';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = session.user as any;
    const tenantId = user.tenantId;

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const returnId = searchParams.get('id');
    const format = searchParams.get('format') || 'csv';

    if (!returnId) {
      return NextResponse.json(
        { error: 'Return ID is required' },
        { status: 400 }
      );
    }

    const sen2Service = createSEN2Service(tenantId);

    // Verify the return exists and belongs to this tenant
    const sen2Return = await sen2Service.getSEN2Return(returnId);
    
    if (!sen2Return) {
      return NextResponse.json({ error: 'SEN2 return not found' }, { status: 404 });
    }

    if (format === 'csv') {
      const csvContent = await sen2Service.exportToCSV(returnId);
      
      const filename = `SEN2_Return_${sen2Return.collection_year}_${new Date().toISOString().split('T')[0]}.csv`;
      
      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    // Default: return JSON
    return NextResponse.json(sen2Return);

  } catch (error) {
    logger.error('[SEN2 Export API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to export SEN2 return' },
      { status: 500 }
    );
  }
}
