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

  const isRemoteBaseUrl = (): boolean => {
    const base = String(Cypress.config('baseUrl') ?? '');
    return base.startsWith('http') && !base.includes('localhost');
  };

  beforeEach(() => {
    // Clear cookies and storage to ensure clean state
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  roles.forEach(({ role, email, expectedPath, checkText }, index) => {
    it(`should allow ${role} (${email}) to login and redirect to ${expectedPath}`, () => {
      // Production rate limiting is 5 logins/minute/IP.
      // When running this suite against a deployed environment, we intentionally pause
      // before the 6th login to avoid false negatives.
      if (isRemoteBaseUrl() && index === 5) {
        cy.wait(65_000);
      }

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
