/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/middleware/auth';

export async function POST(req: NextRequest) {
  const authResult = await authenticateRequest(req);
  if (!authResult.success) {
    return authResult.response;
  }
  const { session } = authResult;

  try {
    const body = await req.json();
    const { 
      framework_id, 
      case_id, 
      student_id, 
      domains,
      ...otherData 
    } = body;

    const user = session.user as any;
    
    // Create the instance
    const instance = await prisma.assessmentInstance.create({
      data: {
        framework_id,
        case_id: parseInt(case_id),
        student_id: parseInt(student_id),
        tenant_id: parseInt(user.tenant_id),
        conducted_by: parseInt(user.id),
        status: 'draft',
        title: otherData.title,
        assessment_date: new Date(),
        // Initialize other fields if needed
      }
    });

    // If there are domains (unlikely on create, but possible), handle them
    if (domains) {
       for (const [domainId, domainData] of Object.entries(domains)) {
        const data = domainData as any;
        await prisma.domainObservation.create({
            data: {
                instance_id: instance.id,
                domain_id: domainId,
                observations: data.observations || '',
                observed_strengths: data.observed_strengths || {},
                observed_needs: data.observed_needs || {},
                interpretation: data.interpretation,
            }
        });
      }
    }

    return NextResponse.json(instance);
  } catch (_error) {
    console.error('Error creating assessment instance:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const authResult = await authenticateRequest(req);
  if (!authResult.success) {
    return authResult.response;
  }
  // session is not used in PUT
  
  try {
    const body = await req.json();
    const { id, domains, ...updateData } = body;

    if (!id) {
        return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    // Remove fields that shouldn't be updated directly or don't exist on the model
    const { 
        framework_id: _framework_id, 
        case_id: _case_id, 
        student_id: _student_id, 
        tenant_id: _tenant_id, 
        conducted_by: _conducted_by, 
        created_at: _created_at,
        collaborative_input: _collaborative_input, // Handled separately or ignored
        ...validUpdateData 
    } = updateData;

    // Update the instance
    const instance = await prisma.assessmentInstance.update({
      where: { id },
      data: {
        ...validUpdateData,
        updated_at: new Date(),
      }
    });

    // Update domain observations
    if (domains) {
      for (const [domainId, domainData] of Object.entries(domains)) {
        const data = domainData as any;
        
        // Check if observation exists
        const existing = await prisma.domainObservation.findFirst({
            where: {
                instance_id: id,
                domain_id: domainId
            }
        });

        if (existing) {
            await prisma.domainObservation.update({
                where: { id: existing.id },
                data: {
                    observations: data.observations,
                    observed_strengths: data.observed_strengths,
                    observed_needs: data.observed_needs,
                    interpretation: data.interpretation,
                    updated_at: new Date(),
                }
            });
        } else {
            await prisma.domainObservation.create({
                data: {
                    instance_id: id,
                    domain_id: domainId,
                    observations: data.observations || '',
                    observed_strengths: data.observed_strengths || {},
                    observed_needs: data.observed_needs || {},
                    interpretation: data.interpretation,
                }
            });
        }
      }
    }

    return NextResponse.json(instance);
  } catch (_error) {
    console.error('Error updating assessment instance:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
