describe('Help Center Robustness (Enterprise Grade)', () => {
  beforeEach(() => {
    cy.visit('/help');
    
    // Intercept the chat API to provide a deterministic, complex response
    // ensuring our parsing logic works for all edge cases (citations, markdown, etc.)
    cy.intercept('POST', '/api/ai/chat', (req) => {
      // Robust mock response simulating the AI's output format
      req.reply({
        statusCode: 200,
        body: {
          message: "To perform an **ECCA assessment**, follow these steps:\n\n1. Go to the Assessment Dashboard.\n2. Click 'New Assessment'.\n3. Select 'ECCA Framework'.\n\nThis framework ensures compliance with statutory requirements [1].",
          citations: [
            { id: 1, title: "ECCA Guidelines", url: "/help/articles/ecca-guidelines" }
          ],
          suggestedActions: [
            { label: "Start Assessment", action: "navigate", target: "/assessments/new" },
            { label: "Read Guide", action: "navigate", target: "/help/articles/ecca-guide" }
          ]
        }
      });
    }).as('askAi');
  });

  it('should handle complex AI responses with formatting and citations correctly', () => {
    // 1. Open the AI Assistant
    cy.contains('button', 'Ask AI').click({ force: true });
    cy.contains('AI Assistant').should('be.visible');

    // 2. Send a query
    const query = 'How do I run an ECCA assessment?';
    cy.get('input[placeholder="Ask a question..."]').type(`${query}{enter}`);

    // 3. Verify the user message appears
    cy.contains(query).should('be.visible');

    // 4. Wait for the mocked API response
    cy.wait('@askAi');

    // 5. Verify the AI response parsing (Robustness Check)
    
    // Check for Markdown rendering (Bold text)
    // The component likely renders markdown, so we check for the strong tag or styled element
    // Only asserting text content first to be safe
    cy.contains('ECCA assessment').should('be.visible');

    // Check for List rendering
    cy.contains('Go to the Assessment Dashboard').should('be.visible');
    
    // Check for Citation rendering [1]
    cy.get('button').contains('[1]').should('be.visible');
    
    // Check if the citation expands/shows details (if applicable) or just exists
    // Assuming the UI displays citations list below or via hover, we check for the title "ECCA Guidelines"
    cy.contains('Sources').should('be.visible');
    cy.contains('ECCA Guidelines').should('be.visible');
  });

  it('should gracefully handle empty or malformed responses', () => {
    // Robustness: What happens if the API fails or returns junk?
    cy.intercept('POST', '/api/ai/chat', {
        statusCode: 500,
        body: { error: 'Internal Server Error' }
    }).as('askAiError');

    cy.contains('button', 'Ask AI').click({ force: true });
    cy.get('input[placeholder="Ask a question..."]').type('Broken query{enter}');
    cy.wait('@askAiError');

    // Check for error state in UI
    cy.contains('something went wrong').should('be.visible');
  });
});
