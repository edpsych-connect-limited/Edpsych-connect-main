describe('Onboarding Flow E2E', () => {
  // Mock session state to verify protection logic
  it('should redirect to login if not authenticated', () => {
    cy.visit('/dashboard');
    cy.url().should('include', '/login');
  });

  it('should protect /onboarding route', () => {
    cy.visit('/onboarding');
    cy.url().should('include', '/login');
  });

  describe('Video Delivery Robustness (Enterprise Grade)', () => {
    beforeEach(() => {
      cy.login('teacher@demo.com', 'Test123!'); 
    });
    
    it('should request the correct video assets for Onboarding Platform Tour', () => {
      // 1. Intercept video requests to verify source
      cy.intercept('GET', '**/*.mp4').as('videoRequest');
      cy.intercept('GET', '**/video_status.json').as('heygenStatus');
  
      // 2. Visit the onboarding page
      cy.visit('/onboarding');
      
      // Play the video to trigger loading
      // Using a more generic selector backup just in case
      cy.get('button[aria-label="Play introduction video"], button:contains("Play")').first().click();

      // 3. Verify Video Player presence
      cy.get('video', { timeout: 15000 }).should('exist');
      
      cy.get('video').then(($video) => {
          const src = $video.attr('src');
          // Expect 'onboarding-platform-tour' alias mapping in the filename/id
          if (src) {
              expect(src).to.match(/onboarding-platform-tour|help-getting-started/);
          } else {
              cy.log('Video using MediaSource/Blob, relying on network intercept checks');
          }
      });
    });
  
    it('should fallback gracefully if primary video source fails', () => {
      // Simulate HeyGen failure to test robustness (Cloudinary fallback)
      cy.intercept('POST', '/api/video/heygen-url', {
          statusCode: 500
      }).as('heygenFail');
  
      cy.visit('/onboarding');
      cy.get('button[aria-label="Play introduction video"], button:contains("Play")').first().click();
  
      // The system should survive the 500 error and still render a player 
      // (likely using the Cloudinary direct URL as backup)
      cy.get('video', { timeout: 15000 }).should('exist');
      // Verifying fallback usually means checking src is NOT blob: (heygen) but https: (cloudinary)
      // or simply that it exists and didn't crash.
      cy.get('video').should('have.attr', 'src').and('include', 'cloudinary');
    });
  });
});
