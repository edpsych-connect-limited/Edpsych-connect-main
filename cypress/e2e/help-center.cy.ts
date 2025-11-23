describe('Help Center E2E', () => {
  beforeEach(() => {
    // Visit the help center before each test
    cy.visit('/help');
  });

  it('should display the main help center page with categories', () => {
    cy.get('h1').should('contain', 'How can we help you?');
    cy.get('input[placeholder="Search for help articles..."]').should('be.visible');
    
    // Check for seeded categories
    cy.contains('Getting Started').should('be.visible');
    cy.contains('Assessments').should('be.visible');
    cy.contains('Interventions').should('be.visible');
  });

  it('should allow searching for articles', () => {
    const searchTerm = 'ECCA';
    cy.get('input[placeholder="Search for help articles..."]').type(`${searchTerm}{enter}`);
    
    // Should switch to search view
    cy.contains(`Search Results for "${searchTerm}"`).should('be.visible');
    cy.contains('Conducting an ECCA Assessment').should('be.visible');
  });

  it('should navigate to category view', () => {
    cy.contains('Assessments').click();
    
    // Should show category articles
    cy.contains('Assessments Articles').should('be.visible');
    cy.contains('Conducting an ECCA Assessment').should('be.visible');
    cy.contains('Generating Assessment Reports').should('be.visible');
  });

  it('should display article details', () => {
    // Search and click an article
    cy.get('input[placeholder="Search for help articles..."]').type('Welcome{enter}');
    cy.contains('Welcome to EdPsych Connect World').click();

    // Verify article content
    cy.get('h1').should('contain', 'Welcome to EdPsych Connect World');
    cy.contains('Key Features').should('be.visible');
    
    // Verify breadcrumbs
    cy.contains('Help Center').should('be.visible');
  });

  it('should handle feedback submission', () => {
    cy.get('input[placeholder="Search for help articles..."]').type('Welcome{enter}');
    cy.contains('Welcome to EdPsych Connect World').click();

    // Scroll to feedback section
    cy.contains('Was this article helpful?').scrollIntoView();
    
    // Click Yes
    cy.contains('👍 Yes').click();
    
    // Verify success message
    cy.contains('Thank you for your feedback!').should('be.visible');
  });

  it('should display FAQs', () => {
    cy.contains('Frequently Asked Questions').should('be.visible');
    cy.contains('How long does a typical assessment take?').click();
    cy.contains('An ECCA assessment typically takes 45-60 minutes').should('be.visible');
  });
});
