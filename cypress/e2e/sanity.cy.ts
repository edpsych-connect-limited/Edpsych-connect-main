describe('Sanity Check', () => {
  it('should pass a simple assertion', () => {
    expect(true).to.equal(true);
  });

  it('should check server health via request', () => {
    cy.request('/').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.headers['content-type']).to.include('text/html');
    });
  });

  it('should visit the homepage with extended timeout', () => {
    // We use a very long timeout and failOnStatusCode: false to debug
    cy.visit('/', { timeout: 120000, failOnStatusCode: false });
    cy.get('body').should('exist');
  });
});
