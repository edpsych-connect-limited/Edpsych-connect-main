describe('Sanity Check', () => {
  it('should pass a simple assertion', () => {
    expect(true).to.equal(true);
  });

  it('should visit the homepage', () => {
    cy.visit('/');
    cy.get('body').should('exist');
  });
});
