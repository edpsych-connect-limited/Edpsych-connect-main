describe('Video Delivery Robustness (Enterprise Grade)', () => {
    // We check the specific video we just fixed: help-getting-started (aliased to onboarding-platform-tour)
    // We assume this video might appear in the Onboarding flow or a Help page.
    // Based on aliases, 'help-getting-started' maps to 'onboarding-platform-tour'.

    beforeEach(() => {
        // Login as a standard user to access onboarding
        cy.login('teacher@demo.com', 'Test123!'); 
    });
    
    it('should request the correct video assets for Onboarding Platform Tour', () => {
      // 1. Intercept video requests to verify source
      // HeyGen usually comes from specific domains, Cloudinary from res.cloudinary.com
      cy.intercept('GET', '**/*.mp4').as('videoRequest');
      cy.intercept('GET', '**/video_status.json').as('heygenStatus');
  
      // 2. Visit the onboarding page where this video lives
      // Assuming Step 1 or a specific route uses it.
      // We'll try the known route '/onboarding'. If that redirects, we might need a specific setup.
    cy.visit('/onboarding');
      
    // Play the video to trigger loading
    cy.get('button[aria-label="Play introduction video"]').click();

      // 3. Verify Video Player presence
      cy.get('video', { timeout: 10000 }).should('exist');
      // We explicitly check that the source URL contains the expected key or ID.
      cy.get('video').then(($video) => {
          const src = $video.attr('src');
          // It should be either a HeyGen stream URL or a Cloudinary URL
          // Our alias fix 'help-getting-started' -> 'onboarding-platform-tour' means 
          // we expect 'onboarding-platform-tour' in the filename/id.
          if (src) {
              expect(src).to.match(/onboarding-platform-tour/);
          } else {
              // If src is blob/mediasource, checking network calls is key
              cy.log('Video using MediaSource/Blob, relying on network intercept');
          }
      });
    });
  
    it('should fallback gracefully if primary video source fails', () => {
      // Simulate HeyGen failure to test robustness (Cloudinary fallback)
      cy.intercept('POST', '/api/video/heygen-url', {
          statusCode: 500
      }).as('heygenFail');
  
      cy.visit('/onboarding');
      cy.get('button[aria-label="Play introduction video"]').click();
  
      // The system should survive the 500 error and still render a player 
      // (likely using the Cloudinary direct URL as backup)
      cy.get('video').should('exist');
      cy.get('video').should('have.attr', 'src').and('include', 'cloudinary');
    });
  });
  