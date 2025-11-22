/**
 * Systematic Role Smoke Test
 * Verifies that key stakeholders can login and reach their appropriate dashboards.
 */

describe('Systematic Role Verification', () => {
  const password = 'Test123!';
  const baseUrl = Cypress.config('baseUrl') || 'http://localhost:3000';

  const roles = [
    {
      role: 'Super Admin',
      email: 'admin@demo.com',
      expectedPath: '/admin',
      checkText: 'Admin' // Assuming admin dashboard has "Admin" text
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
      expectedPath: '/dashboard',
      checkText: 'Dashboard'
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
      cy.visit(`${baseUrl}/login`);

      // Fill in credentials
      cy.get('input[type="email"]').type(email);
      cy.get('input[type="password"]').type(password);

      // Submit form
      cy.get('button[type="submit"]').click();

      // Verify redirect
      // We increase timeout because cold start might be slow
      cy.url({ timeout: 15000 }).should('include', expectedPath);

      // Verify basic content to ensure page loaded
      cy.contains(checkText, { timeout: 10000 }).should('be.visible');
      
      // Verify user name is displayed (welcome message)
      // The dashboard usually says "Welcome back, [Name]"
      cy.contains('Welcome back').should('be.visible');
    });
  });
});
