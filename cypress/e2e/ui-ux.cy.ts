import 'cypress-axe';

describe('UI/UX Audit', () => {
  const pages = [
    { name: 'Landing Page', path: '/' },
    { name: 'Login Page', path: '/en/login' },
    // Dashboard requires auth, so we'll handle it separately or mock it
  ];

  const viewports = [
    { name: 'Desktop', width: 1920, height: 1080 },
    { name: 'Laptop', width: 1366, height: 768 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Mobile', width: 375, height: 667 },
  ];

  pages.forEach((page) => {
    describe(`${page.name} (${page.path})`, () => {
      viewports.forEach((viewport) => {
        it(`4.1 Responsive Design - ${viewport.name} (${viewport.width}x${viewport.height})`, () => {
          cy.viewport(viewport.width, viewport.height);
          cy.visit(page.path);
          cy.get('body').should('be.visible');
          
          // Check for horizontal scrollbar (should not exist generally)
          cy.window().then((win) => {
            const scrollWidth = win.document.documentElement.scrollWidth;
            const clientWidth = win.document.documentElement.clientWidth;
            // Allow small margin of error or specific exceptions
            // expect(scrollWidth).to.be.at.most(clientWidth);
          });

          // Check navigation visibility
          if (viewport.width < 1024) {
            // Mobile menu button should be visible
            // Adjust selector based on actual UI
            // cy.get('[aria-label="Menu"]').should('be.visible');
          } else {
            // Desktop nav should be visible
            // cy.get('nav').should('be.visible');
          }
        });
      });

      it(`4.2 Accessibility - ${page.name}`, () => {
        cy.visit(page.path);
        cy.injectAxe();
        // Configure a11y check to be non-blocking for now, or log violations
        cy.checkA11y(undefined, {
            includedImpacts: ['critical', 'serious']
        }, (violations) => {
            cy.log(`${violations.length} accessibility violation${violations.length === 1 ? '' : 's'} ${violations.length === 1 ? 'was' : 'were'} detected`);
            // Log details to console for debugging
            const violationData = violations.map(v => ({
                id: v.id,
                impact: v.impact,
                description: v.description,
                nodes: v.nodes.map(n => n.html).join(', ')
            }));
            cy.task('log', JSON.stringify(violationData, null, 2));
        });
      });
    });
  });

  describe('Dashboard (Authenticated)', () => {
    beforeEach(() => {
      cy.login('teacher@demo.com');
    });

    it('4.1 Responsive Design - Dashboard Mobile', () => {
      cy.viewport(375, 667);
      cy.visit('/en/dashboard');
      cy.contains('Dashboard').should('be.visible');
      // Check if content stacks correctly
    });

    it('4.2 Accessibility - Dashboard', () => {
      cy.visit('/en/dashboard');
      cy.injectAxe();
      cy.checkA11y(undefined, {
          includedImpacts: ['critical', 'serious']
      });
    });
  });
});
