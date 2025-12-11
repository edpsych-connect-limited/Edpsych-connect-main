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
    cy.contains('AI Coordinator').should('be.visible');
    cy.contains('How can I assist you today?').should('be.visible');

    // Use a preset question
    cy.contains('Plan a lesson on fractions for Year 5').click({ force: true });
    
    // Click send button to submit the preset question
    cy.get('button[aria-label="Send message"]').click({ force: true });

    // Verify user message appears
    cy.contains('Plan a lesson on fractions for Year 5', { timeout: 1000 }).should('be.visible');

    // Verify AI thinking process appears
    cy.contains('AI Processing', { timeout: 5000 }).should('be.visible');
    
    // Verify AI response appears eventually
    cy.contains("Lesson Plan: Understanding Fractions", { timeout: 15000 }).should('be.visible');
  });

  it('should handle custom input', () => {
    const customQuestion = 'How do I support a student with ADHD?';
    cy.get('textarea[placeholder="Type your message or use voice..."]').type(`${customQuestion}`, { force: true });
    cy.get('button[aria-label="Send message"]').click({ force: true });

    // Verify user message
    cy.contains(customQuestion).should('be.visible');

    // Verify response generation starts
    cy.contains('AI Processing', { timeout: 5000 }).should('be.visible');
  });
});
