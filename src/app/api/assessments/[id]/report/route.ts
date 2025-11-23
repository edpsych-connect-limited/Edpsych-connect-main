import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/middleware/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authenticateRequest(req);
    if (!authResult.success) {
      return authResult.response;
    }
    const { session } = authResult;

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new NextResponse('No file uploaded', { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `report-${params.id}-${uuidv4()}.pdf`;
    
    // Ensure uploads directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'reports');
    try {
        await mkdir(uploadDir, { recursive: true });
    } catch (e) {
        // Ignore if exists
    }
    
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);
    
    const fileUrl = `/uploads/reports/${filename}`;

    // Create SecureDocument record
    const secureDoc = await prisma.secureDocument.create({
      data: {
        title: `Assessment Report - ${params.id}`,
        documentType: 'ASSESSMENT_REPORT',
        storageUrl: fileUrl,
        mimeType: 'application/pdf',
        sizeBytes: buffer.length,
        userId: parseInt(session.user.id),
        // tenantId: session.user.tenantId // Assuming I can get tenantId from session or user
      }
    });

    // Update AssessmentInstance
    await prisma.assessmentInstance.update({
      where: { id: params.id },
      data: {
        linked_report_id: secureDoc.id,
        status: 'completed',
        completed_at: new Date()
      }
    });

    return NextResponse.json({ success: true, url: fileUrl, documentId: secureDoc.id });

  } catch (error) {
    console.error('Error uploading report:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
