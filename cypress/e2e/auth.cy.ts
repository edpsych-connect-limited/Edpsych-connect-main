/**
 * Authentication E2E Tests
 * 
 * Tests the login flow, session management, and authentication redirects
 */

describe('Authentication Flow', () => {
  beforeEach(() => {
    // Clear cookies and localStorage before each test
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  describe('Login Page', () => {
    it('should display the login page correctly', () => {
      cy.visit('/en/login');
      
      // Check page elements
      cy.contains('EdPsych Connect').should('be.visible');
      cy.contains('Sign in to your account').should('be.visible');
      cy.get('input[name="email"]').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
      cy.contains('Forgot your password?').should('be.visible');
    });

    it('should show secure environment notice', () => {
      cy.visit('/en/login');
      cy.contains('Secure Environment').should('be.visible');
      cy.contains('GDPR').should('be.visible');
    });

    it('should have accessible form fields', () => {
      cy.visit('/en/login');
      
      // Check labels are associated with inputs
      cy.get('label[for="email"]').should('be.visible');
      cy.get('label[for="password"]').should('be.visible');
      
      // Check aria attributes
      cy.get('input[name="email"]').should('have.attr', 'aria-describedby');
      cy.get('input[name="password"]').should('have.attr', 'aria-describedby');
    });

    it('should show validation errors for empty form submission', () => {
      cy.visit('/en/login');
      
      // Try to submit without filling fields
      cy.get('button[type="submit"]').click();
      
      // HTML5 validation should prevent submission
      cy.get('input[name="email"]:invalid').should('exist');
    });

    it('should show error message for invalid credentials', () => {
      cy.visit('/en/login');
      
      // Enter invalid credentials
      cy.get('input[name="email"]').type('invalid@test.com');
      cy.get('input[name="password"]').type('wrongpassword');
      cy.get('button[type="submit"]').click();
      
      // Wait for and check error message
      cy.contains('Login Failed', { timeout: 10000 }).should('be.visible');
      cy.contains('Invalid email or password').should('be.visible');
    });

    it('should toggle remember me checkbox', () => {
      cy.visit('/en/login');
      
      // Check remember me functionality
      cy.get('input[name="remember-me"]').should('not.be.checked');
      cy.get('input[name="remember-me"]').click();
      cy.get('input[name="remember-me"]').should('be.checked');
    });
  });

  describe('Beta Login Page', () => {
    it('should display the beta login page correctly', () => {
      cy.visit('/en/beta-login');
      
      cy.contains('Beta Tester Access').should('be.visible');
      cy.get('input[name="email"]').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');
      cy.get('input[name="betaCode"]').should('be.visible');
    });

    it('should show beta terms and conditions', () => {
      cy.visit('/en/beta-login');
      
      // Beta login should have terms
      cy.contains('terms', { matchCase: false }).should('be.visible');
    });
  });

  describe('Beta Registration Page', () => {
    it('should display the beta registration page correctly', () => {
      cy.visit('/en/beta-register');
      
      cy.contains('Join the Beta').should('be.visible');
      cy.get('input[name="email"]').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');
      cy.get('input[name="confirmPassword"]').should('be.visible');
      cy.get('input[name="firstName"]').should('be.visible');
      cy.get('input[name="lastName"]').should('be.visible');
      cy.get('input[name="betaCode"]').should('be.visible');
    });

    it('should have role selection options', () => {
      cy.visit('/en/beta-register');
      
      // Check role radio buttons exist
      cy.contains('Teacher').should('be.visible');
      cy.contains('Educational Psychologist').should('be.visible');
      cy.contains('SENCO').should('be.visible');
    });

    it('should validate password requirements', () => {
      cy.visit('/en/beta-register');
      
      // Fill in form with weak password
      cy.get('input[name="email"]').type('test@example.com', { force: true });
      cy.get('input[name="password"]').type('weak', { force: true });
      cy.get('input[name="confirmPassword"]').type('weak', { force: true });
      cy.get('input[name="firstName"]').type('Test', { force: true });
      cy.get('input[name="lastName"]').type('User', { force: true });
      cy.get('input[name="betaCode"]').type('BETA2025', { force: true });
      
      // Try to submit
      cy.get('button[type="submit"]').click({ force: true });
      
      // Should show password requirements error
      cy.contains('8 characters', { timeout: 5000 }).should('be.visible');
    });

    it('should validate password confirmation match', () => {
      cy.visit('/en/beta-register');
      
      cy.get('input[name="password"]').type('Password123!', { force: true });
      cy.get('input[name="confirmPassword"]').type('DifferentPassword123!', { force: true });
      
      // Should show mismatch error on blur
      cy.get('input[name="confirmPassword"]').blur({ force: true });
      cy.contains('match', { matchCase: false, timeout: 5000 }).should('be.visible');
    });

    it('should require terms acceptance', () => {
      cy.visit('/en/beta-register');
      
      // Fill in all required fields
      cy.get('input[name="email"]').type('test@example.com', { force: true });
      cy.get('input[name="password"]').type('Password123!', { force: true });
      cy.get('input[name="confirmPassword"]').type('Password123!', { force: true });
      cy.get('input[name="firstName"]').type('Test', { force: true });
      cy.get('input[name="lastName"]').type('User', { force: true });
      cy.get('input[name="betaCode"]').type('BETA2025', { force: true });
      cy.get('select[name="role"]').select('TEACHER', { force: true });
      
      // Don't accept terms, try to submit
      cy.get('button[type="submit"]').should('be.disabled');
    });
  });

  describe('Protected Routes', () => {
    it('should redirect unauthenticated users from dashboard to login', () => {
      cy.visit('/en/dashboard');
      
      // Should redirect to login
      cy.url().should('include', '/login');
    });

    it('should redirect unauthenticated users from admin to login', () => {
      cy.visit('/en/admin');
      
      // Should redirect to login
      cy.url().should('include', '/login');
    });

    it('should redirect unauthenticated users from settings to login', () => {
      cy.visit('/en/settings');
      
      // Should redirect to login
      cy.url().should('include', '/login');
    });
  });

  describe('Public Routes', () => {
    it('should allow access to home page', () => {
      cy.visit('/en');
      cy.url().should('include', '/en');
    });

    it('should allow access to pricing page', () => {
      cy.visit('/en/pricing');
      cy.url().should('include', '/pricing');
    });

    it('should allow access to about page', () => {
      cy.visit('/en/about');
      cy.url().should('include', '/about');
    });

    it('should allow access to contact page', () => {
      cy.visit('/en/contact');
      cy.url().should('include', '/contact');
    });

    it('should allow access to help page', () => {
      cy.visit('/en/help');
      cy.url().should('include', '/help');
    });

    it('should allow access to blog page', () => {
      cy.visit('/en/blog');
      cy.url().should('include', '/blog');
    });
  });

  describe('Session Management', () => {
    it('should check session endpoint', () => {
      cy.request({
        url: '/api/auth/session',
        failOnStatusCode: false
      }).then((response) => {
        // Should return 200 or 401
        expect([200, 401]).to.include(response.status);
        
        // If 200, should have user or null
        if (response.status === 200) {
          expect(response.body).to.have.property('authenticated');
        }
      });
    });
  });

  describe('Accessibility', () => {
    // it('should be keyboard navigable on login page', () => {
    //   cy.visit('/en/login');
      
    //   // Tab through form fields
    //   // Note: .tab() requires cypress-plugin-tab which is not currently installed
    //   // cy.get('body').tab();
    //   // cy.focused().should('have.attr', 'name', 'email');
      
    //   // cy.focused().tab();
    //   // cy.focused().should('have.attr', 'name', 'password');
      
    //   // cy.focused().tab();
    //   // cy.focused().should('have.attr', 'name', 'remember-me');
      
    //   // cy.focused().tab();
    //   // cy.focused().should('have.attr', 'type', 'submit');
    // });

    it('should have proper focus management on error', () => {
      cy.visit('/en/login');
      
      cy.get('input[name="email"]').type('invalid@test.com');
      cy.get('input[name="password"]').type('wrong');
      cy.get('button[type="submit"]').click();
      
      // Error message should be announced
      cy.get('[role="alert"]', { timeout: 10000 }).should('be.visible');
    });
  });
});
