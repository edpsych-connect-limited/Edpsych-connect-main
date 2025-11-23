
import { PrismaClient } from '@prisma/client';
import { AssessmentReportGenerator } from '../src/lib/assessments/report-generator';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting Assessment Flow Verification...');

  try {
    // 1. Get Tenant and User
    const tenant = await prisma.tenants.findFirst({ where: { subdomain: 'demo' } });
    if (!tenant) throw new Error('Demo tenant not found');

    const teacher = await prisma.users.findUnique({ where: { email: 'teacher@demo.com' } });
    if (!teacher) throw new Error('Teacher not found');

    // 2. Get Student
    const student = await prisma.students.findFirst({ 
      where: { tenant_id: tenant.id, first_name: 'Amara' } 
    });
    if (!student) throw new Error('Student Amara not found');

    // 3. Get Framework (ECCA)
    const framework = await prisma.assessmentFramework.findFirst({
      where: { abbreviation: 'ECCA' }
    });
    if (!framework) throw new Error('ECCA Framework not found');

    // 4. Create Case (if not exists)
    let caseRecord = await prisma.cases.findFirst({
      where: { student_id: student.id, status: 'OPEN' }
    });

    if (!caseRecord) {
      console.log('Creating new case...');
      caseRecord = await prisma.cases.create({
        data: {
          tenant_id: tenant.id,
          student_id: student.id,
          status: 'OPEN',
          priority: 'MEDIUM',
          type: 'Standard',
          referral_date: new Date(),
          assigned_to: teacher.id
        }
      });
    }
    console.log(`✅ Case ready: ${caseRecord.id}`);

    // 5. Create Assessment Instance
    console.log('Creating assessment instance...');
    const assessment = await prisma.assessmentInstance.create({
      data: {
        tenant_id: tenant.id,
        case_id: caseRecord.id,
        student_id: student.id,
        framework_id: framework.id,
        status: 'IN_PROGRESS',
        conducted_by: teacher.id,
        assessment_date: new Date(),
        title: 'Initial ECCA Assessment'
      }
    });
    console.log(`✅ Assessment created: ${assessment.id}`);

    // 6. Add Observations (Simulating Wizard)
    console.log('Adding observations...');
    
    // Get some domains/areas to link to
    const domains = await prisma.assessmentDomain.findMany({
        where: { framework_id: framework.id }
    });
    
    if (domains.length > 0) {
        const domain = domains[0];
        
        await prisma.domainObservation.create({
            data: {
                instance_id: assessment.id,
                domain_id: domain.id,
                observations: 'Student shows difficulty focusing during math lessons.',
                observed_strengths: ['Creative thinking'],
                observed_needs: ['Attention span'],
                observation_context: 'Classroom observation'
            }
        });
         console.log(`✅ Observation added for ${domain.name}`);
    }

    // 7. Generate Report
    console.log('Generating report...');
    
    // Construct the report object manually for verification
    const reportData = {
        student_name: `${student.first_name} ${student.last_name}`,
        date_of_birth: student.date_of_birth.toISOString().split('T')[0],
        chronological_age: '7 years, 5 months', // Mock calculation
        academic_year: student.year_group,
        school: 'Demo School',
        
        assessment_name: framework.name,
        assessment_date: new Date().toISOString().split('T')[0],
        assessor_name: `${teacher.firstName} ${teacher.lastName}`,
        assessor_qualification: 'Educational Psychologist',
        
        template: {
            id: framework.id,
            name: framework.name,
            purpose: framework.purpose,
            norm_referenced: false,
            domains: [],
            interpretation_guidelines: []
        },
        
        scores: {
            raw_scores: [],
            standard_scores: [],
            percentiles: [],
            composite_scores: [],
            strengths: ['Creative thinking'],
            weaknesses: ['Attention span'],
            interpretation: 'Initial observations suggest...'
        },
        
        recommendations: ['Implement visual schedules', 'Provide sensory breaks'],
        interventions: ['Social skills group'],
        
        report_date: new Date().toISOString().split('T')[0]
    };

    const reportGenerator = new AssessmentReportGenerator();
    // @ts-ignore - ignoring strict type checks for verification script
    const reportBlob = await reportGenerator.generateReport(reportData);
    
    // Convert Blob to Buffer to get size (Node.js environment)
    const buffer = Buffer.from(await reportBlob.arrayBuffer());
    
    console.log(`✅ Report generated successfully! Size: ${buffer.length} bytes`);

    // 8. Cleanup (Optional - keeping for inspection)
    // await prisma.assessments.delete({ where: { id: assessment.id } });

  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
