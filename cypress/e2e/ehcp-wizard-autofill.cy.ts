describe('EHCP Wizard - Auto-fill Features (Section F)', () => {
  const SENCO_EMAIL = 'sen_coordinator@demo.com';

  beforeEach(() => {
    // Login as SENCO
    cy.visit('/en/login');
    cy.login(SENCO_EMAIL);
    
    // Ensure login is successful before proceeding
    cy.visit('/en/dashboard');
    cy.url().should('include', '/dashboard');
  });

  it('should allow a SENCO to navigate to Section F and auto-fill provision data', () => {
    // 1. Visit Wizard
    cy.visit('/en/ehcp/new');
    
    // Step 0: Basic Information
    cy.contains('Basic Information').should('be.visible');
    // Using placeholder locators as seen in code
    cy.get('input[placeholder="Enter student ID"]').type('12345');
    cy.get('input[placeholder="Enter institution ID"]').clear().type('1');
    cy.contains('button', 'Next →').click();

    // Step 1: Section A
    cy.contains("Section A: Views & Aspirations").should('be.visible');
    cy.get('textarea[placeholder*="child\'s views"]').type('The child wants to play football.', { force: true });
    cy.get('textarea[placeholder*="parents\' views"]').type('Parents are concerned about reading.', { force: true });
    cy.get('textarea[placeholder*="aspirations"]').type('To become a baker.', { force: true });
    cy.contains('button', 'Next →').click();

    // Step 2: Section B
    cy.contains('Section B: SEN').should('be.visible');
    // Select Primary Need via ID
    cy.get('#primary-need-select').select('Communication and Interaction');
    
    // Let's check logic briefly.
    // If exact value unknown, I can just type in textareas:
    cy.get('textarea[placeholder*="Describe the child\'s special educational needs"]').type('Needs support with phonics.');
    cy.contains('button', 'Next →').click();

    // Step 3: Section E
    cy.contains('Section E: Outcomes').should('be.visible');
    // Just click Next (outcomes optional? code showed "No outcomes added yet" message is fine)
    cy.contains('button', 'Next →').click();

    // Step 4: Section F (The Target)
    cy.contains('Section F: Provision').should('be.visible');

    // 2. Verify Video Tutorial
    // Check for "How to Collate Provision Evidence" title
    cy.contains('h3', 'How to Collate Provision Evidence').should('be.visible');
    cy.contains('p', 'Learn how to automatically pull intervention data').should('be.visible');

    // 3. Verify Auto-fill Button
    const autoFillBtn = cy.contains('button', 'Auto-fill from Records');
    autoFillBtn.should('be.visible');
    autoFillBtn.should('contain.text', '✨');

    // 4. Perform Auto-fill
    autoFillBtn.click();

    // 5. Verify Data Population
    // Should have 2 provisions now
    cy.contains('h4', 'Provision 1').should('be.visible');
    cy.contains('h4', 'Provision 2').should('be.visible');

    // Check specific values for Provision 1
    cy.get('#provision-0-need').should('have.value', 'Social Communication');
    cy.get('#provision-0-provider').should('have.value', 'Lego Therapy');
    cy.get('#provision-0-details').should('contain.value', 'Structured building sessions');

    // Check specific values for Provision 2
    cy.get('#provision-1-need').should('have.value', 'Cognition and Learning');
    cy.get('#provision-1-provider').should('have.value', 'Precision Teaching');
    cy.get('#provision-1-details').should('contain.value', 'Numeracy Support');
  });
});
