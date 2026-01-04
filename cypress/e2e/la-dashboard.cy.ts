describe('LA Dashboard', () => {
  it('should load the dashboard for an LA Admin', () => {
    // Increase timeout for this test
    Cypress.config('defaultCommandTimeout', 30000);
    
    const password = Cypress.env('SEED_TEST_USERS_PASSWORD');
    if (!password) {
      throw new Error('SEED_TEST_USERS_PASSWORD env var is required');
    }
    
    cy.login('la_admin@demo.com', password);
    
    // Intercept the API call before visiting
    cy.intercept('GET', '/api/la/compliance*').as('getCompliance');

    cy.visit('/la/dashboard');
    
    // Verify API call
    cy.wait('@getCompliance', { timeout: 60000 }).its('response.statusCode').should('eq', 200);

    // Verify dashboard elements
    cy.contains('Compliance Rate', { timeout: 30000 }).should('be.visible');
    cy.contains('Active Cases').should('be.visible');
  });
});
