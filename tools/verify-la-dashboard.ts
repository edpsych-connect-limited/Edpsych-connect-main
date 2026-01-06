
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyLADashboard() {
  try {
    console.log('Verifying LA Dashboard Data...');

    // 1. Find Caroline Marriott (LA Admin)
    const user = await prisma.users.findUnique({
      where: { email: 'caroline.marriott@edpsychconnect.com' },
      include: { tenants: true }
    });

    if (!user) {
      console.error('User caroline.marriott@example.com not found');
      return;
    }

    console.log(`Found User: ${user.name} (Tenant: ${user.tenants?.name}, ID: ${user.tenant_id})`);
    const tenantId = user.tenant_id;

    if (!tenantId) {
        console.error('User has no tenant_id');
        return;
    }

    // 2. Fetch Active Cases with Student and School info
    const activeCases = await prisma.cases.findMany({
      where: { tenant_id: tenantId, status: { not: 'closed' } },
      take: 10,
      orderBy: { referral_date: 'desc' },
      include: { 
        students: {
            include: {
                tenants: true
            }
        } 
      },
    });

    console.log(`Found ${activeCases.length} active cases.`);

    // 3. Verify Breach Risk Logic
    console.log('\n--- Breach Risk Verification ---');
    activeCases.forEach(c => {
      const weeksOpen = Math.floor((Date.now() - new Date(c.referral_date).getTime()) / (1000 * 60 * 60 * 24 * 7));
      const deadline = new Date(c.referral_date);
      deadline.setDate(deadline.getDate() + (20 * 7)); // 20 weeks
      
      const risk = weeksOpen > 18 ? 'high' : weeksOpen > 12 ? 'medium' : 'low';
      const schoolName = c.students.tenants?.name || 'Unknown School';

      console.log(`Case ID: ${c.id}`);
      console.log(`  Student: ${c.students.first_name} ${c.students.last_name}`);
      console.log(`  School: ${schoolName} (Tenant Type: ${c.students.tenants?.tenant_type})`);
      console.log(`  Referral Date: ${c.referral_date.toISOString().split('T')[0]}`);
      console.log(`  Weeks Open: ${weeksOpen}`);
      console.log(`  Risk Level: ${risk}`);
      console.log(`  Deadline: ${deadline.toISOString().split('T')[0]}`);
      
      if (risk === 'high') {
          console.log('  [ALERT] High Breach Risk confirmed.');
      }
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyLADashboard();
