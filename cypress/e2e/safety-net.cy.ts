
describe('Safety Net & Simulation E2E', () => {
  beforeEach(() => {
    // The Golden Thread demo is public or accessible to logged in users
    // We'll login as Admin just in case
    cy.login('admin@demo.com');
  });

  it('should display the Golden Thread Dashboard', () => {
    cy.visit('/demo/golden-thread');
    cy.contains('The Golden Thread').should('be.visible');
    cy.contains('Autonomous Educational Intelligence').should('be.visible');
    
    // Take snapshot
    cy.screenshot('golden-thread-dashboard');
  });

  it('should show live simulation data', () => {
    cy.visit('/demo/golden-thread');
    
    // Check for the Live System Log
    cy.contains('Live System Log').should('be.visible');
    
    // Check for the stages
    cy.contains('1. Discovery').should('be.visible');
    cy.contains('2. Analysis').should('be.visible');
    cy.contains('3. Action').should('be.visible');
    cy.contains('4. Communication').should('be.visible');
    
    // Take snapshot
    cy.screenshot('simulation-active');
  });

  it('should allow interaction with simulation stages', () => {
    cy.visit('/demo/golden-thread');
    
    // Click on "Investigate" button in the first stage (Discovery)
    // Note: The button text depends on the active stage. 
    // Initially activeStage is 0 (Discovery).
    cy.contains('Forensic Audit Results').should('be.visible');
    
    // Find the "Investigate" button and click it
    cy.contains('button', 'Investigate').click();
    
    // Should move to next stage (Analysis)
    // Wait for animation/transition
    cy.wait(1000);
    cy.contains('Live Cognitive Profiling').should('be.visible');
  });
});
