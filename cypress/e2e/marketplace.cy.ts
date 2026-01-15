describe('Marketplace & Booking Flow', () => {
  beforeEach(() => {
    // Visit marketplace page before each test
    cy.visit('/marketplace');
  });

  it('should display the marketplace list', () => {
    cy.get('h1').should('contain', 'Find an Educational Psychologist');
    // Basic connectivity check: ensure at least one profile card loads
    // Note: This depends on seeded data. Mocking would be better for pure unit tests,
    // but for E2E we want to verify the seed data display.
    cy.get('[data-testid="professional-card"], .grid > div').should('have.length.gt', 0);
  });

  it('should filter professionals by search query', () => {
    const searchTerm = 'Scott';
    cy.get('input[placeholder*="Search"]').type(searchTerm);
    // Wait for debounce
    cy.wait(1000); 
    
    // Should find the founder
    cy.get('body').should('contain', 'Dr Scott');
  });

  it('should navigate to valid booking form', () => {
    // Navigate to the first available professional
    // Looking for a 'View Profile' or 'Book' button
    cy.contains('View Profile').first().click();

    // Verify we are on a profile page or booking page
    cy.url().should('include', '/marketplace');
    
    // Finds the "Book Consultation" or similar CTA
    cy.contains('Book Consultation').click();
    
    // Should see the booking form inputs
    cy.get('input[name="subject"]').should('be.visible');
    cy.get('input[name="preferredDate"]').should('be.visible');
  });

  it('should submit a booking enquiry', () => {
    // Setup - Go straight to booking form if possible, or navigate
    // For E2E we'll navigate normally
    cy.contains('View Profile').first().click();
    cy.contains('Book Consultation').click();

    // Fill form
    cy.get('input[name="subject"]').type('E2E Test Booking Request');
    cy.get('input[name="preferredDate"]').type('2026-02-01');
    cy.get('input[name="preferredDate"]').blur(); // Trigger validation/close picker
    
    // Select dropdown
    cy.get('select[name="preferredTime"]').select('Morning');
    
    // Fill textarea
    cy.get('textarea[name="message"]').type('This is an automated test ensuring 100% feature coverage.');

    // Submit
    cy.get('form').submit();

    // Verify Success State
    // "Request Sent!" is the text in BookingForm.tsx success state
    cy.contains('Request Sent!', { timeout: 10000 }).should('be.visible');
    
    // Verify Link Navigation (The fix I applied)
    cy.get('a[href="/dashboard"]').should('exist');
    cy.get('a[href="/marketplace"]').should('exist');
  });
});
