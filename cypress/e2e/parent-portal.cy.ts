describe('Parent Portal', () => {
  it('should allow access to the demo portal', () => {
    cy.visit('/parents');
    cy.contains('Launch Portal Demo').click();
    
    // Verify portal elements
    cy.contains('Parent Portal').should('be.visible');
    cy.contains('Exit Demo').should('be.visible');
    
    // Check for child progress
    // Note: Seed data creates "Amara Singh", so we check for "Amara's Progress"
    cy.contains("Amara's Progress").should('be.visible');
  });

  it('should allow authenticated parent login', () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type('parent@demo.com');
    cy.get('input[name="password"]').type('Test123!');
    cy.get('button[type="submit"]').click();
    
    // Should redirect to parent dashboard
    cy.url().should('include', '/parents'); // or /dashboard depending on routing
  });
});
