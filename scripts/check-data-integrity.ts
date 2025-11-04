/**
 * DATA INTEGRITY CHECK SCRIPT - ORCHESTRATION LAYER
 *
 * Validates database integrity for all orchestration tables:
 * - Foreign key relationships
 * - Data consistency (scores, ranges, etc.)
 * - Orphaned records
 * - Required fields
 * - Multi-tenant scoping
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface IntegrityCheck {
  name: string;
  passed: boolean;
  details?: string;
  severity: 'critical' | 'warning' | 'info';
}

const checks: IntegrityCheck[] = [];

// Helper functions
function addCheck(name: string, passed: boolean, details?: string, severity: 'critical' | 'warning' | 'info' = 'critical') {
  checks.push({ name, passed, details, severity });

  const emoji = passed ? '✅' : (severity === 'critical' ? '❌' : '⚠️ ');
  const message = passed ? 'PASS' : 'FAIL';
  console.log(`${emoji} ${name}: ${message}${details ? ` - ${details}` : ''}`);
}

// Main integrity check function
async function checkDataIntegrity() {
  console.log('🔍 Checking Orchestration Layer Data Integrity...\n');

  try {
    // ========================================================================
    // CHECK 1: Student Profiles
    // ========================================================================
    console.log('📊 Checking Student Profiles...');

    // 1.1: All students have profiles
    const studentsWithoutProfiles = await prisma.students.count({
      where: {
        student_profile: null
      }
    });
    addCheck(
      'All students have profiles',
      studentsWithoutProfiles === 0,
      studentsWithoutProfiles > 0 ? `${studentsWithoutProfiles} students missing profiles` : undefined
    );

    // 1.2: All profiles have valid engagement scores (0-1)
    const invalidEngagementScores = await prisma.studentProfile.count({
      where: {
        OR: [
          { engagement_score: { lt: 0 } },
          { engagement_score: { gt: 1 } }
        ]
      }
    });
    addCheck(
      'Engagement scores valid (0-1)',
      invalidEngagementScores === 0,
      invalidEngagementScores > 0 ? `${invalidEngagementScores} profiles with invalid scores` : undefined
    );

    // 1.3: All profiles have valid persistence scores (0-1)
    const invalidPersistenceScores = await prisma.studentProfile.count({
      where: {
        OR: [
          { persistence_score: { lt: 0 } },
          { persistence_score: { gt: 1 } }
        ]
      }
    });
    addCheck(
      'Persistence scores valid (0-1)',
      invalidPersistenceScores === 0,
      invalidPersistenceScores > 0 ? `${invalidPersistenceScores} profiles with invalid scores` : undefined
    );

    // 1.4: All profiles have valid collaboration scores (0-1)
    const invalidCollaborationScores = await prisma.studentProfile.count({
      where: {
        OR: [
          { collaboration_score: { lt: 0 } },
          { collaboration_score: { gt: 1 } }
        ]
      }
    });
    addCheck(
      'Collaboration scores valid (0-1)',
      invalidCollaborationScores === 0,
      invalidCollaborationScores > 0 ? `${invalidCollaborationScores} profiles with invalid scores` : undefined
    );

    // 1.5: All profiles have valid profile confidence (0-1)
    const invalidProfileConfidence = await prisma.studentProfile.count({
      where: {
        OR: [
          { profile_confidence: { lt: 0 } },
          { profile_confidence: { gt: 1 } }
        ]
      }
    });
    addCheck(
      'Profile confidence valid (0-1)',
      invalidProfileConfidence === 0,
      invalidProfileConfidence > 0 ? `${invalidProfileConfidence} profiles with invalid confidence` : undefined
    );

    // 1.6: Profiles with intervention flags have urgency levels
    const profilesNeedingIntervention = await prisma.studentProfile.count({
      where: {
        needs_intervention: true,
        intervention_urgency: null
      }
    });
    addCheck(
      'Intervention profiles have urgency levels',
      profilesNeedingIntervention === 0,
      profilesNeedingIntervention > 0 ? `${profilesNeedingIntervention} profiles missing urgency` : undefined,
      'warning'
    );

    console.log('');

    // ========================================================================
    // CHECK 2: Class Rosters
    // ========================================================================
    console.log('📊 Checking Class Rosters...');

    // 2.1: All class rosters have valid teachers
    const rostersWithoutTeachers = await prisma.classRoster.count({
      where: {
        users: null
      }
    });
    addCheck(
      'All class rosters have teachers',
      rostersWithoutTeachers === 0,
      rostersWithoutTeachers > 0 ? `${rostersWithoutTeachers} rosters without teachers` : undefined
    );

    // 2.2: All class rosters have students
    const emptyRosters = await prisma.classRoster.count({
      where: {
        total_students: 0
      }
    });
    addCheck(
      'No empty class rosters',
      emptyRosters === 0,
      emptyRosters > 0 ? `${emptyRosters} empty rosters found` : undefined,
      'warning'
    );

    console.log('');

    // ========================================================================
    // CHECK 3: Lesson Plans
    // ========================================================================
    console.log('📊 Checking Lesson Plans...');

    // 3.1: All lesson plans have activities
    const lessonsWithoutActivities = await prisma.lessonPlan.count({
      where: {
        LessonActivity: {
          none: {}
        }
      }
    });
    addCheck(
      'All lesson plans have activities',
      lessonsWithoutActivities === 0,
      lessonsWithoutActivities > 0 ? `${lessonsWithoutActivities} lessons without activities` : undefined,
      'warning'
    );

    // 3.2: All lesson activities belong to valid lessons
    const orphanedActivities = await prisma.lessonActivity.count({
      where: {
        LessonPlan: null
      }
    });
    addCheck(
      'No orphaned lesson activities',
      orphanedActivities === 0,
      orphanedActivities > 0 ? `${orphanedActivities} orphaned activities` : undefined
    );

    console.log('');

    // ========================================================================
    // CHECK 4: Student Assignments
    // ========================================================================
    console.log('📊 Checking Student Assignments...');

    // 4.1: All assignments have valid students
    const assignmentsWithoutStudents = await prisma.studentLessonAssignment.count({
      where: {
        students: null
      }
    });
    addCheck(
      'All assignments have valid students',
      assignmentsWithoutStudents === 0,
      assignmentsWithoutStudents > 0 ? `${assignmentsWithoutStudents} orphaned assignments` : undefined
    );

    // 4.2: All assignments have valid lesson plans
    const assignmentsWithoutLessons = await prisma.studentLessonAssignment.count({
      where: {
        LessonPlan: null
      }
    });
    addCheck(
      'All assignments have valid lesson plans',
      assignmentsWithoutLessons === 0,
      assignmentsWithoutLessons > 0 ? `${assignmentsWithoutLessons} assignments without lessons` : undefined
    );

    // 4.3: Completed assignments have completion dates
    const completedWithoutDates = await prisma.studentLessonAssignment.count({
      where: {
        status: 'completed',
        completed_at: null
      }
    });
    addCheck(
      'Completed assignments have dates',
      completedWithoutDates === 0,
      completedWithoutDates > 0 ? `${completedWithoutDates} completed assignments missing dates` : undefined,
      'warning'
    );

    // 4.4: Success rates are valid (0-1)
    const invalidSuccessRates = await prisma.studentLessonAssignment.count({
      where: {
        OR: [
          { success_rate: { lt: 0 } },
          { success_rate: { gt: 1 } }
        ]
      }
    });
    addCheck(
      'Success rates valid (0-1)',
      invalidSuccessRates === 0,
      invalidSuccessRates > 0 ? `${invalidSuccessRates} assignments with invalid success rates` : undefined
    );

    console.log('');

    // ========================================================================
    // CHECK 5: Parent-Child Links
    // ========================================================================
    console.log('📊 Checking Parent-Child Links...');

    // 5.1: All links have valid parents
    const linksWithoutParents = await prisma.parentChildLink.count({
      where: {
        users: null
      }
    });
    addCheck(
      'All links have valid parents',
      linksWithoutParents === 0,
      linksWithoutParents > 0 ? `${linksWithoutParents} links without parents` : undefined
    );

    // 5.2: All links have valid students
    const linksWithoutStudents = await prisma.parentChildLink.count({
      where: {
        students: null
      }
    });
    addCheck(
      'All links have valid students',
      linksWithoutStudents === 0,
      linksWithoutStudents > 0 ? `${linksWithoutStudents} links without students` : undefined
    );

    // 5.3: All links are verified
    const unverifiedLinks = await prisma.parentChildLink.count({
      where: {
        is_verified: false
      }
    });
    addCheck(
      'All parent-child links verified',
      unverifiedLinks === 0,
      unverifiedLinks > 0 ? `${unverifiedLinks} unverified links` : undefined,
      'warning'
    );

    // 5.4: Each child has at least one primary contact
    const childrenWithoutPrimaryContact = await prisma.students.count({
      where: {
        ParentChildLink: {
          none: {
            is_primary_contact: true
          }
        }
      }
    });
    addCheck(
      'All children have primary contact',
      childrenWithoutPrimaryContact === 0,
      childrenWithoutPrimaryContact > 0 ? `${childrenWithoutPrimaryContact} children without primary contact` : undefined,
      'warning'
    );

    console.log('');

    // ========================================================================
    // CHECK 6: Multi-Agency Access
    // ========================================================================
    console.log('📊 Checking Multi-Agency Access...');

    // 6.1: All access records have valid users
    const accessWithoutUsers = await prisma.multiAgencyAccess.count({
      where: {
        users: null
      }
    });
    addCheck(
      'All access records have valid users',
      accessWithoutUsers === 0,
      accessWithoutUsers > 0 ? `${accessWithoutUsers} access records without users` : undefined
    );

    // 6.2: Access records have valid role types
    const validRoles = ['teacher', 'educational_psychologist', 'senco', 'social_worker', 'speech_therapist', 'admin'];
    const invalidRoleTypes = await prisma.multiAgencyAccess.count({
      where: {
        NOT: {
          role_type: {
            in: validRoles
          }
        }
      }
    });
    addCheck(
      'All role types are valid',
      invalidRoleTypes === 0,
      invalidRoleTypes > 0 ? `${invalidRoleTypes} invalid role types` : undefined
    );

    console.log('');

    // ========================================================================
    // CHECK 7: Automated Actions
    // ========================================================================
    console.log('📊 Checking Automated Actions...');

    // 7.1: All actions have valid students
    const actionsWithoutStudents = await prisma.automatedAction.count({
      where: {
        students: null
      }
    });
    addCheck(
      'All actions have valid students',
      actionsWithoutStudents === 0,
      actionsWithoutStudents > 0 ? `${actionsWithoutStudents} actions without students` : undefined
    );

    // 7.2: Approved actions have approval timestamps
    const approvedWithoutTimestamp = await prisma.automatedAction.count({
      where: {
        approved_at: { not: null },
        status: { not: 'approved' }
      }
    });
    addCheck(
      'Approved actions have correct status',
      approvedWithoutTimestamp === 0,
      approvedWithoutTimestamp > 0 ? `${approvedWithoutTimestamp} inconsistent approval records` : undefined,
      'warning'
    );

    // 7.3: Rejected actions have rejection reasons
    const rejectedWithoutReason = await prisma.automatedAction.count({
      where: {
        rejected_at: { not: null },
        rejection_reason: null
      }
    });
    addCheck(
      'Rejected actions have reasons',
      rejectedWithoutReason === 0,
      rejectedWithoutReason > 0 ? `${rejectedWithoutReason} rejected actions without reasons` : undefined,
      'warning'
    );

    console.log('');

    // ========================================================================
    // CHECK 8: Progress Snapshots
    // ========================================================================
    console.log('📊 Checking Progress Snapshots...');

    // 8.1: All snapshots have valid students
    const snapshotsWithoutStudents = await prisma.studentProgressSnapshot.count({
      where: {
        students: null
      }
    });
    addCheck(
      'All snapshots have valid students',
      snapshotsWithoutStudents === 0,
      snapshotsWithoutStudents > 0 ? `${snapshotsWithoutStudents} orphaned snapshots` : undefined
    );

    // 8.2: All snapshots have valid trends
    const validTrends = ['improving', 'stable', 'declining'];
    const invalidTrends = await prisma.studentProgressSnapshot.count({
      where: {
        NOT: {
          trend: {
            in: validTrends
          }
        }
      }
    });
    addCheck(
      'All trend values are valid',
      invalidTrends === 0,
      invalidTrends > 0 ? `${invalidTrends} snapshots with invalid trends` : undefined,
      'warning'
    );

    console.log('');

    // ========================================================================
    // CHECK 9: Multi-Tenant Isolation
    // ========================================================================
    console.log('📊 Checking Multi-Tenant Isolation...');

    // 9.1: All records have tenant_id
    const profilesWithoutTenant = await prisma.studentProfile.count({
      where: {
        tenant_id: null
      }
    });
    addCheck(
      'All profiles have tenant_id',
      profilesWithoutTenant === 0,
      profilesWithoutTenant > 0 ? `${profilesWithoutTenant} profiles without tenant` : undefined
    );

    const rostersWithoutTenant = await prisma.classRoster.count({
      where: {
        tenant_id: null
      }
    });
    addCheck(
      'All class rosters have tenant_id',
      rostersWithoutTenant === 0,
      rostersWithoutTenant > 0 ? `${rostersWithoutTenant} rosters without tenant` : undefined
    );

    const assignmentsWithoutTenant = await prisma.studentLessonAssignment.count({
      where: {
        tenant_id: null
      }
    });
    addCheck(
      'All assignments have tenant_id',
      assignmentsWithoutTenant === 0,
      assignmentsWithoutTenant > 0 ? `${assignmentsWithoutTenant} assignments without tenant` : undefined
    );

    console.log('');

    // ========================================================================
    // SUMMARY
    // ========================================================================
    console.log('================================================');
    console.log('📊 Data Integrity Check Summary:');
    console.log('================================================');

    const totalChecks = checks.length;
    const passedChecks = checks.filter(c => c.passed).length;
    const failedChecks = checks.filter(c => !c.passed && c.severity === 'critical').length;
    const warnings = checks.filter(c => !c.passed && c.severity === 'warning').length;

    console.log(`   ✅ Passed: ${passedChecks}`);
    console.log(`   ❌ Failed: ${failedChecks}`);
    console.log(`   ⚠️  Warnings: ${warnings}`);
    console.log(`   📈 Total: ${totalChecks}`);
    console.log(`   🎯 Success Rate: ${((passedChecks / totalChecks) * 100).toFixed(1)}%`);
    console.log('================================================');

    if (failedChecks === 0 && warnings === 0) {
      console.log('\n🎉 All integrity checks passed! Database is healthy.\n');
    } else if (failedChecks === 0) {
      console.log(`\n⚠️  All critical checks passed, but ${warnings} warning(s) found. Review above.\n`);
    } else {
      console.log(`\n❌ ${failedChecks} critical issue(s) found. Please fix immediately.\n`);

      // List critical failures
      console.log('Critical Issues:');
      checks
        .filter(c => !c.passed && c.severity === 'critical')
        .forEach(c => console.log(`  - ${c.name}: ${c.details || 'Failed'}`));
      console.log('');
    }

    // Exit with appropriate code
    await prisma.$disconnect();
    process.exit(failedChecks === 0 ? 0 : 1);

  } catch (error) {
    console.error('\n❌ Error running integrity checks:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Run the integrity check
checkDataIntegrity();
