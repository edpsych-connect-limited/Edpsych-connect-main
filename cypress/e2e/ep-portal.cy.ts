/**
 * EP Portal E2E Tests
 * Updated to match live data-driven dashboard (no hardcoded mock names)
 */

describe('EP Portal', () => {
  beforeEach(() => {
    cy.login('ep@test.edpsychconnect.com');
  });

  it('should load the EP dashboard with correct structure', () => {
    cy.visit('/en/ep/dashboard');
    cy.url().should('include', '/ep/dashboard');

    // Header
    cy.contains('EP Portal').should('be.visible');
    cy.contains('My Caseload').should('be.visible');

    // Stat cards
    cy.contains('Active Cases').should('be.visible');
    cy.contains('Draft Reports').should('be.visible');

    // Quick access
    cy.contains('EP Toolkit').should('be.visible');
    cy.contains('Full Assessment Library').should('be.visible');
  });

  it('should show Start Assessment button linking to /assessments/new', () => {
    cy.visit('/en/ep/dashboard');
    cy.contains('a', 'Start Assessment').should('have.attr', 'href').and('include', '/assessments/new');
  });

  it('should NOT show any hardcoded mock student names', () => {
    cy.visit('/en/ep/dashboard');
    cy.contains('Leo Thompson').should('not.exist');
    cy.contains('Michael Chang').should('not.exist');
    cy.contains('Dr. Sarah Chen').should('not.exist');
  });

  it('should allow navigation to cases', () => {
    cy.visit('/en/ep/dashboard');
    cy.contains('a', 'All Cases').should('exist').and('have.attr', 'href').and('include', '/cases');
  });

  it('should allow navigation to EHCP', () => {
    cy.visit('/en/ep/dashboard');
    cy.contains('a', 'EHCP').should('exist');
  });
});
