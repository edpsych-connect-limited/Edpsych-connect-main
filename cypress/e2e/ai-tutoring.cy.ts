describe('AI Tutoring Interface', () => {
  const seedPassword = (((Cypress.env('SEED_TEST_USERS_PASSWORD') as string | undefined) ?? '')
    .toString()
    .trim() || 'Test123!');

  beforeEach(() => {
    cy.visit('/login');
    cy.get('input[name="email"]').type('student@demo.com');
    cy.get('input[name="password"]').type(seedPassword);
    cy.get('button[type="submit"]').click();
  });

  it('should load the tutoring interface', () => {
    cy.visit('/ai-agents');
    cy.contains('AI Tutor').should('exist'); // Adjust based on actual text
  });

  it('should allow submitting a tutoring request', () => {
    // Intercept the API call
    cy.intercept('POST', '**/api/orchestrator/tutor').as('tutoringRequest');

    cy.visit('/ai-agents');
    cy.url().should('include', '/ai-agents');
    
    // Fill out form
    // Select subject from dropdown - use force click and wait for options
    cy.contains('Select a subject').click({ force: true });
    cy.get('[role="option"]', { timeout: 10000 }).contains('Mathematics').click({ force: true });
    
    // Verify selection was made and dropdown closed
    cy.contains('Select a subject').should('not.exist');
    cy.contains('Mathematics').should('exist');
    
    // Fill topic
    cy.get('input[id="topic"]').type('Algebra', { force: true });

    // Fill learning objective
    cy.contains('label', 'Learning Objectives')
      .parent()
      .find('input')
      .first()
      .type('Understand linear equations', { force: true });
    
    // Submit
    cy.contains('button', 'Get Tutoring Help').click({ force: true });
    
    // Check for loading state
    cy.contains('Preparing your request', { timeout: 15000 }).should('be.visible');
  });
});
