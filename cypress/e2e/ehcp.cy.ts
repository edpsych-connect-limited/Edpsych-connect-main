describe('EHCP Management Workflow', () => {
  beforeEach(() => {
    // Ensure we are on the domain before logging in to set localStorage correctly
    cy.visit('/en/login');
    
    // Use the custom login command which is faster and more reliable
    cy.login('ep@demo.com', 'Test123!');
    
    // Verify token is set
    cy.window().then(win => {
       const token = win.localStorage.getItem('accessToken');
       if (!token) throw new Error('Token not set immediately after login');
    });

    // Visit the dashboard to ensure we are logged in
    cy.visit('/en/dashboard');
    cy.url().should('include', '/dashboard');
  });

  it('should navigate to EHCP list and display plans', () => {
    cy.visit('/en/ehcp');
    
    cy.window().then(win => {
      const token = win.localStorage.getItem('accessToken');
      const userData = win.localStorage.getItem('userData');
      cy.log('AccessToken:', token ? 'Present' : 'Missing');
      cy.log('UserData:', userData);
      
      if (!token || !userData) {
        throw new Error('Auth data missing from localStorage');
      }
    });

    // Debugging: Write body to file
    cy.get('body').then($body => {
      cy.writeFile('cypress_ehcp_debug.txt', 'URL: ' + window.location.href + '\n\nBody:\n' + $body.text());
    });

    cy.contains('h1', 'EHCNA Request & Information', { timeout: 10000 }).should('be.visible');
    
    // Wait for loading to finish
    cy.contains('Loading EHCPs...').should('not.exist');

    // Check for error
    cy.get('body').then($body => {
      if ($body.text().includes('Error fetching EHCPs')) {
         cy.log('Error fetching EHCPs detected');
         throw new Error('Page showed error fetching EHCPs');
      }
    });
    
    // Check for list elements or empty state
    cy.get('body').then($body => {
      if ($body.find('table').length > 0) {
        cy.get('table').should('be.visible');
      } else {
        cy.contains('No EHCPs found').should('be.visible');
      }
    });

    cy.contains('Start New Request').should('be.visible');
  });

  it('should allow creating a new EHCP draft', () => {
    cy.visit('/en/ehcp');
    // Force click to avoid "detached from DOM" errors if the page re-renders
    cy.contains('Start New Request').should('be.visible').click({ force: true });
    
    // Verify we navigated to the new EHCP page
    cy.url().should('include', '/ehcp/new');
  });

  it('should view an existing EHCP details', () => {
    // Navigate to list first
    cy.visit('/en/ehcp');
    
    cy.get('body').then($body => {
      if ($body.find('table').length > 0) {
        // Click the first View button
        cy.contains('button', 'View').first().click({ force: true });
        
        // Check for details page content
        // The details page URL should contain an ID
        cy.url().should('match', /\/ehcp\/\d+/);
      } else {
        cy.log('No EHCPs found, skipping view details test');
      }
    });
  });
});
