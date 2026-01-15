describe('User Settings', () => {
  beforeEach(() => {
    cy.visit('/settings');
  });

  it('should display profile settings form', () => {
    cy.get('h1').should('contain', 'Settings');
    cy.get('form').should('exist');
    cy.get('input[name="email"]').should('be.visible');
  });

  it('should allow updating notification preferences', () => {
    cy.contains('Notifications').click();
    cy.get('input[type="checkbox"]').first().click({ force: true });
    // Simulate save
    cy.contains('Save').click();
    cy.contains('Saved successfully').should('exist');
  });

  it('should handle password change', () => {
    cy.contains('Security').click();
    cy.get('input[name="currentPassword"]').should('exist');
    cy.get('input[name="newPassword"]').should('exist');
  });
});
