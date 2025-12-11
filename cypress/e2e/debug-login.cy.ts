describe('Debug Login', () => {
  it('should load signin page', () => {
        cy.visit('/login');
    cy.contains('Sign in');
  });
});
