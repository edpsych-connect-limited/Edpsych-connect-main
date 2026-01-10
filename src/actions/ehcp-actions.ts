'use server';

import { InterventionTrackingService } from '@/lib/interventions/intervention-tracking.service';
import { logger } from '@/lib/logger';

/**
 * Fetch interventions for a specific student.
 * Used to auto-populate the EHCP application form with existing evidence.
 */
export async function fetchStudentInterventions(studentId: number) {
  try {
    // In a real scenario, we would resolve the tenantId from the current user session
    const tenantId = 1; 
    const service = new InterventionTrackingService(tenantId);
    
    const interventions = await service.getStudentInterventions(studentId);
    
    // Transform complex Intervention objects into specific UI-friendly DTOs if needed,
    // but for now we return the full objects and let the client map them.
    // Serializing dates is important for Server Actions.
    const serializedInterventions = interventions.map(inv => ({
      ...inv,
      startDate: inv.startDate.toISOString(),
      plannedEndDate: inv.plannedEndDate.toISOString(),
      actualEndDate: inv.actualEndDate?.toISOString(),
      createdAt: inv.createdAt.toISOString(),
      updatedAt: inv.updatedAt.toISOString(),
      // Deeply nested dates might need handling if they exist
      reviews: inv.reviews.map(r => ({
        ...r,
        reviewDate: r.reviewDate.toISOString()
      }))
    }));

    return { success: true, data: serializedInterventions };
  } catch (error) {
    logger.error('Failed to fetch interventions for student ' + studentId, error);
    return { success: false, error: 'Failed to fetch intervention history.' };
  }
}
