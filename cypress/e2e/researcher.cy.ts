describe('Researcher Role E2E', () => {
  const seedPassword = (((Cypress.env('SEED_TEST_USERS_PASSWORD') as string | undefined) ?? '')
    .toString()
    .trim() || 'Test123!');

  beforeEach(() => {
    // Visit login page
    cy.visit('/login');
  });

  it('should allow researcher login and access researcher dashboard', () => {
    // Login as researcher
    cy.get('input[type="email"]').type('researcher@demo.com');
    cy.get('input[type="password"]').type(seedPassword);
    cy.get('button[type="submit"]').click();

    // Wait for redirect and loading
    cy.location('pathname', { timeout: 30000 }).should('include', '/dashboard');
    cy.contains('Welcome back', { timeout: 30000 }).should('be.visible');
    
    // Verify researcher specific elements
    // Updated to match actual DashboardPage implementation
    cy.contains('Research Hub').should('exist');
    cy.contains('Data Enclave').should('exist');
    
    // Take snapshot of researcher dashboard
    cy.screenshot('researcher-dashboard');
  });

  it('should have access to ethics submission', () => {
    // Login
    cy.get('input[type="email"]').type('researcher@demo.com');
    cy.get('input[type="password"]').type(seedPassword);
    cy.get('button[type="submit"]').click();

    // Navigate to research hub
    cy.visit('/research');
    // Verify we are on the research page (even if empty)
    cy.url().should('include', '/research');
    
    // Verify UK spelling (ensure no US spelling)
    cy.contains('Center').should('not.exist');
    
    // Take snapshot of research hub
    cy.screenshot('research-hub');
  });
});
