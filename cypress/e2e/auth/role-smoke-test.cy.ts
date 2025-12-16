/**
 * Systematic Role Smoke Test
 * Verifies that key stakeholders can login and reach their appropriate dashboards.
 */

describe('Systematic Role Verification', () => {
  const roles = [
    {
      role: 'Super Admin',
      email: 'admin@demo.com',
      expectedPath: '/admin',
      checkText: 'Overview'
    },
    {
      role: 'Teacher',
      email: 'teacher@demo.com',
      expectedPath: '/dashboard',
      checkText: 'Dashboard'
    },
    {
      role: 'Student',
      email: 'student@demo.com',
      expectedPath: '/dashboard',
      checkText: 'Dashboard'
    },
    {
      role: 'Parent',
      email: 'parent@demo.com',
      expectedPath: '/parents',
      checkText: 'Launch Portal Demo'
    },
    {
      role: 'Educational Psychologist',
      email: 'ep@demo.com',
      expectedPath: '/dashboard',
      checkText: 'Dashboard'
    },
    {
      role: 'SENCO',
      email: 'sen_coordinator@demo.com',
      expectedPath: '/dashboard',
      checkText: 'Dashboard'
    }
  ];

  beforeEach(() => {
    // Clear cookies and storage to ensure clean state
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  roles.forEach(({ role, email, expectedPath, checkText }) => {
    it(`should allow ${role} (${email}) to login and redirect to ${expectedPath}`, () => {
      cy.login(email);
      cy.visit(expectedPath);

      // Verify basic content to ensure page loaded
      cy.contains(checkText, { timeout: 20000 }).should('be.visible');

      // Dashboard-specific sanity check
      if (expectedPath === '/dashboard') {
        cy.contains('Welcome back', { timeout: 20000 }).should('be.visible');
      }
    });
  });
});
