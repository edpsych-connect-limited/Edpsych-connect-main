describe('Assessment Collaboration Flow', () => {
  const mockAssessmentId = 'test-assessment-id';
  const mockCollaborationId = 'test-collab-id';
  const mockToken = 'test-token-123';
  
  const mockCollaborationData = {
    id: mockCollaborationId,
    token: mockToken,
    type: 'PARENT',
    status: 'PENDING',
    inviteeEmail: 'parent@example.com',
    inviteeName: 'Parent User',
    assessmentId: mockAssessmentId,
    instance: {
      framework: {
        domains: [
          { id: 'd1', name: 'Cognition & Learning', slug: 'cognition' },
          { id: 'd2', name: 'Communication', slug: 'communication' }
        ]
      }
    },
    responses: {}
  };

  it('should allow a collaborator to submit feedback', () => {
    // 1. Intercept the GET request for the collaboration data
    cy.intercept('GET', `/api/assessments/collaborations/${mockToken}`, {
      statusCode: 200,
      body: mockCollaborationData
    }).as('getCollaboration');

    // 2. Intercept the PUT request for submission
    cy.intercept('PUT', `/api/assessments/collaborations/${mockCollaborationId}`, {
      statusCode: 200,
      body: { success: true }
    }).as('submitCollaboration');

    // 3. Visit the collaboration page
    cy.visit(`/collaborate/${mockToken}`);

    // 4. Verify loading and data display
    cy.wait('@getCollaboration');
    cy.contains('Parent User').should('be.visible');
    cy.contains('Cognition & Learning').should('be.visible');

    // 5. Fill out the form (assuming standard inputs based on domains)
    // Note: This depends on the exact structure of CollaborativeInputForm.tsx
    // For now, we'll check for the presence of the form and submit button
    
    cy.get('button[type="submit"]').should('be.visible');
    
    // Simulate filling text areas if they exist
    cy.get('textarea').first().type('This is test feedback for the first domain.');

    // 6. Submit the form
    cy.get('button[type="submit"]').click();

    // 7. Verify submission
    cy.wait('@submitCollaboration');
    cy.contains('Thank you').should('be.visible');
  });
});
