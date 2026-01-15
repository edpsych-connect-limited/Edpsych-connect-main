describe('Voice Command Cockpit Integration', () => {
  // Passwords from seeds
  const LA_PASSWORD = 'Bucks2025!Pilot';
  const DEFAULT_PASSWORD = Cypress.env('SEED_TEST_USERS_PASSWORD') || 'Password123!';

  const login = (email, password) => {
    cy.session([email, password], () => {
      cy.visit('/login');
      cy.get('input[name="email"]').type(email);
      cy.get('input[name="password"]').type(password);
      cy.get('button[type="submit"]').click();
      cy.url().should('not.include', '/login');
    });
  };

  it('Verifies Voice Command Interface on SENCO Dashboard', () => {
    login('sen_coordinator@demo.com', DEFAULT_PASSWORD);
    cy.visit('/senco');
    
    // Assert Dashboard Header
    cy.contains('SENCO Dashboard').should('be.visible');
    
    // Assert Voice Interface Presence
    cy.get('[aria-label="Start voice command"]').should('exist');
    cy.get('input[placeholder*="Ask anything"]').should('be.visible');
    
    // Check for context-specific suggested prompt matches
    // Note: Suggestions might be hidden initially or shown in placeholder/dropdown
    // We just verify the component mounted
  });

  it('Verifies Voice Command Interface on EP Dashboard', () => {
    login('dr.patel@test.edpsych.com', DEFAULT_PASSWORD);
    cy.visit('/ep/dashboard');
    
    cy.contains('EP Dashboard').should('be.visible');
    cy.get('[aria-label="Start voice command"]').should('exist');
  });

  it('Verifies Voice Command Interface on LA Dashboard', () => {
    login('caroline.marriott@edpsychconnect.com', LA_PASSWORD);
    cy.visit('/la/dashboard');
    
    cy.contains('EHCP Management Dashboard').should('be.visible');
    cy.get('[aria-label="Start voice command"]').should('exist');
  });
});
