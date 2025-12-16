describe('Coding Curriculum', () => {
  beforeEach(() => {
    cy.visit('/en/demo/coding');
  });

  it('should load the coding curriculum page', () => {
    cy.contains('Developers of Tomorrow').should('be.visible');
    cy.contains('Learn to code by modding your favourite games').should('be.visible');
  });

  it('should display the learning tracks', () => {
    cy.contains('Block Coding').should('be.visible');
    cy.contains('Python').should('be.visible');
    cy.contains('React & Web').should('be.visible');
  });

  it('should allow switching between tracks', () => {
    // Default is Block Coding
    cy.contains('Block Coding Journey').should('be.visible');

    // Switch to Python
    cy.contains('Python').click();
    cy.contains('Python Journey').should('be.visible');

    // Switch to React
    cy.contains('React & Web').click();
    cy.contains('React & Web Journey').should('be.visible');
  });

  it('should display video tutorials', () => {
    // Switch to Videos tab
    cy.contains('button', 'Video Tutorials').click();
    
    // Check for video player presence (mocked or actual)
    cy.contains('Welcome to Your Coding Journey').should('be.visible');
  });

  it('should have interactive elements', () => {
    // Switch to Practice tab
    cy.contains('button', 'Code Editor').click();
    
    // Check for Run Code button
    cy.contains('button', 'Run Code').should('exist');
  });
});
