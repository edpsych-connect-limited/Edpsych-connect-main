describe('Interactive Demo E2E', () => {
  beforeEach(() => {
    cy.visit('/demo');
  });

  it('should load the demo page with correct layout', () => {
    cy.get('h1').should('contain', 'Experience the Invisible Brain');
    cy.contains('Active Agents').should('be.visible');
    cy.contains('Curriculum Designer').should('be.visible');
  });

  it('should allow interaction with the AI demo', () => {
    // Check if the chat interface is visible
    cy.contains('AI Assistant Terminal').should('be.visible');
    cy.contains('Welcome to EdPsych Connect World!').should('be.visible');

    // Use a preset question
    cy.contains('Create a learning path for GCSE maths').click();

    // Verify user message appears
    cy.contains('Create a learning path for GCSE maths', { timeout: 1000 }).should('be.visible');

    // Verify AI thinking process appears (this might take a moment)
    cy.contains('thinking process:', { timeout: 5000 }).should('be.visible');
    
    // Verify AI response appears eventually
    cy.contains("I've analyzed the complete UK GCSE mathematics curriculum", { timeout: 10000 }).should('be.visible');
  });

  it('should handle custom input', () => {
    const customQuestion = 'How do I support a student with ADHD?';
    cy.get('input[placeholder="Type your question here..."]').type(`${customQuestion}{enter}`);

    // Verify user message
    cy.contains(customQuestion).should('be.visible');

    // Verify response generation starts (spinner or thinking)
    cy.get('form button[disabled]').should('exist');
  });
});
