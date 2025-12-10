/**
 * E2E tests for login functionality
 */

describe('Login Page', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
    const baseUrl = Cypress.config('baseUrl') || 'http://localhost:3002';
    cy.visit(`${baseUrl}/login`, { failOnStatusCode: false });
  });

  it('should display the login form', () => {
    cy.get('h1').should('contain.text', 'EdPsych Connect World');
    cy.get('form').should('exist');
    cy.get('input[type="email"]').should('exist');
    cy.get('input[type="password"]').should('exist');
    cy.get('button[type="submit"]').should('exist').and('contain.text', 'Sign in');
  });

  // HTML5 validation is used, so custom error messages are not shown in the DOM
  // it('should show validation errors for empty form submission', () => {
  //   cy.get('button[type="submit"]').click();
  //   cy.get('form').contains('Email is required').should('be.visible');
  //   cy.get('form').contains('Password is required').should('be.visible');
  // });

  it('should show error message for invalid credentials', () => {
    // Use real API call
    cy.get('input[type="email"]').type('invalid@example.com');
    cy.get('input[type="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    
    // Wait for the error message
    cy.contains('Invalid email or password').should('be.visible');
  });

  it('should redirect to dashboard after successful login', () => {
    // Use real API call instead of mock
    // Note: This requires the backend to be running and the user to exist in the database
    // For a true E2E test, we should seed a test user before running this test
    
    // We'll use the test user credentials that should be seeded in the database
    const testUser = {
      email: 'teacher@demo.com', 
      password: 'Test123!'
    };

    cy.get('input[type="email"]').type(testUser.email);
    cy.get('input[type="password"]').type(testUser.password);
    cy.get('button[type="submit"]').click();
    
    // Check redirect to dashboard
    // We increase timeout because real API calls might take longer than mocks
    cy.url({ timeout: 10000 }).should('include', '/dashboard');
  });

  it('should have a "Forgot Password" link', () => {
    cy.contains('a', 'Forgot your password?')
      .should('be.visible')
      .should('have.attr', 'href')
      .and('include', '/forgot-password');
  });

  it('should have a registration link for new users', () => {
    cy.contains('a', 'Create an account')
      .should('be.visible')
      .should('have.attr', 'href')
      .and('include', '/register');
  });

  // it('should maintain accessibility standards', () => {
  //   // Check for accessibility violations
  //   cy.injectAxe();
  //   cy.checkA11y();
  // });

  context('Responsive Design', () => {
    it('should display correctly on mobile', () => {
      cy.viewport('iphone-x');
      cy.get('form').should('be.visible');
      cy.get('input[type="email"]').should('be.visible');
      cy.get('input[type="password"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
    });

    it('should display correctly on tablet', () => {
      cy.viewport('ipad-2');
      cy.get('form').should('be.visible');
    });

    it('should display correctly on desktop', () => {
      cy.viewport(1280, 800);
      cy.get('form').should('be.visible');
    });
  });
});