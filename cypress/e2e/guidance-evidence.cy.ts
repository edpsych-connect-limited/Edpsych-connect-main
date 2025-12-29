describe('Zero-touch guidance evidence (ContextualHelp)', () => {
  const assertContextualHelpVideo = (expectedVideoKey: string | string[]) => {
    const allowedKeys = Array.isArray(expectedVideoKey) ? expectedVideoKey : [expectedVideoKey];

    cy.get('[data-testid="contextual-help-trigger"]').should('be.visible').click({ force: true });

    cy.get('[data-testid="contextual-help-sheet"]').should('be.visible');

    cy.get('[data-testid="contextual-help-video"]')
      .find('[data-testid="video-tutorial-player"]')
      .should(($player) => {
        const actual = $player.attr('data-video-key');
        expect(actual, 'contextual help video key').to.be.oneOf(allowedKeys);
      })
      .then(($player) => {
        const actual = $player.attr('data-video-key') || 'missing-video-key';
        cy.screenshot(`contextual-help-${actual}`, { capture: 'viewport' });
      });
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
      // Accept the historical alias `no-child-left-behind` as well.
      { path: `${localePrefix}/demo/golden-thread`, expectedVideoKey: 'innovation-safety-net' },
    ];

    for (const r of routes) {
      cy.visit(r.path, { failOnStatusCode: false });
      if (r.path.endsWith('/demo/golden-thread')) {
        assertContextualHelpVideo(['innovation-safety-net', 'no-child-left-behind']);
      } else {
        assertContextualHelpVideo(r.expectedVideoKey);
      }
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
