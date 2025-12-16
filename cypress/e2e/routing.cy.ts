describe('Routing & Navigation Audit', () => {
  
  describe('2.1 Public Routes', () => {
    const publicRoutes = [
      '/',
      '/en',
      '/en/login',
      '/en/beta-register',
      '/en/pricing',
      '/en/demo',
      '/en/help',
      '/en/about',
      '/en/contact',
      '/en/blog'
    ];

    publicRoutes.forEach((route) => {
      it(`should load ${route} without errors`, () => {
        // Verify status code first
        cy.request(route).its('status').should('eq', 200);
        
        // Then verify rendering
        cy.visit(route);
        cy.get('body').should('exist');
        
        // Check for 404
        cy.contains('404').should('not.exist');
        cy.contains('Page Not Found').should('not.exist');
        
        // Check for 500 (Internal Server Error) specifically
        // We avoid checking for just "500" as it appears in content (e.g. "500 pupils")
        cy.contains('Internal Server Error').should('not.exist');
      });
    });
  });

  describe('2.2 Protected Routes (Teacher)', () => {
    beforeEach(() => {
      cy.login('teacher@demo.com');
    });

    const teacherRoutes = [
      '/en/dashboard',
      '/en/assessments',
      '/en/interventions',
      '/en/reports',
      '/en/settings'
    ];

    teacherRoutes.forEach((route) => {
      it(`should load ${route} for authenticated teacher`, () => {
        cy.visit(route);
        cy.url().should('include', route);
        cy.contains('404').should('not.exist');
        cy.contains('Page Not Found').should('not.exist');
      });
    });
  });
});
