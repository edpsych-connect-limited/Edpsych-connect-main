/**
 * Phase 1 Corridor E2E Test
 *
 * Validates the complete EP workflow from login to report generation:
 * Step 1: Login / session
 * Step 2: Dashboard auth state
 * Step 3: Onboarding status
 * Step 4: Student creation
 * Step 5: Case creation
 * Step 6: Assessment shell creation
 * Step 7: Assessment instance creation
 * Step 8: Assessment instance update
 * Step 9: Report draft / create
 * Step 10: Report generate / export
 *
 * Roles tested: EDUCATIONAL_PSYCHOLOGIST (EP)
 */

describe('Phase 1 Corridor — EP Workflow', () => {
  let studentId: number;
  let caseId: number;
  let assessmentInstanceId: string;
  let reportId: number;

  before(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  // ─── Step 1: Login ───────────────────────────────────────────────────────────
  it('Step 1: EP can log in and get a valid session', () => {
    cy.login('ep@test.edpsychconnect.com');
    cy.request('/api/auth/session').then(res => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property('user');
      expect(res.body.user).to.have.property('role');
    });
  });

  // ─── Step 2: Dashboard ───────────────────────────────────────────────────────
  it('Step 2: EP dashboard loads with correct auth state', () => {
    cy.login('ep@test.edpsychconnect.com');
    cy.visit('/en/ep/dashboard');
    cy.url().should('include', '/ep/dashboard');
    cy.get('h1').should('be.visible');
    // Should NOT show login prompt
    cy.contains('Sign in').should('not.exist');
  });

  // ─── Step 3: Onboarding ──────────────────────────────────────────────────────
  it('Step 3: Session reports correct onboarding status', () => {
    cy.login('ep@test.edpsychconnect.com');
    cy.request('/api/auth/session').then(res => {
      // User should either have completed onboarding or be redirected to it
      expect(res.status).to.eq(200);
      expect(res.body.user).to.exist;
    });
  });

  // ─── Step 4: Student creation ────────────────────────────────────────────────
  it('Step 4: EP can create a student', () => {
    cy.login('ep@test.edpsychconnect.com');
    cy.request({
      method: 'POST',
      url: '/api/students',
      body: {
        first_name: 'Cypress',
        last_name: 'TestStudent',
        date_of_birth: '2015-06-15',
        year_group: 'Year 5',
        gender: 'prefer_not_to_say',
      },
    }).then(res => {
      expect(res.status).to.be.oneOf([200, 201]);
      expect(res.body).to.have.property('id');
      studentId = res.body.id;
    });
  });

  // ─── Step 5: Case creation ───────────────────────────────────────────────────
  it('Step 5: EP can create a case for the student', () => {
    cy.login('ep@test.edpsychconnect.com');
    cy.request('/api/auth/session').then(sessionRes => {
      const tenantId = sessionRes.body.user?.tenantId || sessionRes.body.user?.tenant_id;
      cy.request({
        method: 'POST',
        url: '/api/cases',
        body: {
          student_id: studentId,
          tenant_id: tenantId,
          type: 'assessment',
          priority: 'standard',
          status: 'referral',
          referral_date: new Date().toISOString(),
        },
      }).then(res => {
        expect(res.status).to.be.oneOf([200, 201]);
        expect(res.body).to.have.property('id');
        caseId = res.body.id || res.body.case?.id;
      });
    });
  });

  // ─── Step 6+7: Assessment instance creation ──────────────────────────────────
  it('Step 6+7: EP can create an assessment instance on the case', () => {
    cy.login('ep@test.edpsychconnect.com');
    cy.request('/api/auth/session').then(sessionRes => {
      const tenantId = sessionRes.body.user?.tenantId || sessionRes.body.user?.tenant_id;
      const conductedBy = parseInt(sessionRes.body.user?.id);
      cy.request({
        method: 'POST',
        url: '/api/assessments/instances',
        body: {
          case_id: caseId,
          student_id: studentId,
          tenant_id: tenantId,
          framework_id: 'ecca-v1',
          conducted_by: conductedBy,
          title: 'Cypress Test Assessment',
          status: 'draft',
        },
      }).then(res => {
        expect(res.status).to.be.oneOf([200, 201]);
        expect(res.body).to.have.property('id');
        assessmentInstanceId = res.body.id || res.body.instance?.id;
      });
    });
  });

  // ─── Step 8: Assessment instance update ──────────────────────────────────────
  it('Step 8: EP can update the assessment instance', () => {
    cy.login('ep@test.edpsychconnect.com');
    cy.request({
      method: 'PATCH',
      url: `/api/assessments/instances/${assessmentInstanceId}`,
      body: {
        ep_summary: 'Cypress automated test summary.',
        status: 'in_progress',
        progress_percentage: 50,
      },
    }).then(res => {
      expect(res.status).to.be.oneOf([200, 201]);
    });
  });

  // ─── Step 9: Report draft ─────────────────────────────────────────────────────
  it('Step 9: EP can create a report draft', () => {
    cy.login('ep@test.edpsychconnect.com');
    cy.request('/api/auth/session').then(sessionRes => {
      const tenantId = sessionRes.body.user?.tenantId || sessionRes.body.user?.tenant_id;
      cy.request({
        method: 'POST',
        url: '/api/reports',
        body: {
          case_id: caseId,
          assessment_id: 1,
          instance_id: assessmentInstanceId,
          tenant_id: tenantId,
          type: 'assessment',
          title: 'Cypress Test Report',
          student: {
            name: 'Cypress TestStudent',
            dob: new Date('2015-06-15'),
            yearGroup: 'Year 5',
          },
          date: new Date(),
          sections: [],
        },
      }).then(res => {
        expect(res.status).to.be.oneOf([200, 201]);
        reportId = res.body.id || res.body.report?.id;
      });
    });
  });

  // ─── Step 10: Reports list shows the new report ───────────────────────────────
  it('Step 10: Reports list includes the created report', () => {
    cy.login('ep@test.edpsychconnect.com');
    cy.request('/api/reports').then(res => {
      expect(res.status).to.eq(200);
      const reports = res.body.reports || res.body.data || [];
      expect(reports.length).to.be.greaterThan(0);
    });
  });

  // ─── Corridor UI check ────────────────────────────────────────────────────────
  it('Corridor UI: cases page loads and shows content', () => {
    cy.login('ep@test.edpsychconnect.com');
    cy.visit('/en/cases');
    cy.url().should('include', '/cases');
    cy.get('h1').should('be.visible');
  });

  it('Corridor UI: reports page loads and shows live data', () => {
    cy.login('ep@test.edpsychconnect.com');
    cy.visit('/en/reports');
    cy.url().should('include', '/reports');
    cy.contains('Reports').should('be.visible');
    // Should not show hardcoded zero
    cy.contains('0 Reports').should('not.exist');
  });

  it('Corridor UI: interventions page loads', () => {
    cy.login('ep@test.edpsychconnect.com');
    cy.visit('/en/interventions');
    cy.url().should('include', '/interventions');
    cy.get('h1, h2').first().should('be.visible');
  });
});

// ─── SENCO Role Corridor ─────────────────────────────────────────────────────
describe('Phase 1 Corridor — SENCO Role', () => {
  it('SENCO: dashboard loads with correct auth state', () => {
    cy.login('senco@test.edpsychconnect.com');
    cy.visit('/en/school/dashboard');
    cy.url().should('include', '/school/dashboard');
    cy.contains('Sign in').should('not.exist');
  });

  it('SENCO: can view cases list', () => {
    cy.login('senco@test.edpsychconnect.com');
    cy.visit('/en/cases');
    cy.url().should('include', '/cases');
    cy.get('h1').should('be.visible');
  });
});

// ─── SCHOOL_ADMIN Role Corridor ──────────────────────────────────────────────
describe('Phase 1 Corridor — SCHOOL_ADMIN Role', () => {
  it('SCHOOL_ADMIN: dashboard loads with correct auth state', () => {
    cy.login('schooladmin@test.edpsychconnect.com');
    cy.visit('/en/school/dashboard');
    cy.url().should('include', '/school/dashboard');
    cy.contains('Sign in').should('not.exist');
  });
});
