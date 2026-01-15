describe('Voice Command Cockpit Integration', () => {
  // Passwords from seeds
  const LA_PASSWORD = 'Bucks2025!Pilot';
  const DEFAULT_PASSWORD = Cypress.env('SEED_TEST_USERS_PASSWORD') || 'Password123!';

  // Mock Speech API to ensure component renders
  beforeEach(() => {
    cy.window().then((win) => {
      if (!win.SpeechRecognition && !win.webkitSpeechRecognition) {
        // Simple mock to satisfy check in VoiceCommandInterface
        win.webkitSpeechRecognition = class MockSpeechRecognition {
            continuous = false;
            interimResults = false;
            lang = 'en-US';
            start() {}
            stop() {}
            abort() {}
        };
        win.SpeechRecognition = win.webkitSpeechRecognition;
      }
    });
  });

  const login = (email, password) => {
    cy.session([email, password], () => {
      cy.visit('/login');
      cy.get('input[name="email"]').type(email);
      cy.get('input[name="password"]').type(password);
      cy.get('button[type="submit"]').click();
      cy.url().should('not.include', '/login', { timeout: 15000 });
    });
  };

  it('Verifies Voice Command Interface on SENCO Dashboard', () => {
    login('sen_coordinator@demo.com', DEFAULT_PASSWORD);
    cy.visit('/senco');
    
    // Assert Dashboard Header
    cy.contains('SENCO Dashboard').should('be.visible');
    
    // Assert Voice Interface Presence
    // Note: aria-label might vary depending on recording state, forcing check for base elements
    cy.get('button[aria-label="Start voice recording"]').should('exist');
    cy.get('input[placeholder*="Ask anything"]').should('be.visible');
  });

  it('Verifies Voice Command Interface on EP Dashboard', () => {
    login('dr.patel@test.edpsych.com', DEFAULT_PASSWORD);
    cy.visit('/ep/dashboard');
    
    cy.contains('EP Dashboard').should('be.visible');
    cy.get('button[aria-label="Start voice recording"]').should('exist');
  });

  it('Verifies Voice Command Interface on LA Dashboard', () => {
    login('caroline.marriott@edpsychconnect.com', LA_PASSWORD);
    cy.visit('/la/dashboard');
    
    cy.contains('EHCP Management Dashboard').should('be.visible');
    cy.get('button[aria-label="Start voice recording"]').should('exist');
  });

  it('Verifies Voice Command Interface on Teacher Dashboard (Classroom Cockpit)', () => {
    login('teacher@demo.com', DEFAULT_PASSWORD);
    // Teacher dashboard typically at /teachers
    cy.visit('/teachers');
    
    // Assert Dashboard Presence (Classroom Cockpit)
    cy.contains('Classroom Cockpit').should('be.visible');
    
    // Assert Voice Interface Presence in Key Area
    cy.get('button[aria-label="Start voice recording"]').should('exist');
  });
});
