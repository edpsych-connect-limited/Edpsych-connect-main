describe('EP Portal', () => {
    beforeEach(() => {
        cy.login('ep@demo.com');
    });

    it('should access the EP Dashboard and display essential widgets', () => {
        cy.visit('/ep/dashboard');
        
        // Wait for dashboard content
        cy.url().should('include', '/ep/dashboard');
        
        // Header
        cy.contains('EP Portal').should('be.visible');

        // Main Sections
        cy.contains("Today's Schedule").should('be.visible');
        cy.contains('Reports Due').should('be.visible');
        cy.contains('Professional Toolkit').should('be.visible');
        
        // Specific content based on page.tsx static/dynamic data
        cy.contains('Observation: Leo Thompson').should('be.visible');
        cy.contains("St. Mary's Primary").should('be.visible');

        // Toolkit check - wiring verification
        // The page slices the first 3 EP tools. We check for at least one known tool or just content presence.
        // Assuming ASSESSMENT_LIBRARY data is loaded. We can check for "View Full Library" link.
        cy.contains('View Full Library').should('be.visible');
    });

    it('should allow navigation to assessment creation', () => {
        cy.visit('/ep/dashboard');
        // Check "Start Assessment" button
        cy.contains('a', 'Start Assessment').should('have.attr', 'href', '/assessments/new');
    });
});
