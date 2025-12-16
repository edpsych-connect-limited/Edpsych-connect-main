describe('Parent Portal', () => {
  it('should allow access to the demo portal', () => {
    // The Parent Portal header uses responsive nav (desktop links live under `lg:flex`).
    // Force a desktop viewport so visibility assertions are deterministic.
    cy.viewport(1280, 720);

    // Ensure the portal can load secured data paths deterministically.
    // (In demo mode, the app may use mock data; when authenticated it may load real seeded data.)
    cy.login('parent@demo.com');
    cy.visit('/parents');
    cy.contains('Launch Portal Demo')
      .scrollIntoView({ block: 'center' })
      .should('be.visible')
      .click({ scrollBehavior: 'center' });
    
    // Verify portal elements
    cy.contains('Parent Portal').should('be.visible');
    cy.contains('Exit Demo').should('be.visible');
    
    // Check for portal content
    cy.contains("This Week's Wins", { timeout: 20000 }).should('be.visible');
  });

  it('should allow authenticated parent login', () => {
    cy.viewport(1280, 720);
    cy.login('parent@demo.com');
    cy.visit('/parents');
    cy.contains('Launch Portal Demo').should('be.visible');
  });
});
