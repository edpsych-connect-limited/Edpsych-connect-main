describe('Help Center E2E', () => {
  beforeEach(() => {
    // Visit the help center before each test
    cy.visit('/help');
  });

  it('should display the main help center page with categories', () => {
    // The H1 contains "How can we help you" inside a span structure
    cy.get('h1').should('contain', 'How can we help you');
    cy.get('input[placeholder="Search for help articles, tutorials, features..."]').should('be.visible');
    
    // Check for seeded categories
    cy.contains('Getting Started').should('be.visible');
    cy.contains('Assessments').should('be.visible');
    cy.contains('Interventions').should('be.visible');
  });

  it('should allow searching for articles', () => {
    const searchTerm = 'ECCA';
    cy.get('input[placeholder="Search for help articles, tutorials, features..."]').type(`${searchTerm}{enter}`, { force: true });
    
    // Should show the article in the filtered list
    cy.contains('Complete Guide to the ECCA Assessment Framework').should('be.visible');
  });

  it('should navigate to category view', () => {
    // Click on Assessments category
    cy.contains('h3', 'Assessments').click({ force: true });
    
    // Should show category articles
    // The component highlights the category and filters the list
    cy.contains('Complete Guide to the ECCA Assessment Framework').should('be.visible');
  });

  it('should display FAQs', () => {
    // Click on FAQ tab
    cy.contains('button', 'FAQ').click({ force: true });
    
    // Check for an existing FAQ
    cy.contains('How do I run a Stealth Assessment?').should('be.visible');
    
    // Click to expand
    cy.contains('How do I run a Stealth Assessment?').click({ force: true });
    
    // Verify answer is visible
    cy.contains('Navigate to Assessments > New Assessment').should('be.visible');
  });

  it('should open AI Assistant', () => {
    // Click "Ask AI" button in the hero section
    cy.contains('button', 'Ask AI').click({ force: true });
    
    // Verify Chatbot opens
    cy.contains('AI Assistant').should('be.visible');
    cy.contains('Always here to help').should('be.visible');
    
    // Verify initial message
    cy.contains("I'm your EdPsych Connect AI Assistant").should('be.visible');
    
    // Close chat
    cy.get('button[title="Close chat"]').click({ force: true });
    cy.wait(500); // Wait for animation
    cy.contains('Always here to help').should('not.exist');
  });
});
