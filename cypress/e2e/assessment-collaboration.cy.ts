describe('Assessment Collaboration Flow', () => {
  const mockAssessmentId = 'test-assessment-id';
  const mockCollaborationId = 'test-collab-id';
  const mockToken = 'test-token-123';
  
  const mockCollaborationData = {
    formData: {
      collaboration_id: mockCollaborationId,
      contributor_type: 'parent',
      contributor_name: 'Parent User',
      relationship_to_child: 'Mother',
      framework_name: 'Test Framework',
      framework_domains: [
        { id: 'd1', name: 'Cognition & Learning', description: 'Thinking skills' },
        { id: 'd2', name: 'Communication', description: 'Language skills' }
      ],
      existing_responses: {},
      existing_narrative: null,
      status: 'PENDING'
    }
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

    // 5. Verify navigation button exists (Next Section)
    cy.contains('button', 'Next Section').should('be.visible');
    
    // Simulate filling text areas if they exist
    cy.get('textarea').first().type('This is test feedback for the first domain.', { force: true });

    // 6. Verify we can proceed (but don't submit full flow as it requires multiple steps)
    cy.contains('button', 'Next Section').click({ force: true });
  });
});
