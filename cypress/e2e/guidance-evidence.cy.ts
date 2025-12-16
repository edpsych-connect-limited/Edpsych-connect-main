describe('Zero-touch guidance evidence (ContextualHelp)', () => {
  const assertContextualHelpVideo = (expectedVideoKey: string) => {
    cy.get('[data-testid="contextual-help-trigger"]').should('be.visible').click({ force: true });

    cy.get('[data-testid="contextual-help-sheet"]').should('be.visible');

    cy.get('[data-testid="contextual-help-video"]')
      .find('[data-testid="video-tutorial-player"]')
      .should('have.attr', 'data-video-key', expectedVideoKey);

    cy.screenshot(`contextual-help-${expectedVideoKey}`, { capture: 'viewport' });
  };

  it('should show relevant guidance on public demo/help routes', () => {
    cy.viewport(1280, 720);

    // NOTE: This project uses locale-prefixed routes under `src/app/[locale]`.
    // Cypress should always visit concrete locale paths to avoid accidental 404s
    // if locale-less rewrites aren't available in a given environment.
    const localePrefix = '/en';

    const routes: Array<{ path: string; expectedVideoKey: string }> = [
      { path: `${localePrefix}/help`, expectedVideoKey: 'help-getting-started' },
      { path: `${localePrefix}/demo/coding`, expectedVideoKey: 'intro-coding-journey' },
      { path: `${localePrefix}/research`, expectedVideoKey: 'innovation-research-hub' },
      // Safety Net is demonstrated via the Golden Thread demo surface.
      { path: `${localePrefix}/demo/golden-thread`, expectedVideoKey: 'innovation-safety-net' },
    ];

    for (const r of routes) {
      cy.visit(r.path, { failOnStatusCode: false });
      assertContextualHelpVideo(r.expectedVideoKey);
    }
  });

  it('should show relevant guidance on authenticated portals', () => {
    cy.viewport(1280, 720);

    // LA dashboard
    cy.login('la_admin@demo.com');
    cy.visit('/en/la/dashboard');
    assertContextualHelpVideo('la-dashboard-overview');

    // Parent portal entry
    cy.login('parent@demo.com');
    cy.visit('/en/parents');
    assertContextualHelpVideo('parent-portal-welcome');

    // EHCP hub
    cy.login('ep@demo.com');
    cy.visit('/en/ehcp', { failOnStatusCode: false });
    assertContextualHelpVideo('ehcp-application-journey');
  });
});
