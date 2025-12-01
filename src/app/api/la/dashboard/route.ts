/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
      include: { tenants: true },
    });

    if (!user || !user.tenants) {
      return new NextResponse('User or Tenant not found', { status: 404 });
    }

    const tenantId = user.tenant_id;

    // Fetch Stats
    const [activeEhcpCount, pendingAssessmentsCount, registeredSchoolsCount, professionalsCount] = await Promise.all([
      prisma.ehcps.count({ where: { tenant_id: tenantId } }), // Simplified
      prisma.assessments.count({ where: { tenant_id: tenantId, status: 'pending' } }),
      prisma.tenants.count({ where: { parent_tenant_id: tenantId, tenant_type: 'SCHOOL' } }),
      prisma.professionals.count({ where: { tenant_id: tenantId } }),
    ]);

    // Fetch Recent Applications (Professionals pending approval?)
    // Assuming professionals with specific status or just recent ones
    const recentProfessionals = await prisma.professionals.findMany({
      where: { tenant_id: tenantId },
      take: 5,
      orderBy: { created_at: 'desc' },
      include: { users: true },
    });

    // Fetch Timeline Cases (Active Cases)
    // We'll use cases as proxy for EHCP timeline for now
    const activeCases = await prisma.cases.findMany({
      where: { tenant_id: tenantId, status: { not: 'closed' } },
      take: 10,
      orderBy: { referral_date: 'desc' },
      include: { students: true },
    });

    const stats = [
      { label: 'Active EHCPs', value: activeEhcpCount.toString(), change: '+0%', icon: 'FileText', color: 'blue' },
      { label: 'Pending Assessments', value: pendingAssessmentsCount.toString(), change: '+0%', icon: 'AlertCircle', color: 'orange' },
      { label: 'Registered Schools', value: registeredSchoolsCount.toString(), change: '+0%', icon: 'Building', color: 'green' },
      { label: 'Panel Professionals', value: professionalsCount.toString(), change: '+0%', icon: 'Users', color: 'purple' },
    ];

    const recentApplications = recentProfessionals.map(p => ({
      id: p.id,
      name: p.users.name,
      type: p.professional_type,
      status: 'approved', // Default for now as we don't have approval status on professional model
      date: p.created_at.toISOString().split('T')[0],
    }));

    const timelineCases = activeCases.map(c => {
      const weeksOpen = Math.floor((Date.now() - new Date(c.referral_date).getTime()) / (1000 * 60 * 60 * 24 * 7));
      const deadline = new Date(c.referral_date);
      deadline.setDate(deadline.getDate() + (20 * 7)); // 20 weeks

      return {
        id: `CASE-${c.id}`,
        student: `${c.students.first_name} ${c.students.last_name}`,
        school: 'Unknown School', // Need to fetch school name
        week: weeksOpen,
        status: c.status,
        deadline: deadline.toISOString().split('T')[0],
        risk: weeksOpen > 18 ? 'high' : weeksOpen > 12 ? 'medium' : 'low',
      };
    });

    return NextResponse.json({
      stats,
      recentApplications,
      timelineCases,
    });
  } catch (_error) {
    console.error('Error fetching LA dashboard data:', _error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
