describe('Subscription Checkout Flow', () => {
  beforeEach(() => {
    // Login as a test user (using the command from support/commands.ts)
    // We assume 'parent@demo.com' exists from the seed data
    cy.login('parent@demo.com', 'password123');
  });

  it('should load the checkout page with correct plan details', () => {
    // Visit the checkout page for 'Individual EP' plan
    cy.visit('/en/subscription/checkout?plan=individual-ep&billing=monthly');

    // Verify the page title
    cy.contains('Complete Your Upgrade', { timeout: 10000 }).should('be.visible');

    // Verify Order Summary
    cy.contains('Order Summary').should('be.visible');
    cy.contains('Individual EP').should('be.visible');
    cy.contains('Billing:').should('be.visible');
  });

  it('should show the payment form', () => {
    cy.visit('/en/subscription/checkout?plan=individual-ep&billing=monthly');
    
    // Check for the "Pay" button
    cy.get('button[type="submit"]').should('contain', 'Pay £79.00');
    
    // Check for Stripe Element container
    cy.get('.StripeElement').should('exist');
  });

  it('should handle API validation errors', () => {
    // Test the API endpoint directly
    cy.request({
      method: 'POST',
      url: '/api/subscription/change-tier',
      failOnStatusCode: false, // We expect 400/500
      body: {} // Empty body
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body.error).to.contain('Missing required fields');
    });
  });
});
