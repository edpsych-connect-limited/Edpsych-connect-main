describe('Extended Features: Training, Marketplace, Forum, Blog', () => {
  
  // --- Training Centre Tests ---
  describe('Training Centre', () => {
    const mockCourses = {
      courses: [
        {
          id: 'c1',
          title: 'Autism Awareness',
          description: 'Understanding ASD in the classroom',
          category: 'Special Educational Needs',
          duration: '2 hours',
          level: 'Beginner',
          enrolled: false,
          imageUrl: '/images/course1.jpg',
          instructor: 'Dr. Smith',
          rating: 4.8,
          students: 120
        },
        {
          id: 'c2',
          title: 'Advanced CBT',
          description: 'Cognitive Behavioural Therapy techniques',
          category: 'Behavioural Intervention',
          duration: '5 hours',
          level: 'Advanced',
          enrolled: true,
          progress: 45,
          imageUrl: '/images/course2.jpg',
          instructor: 'Prof. Jones',
          rating: 4.9,
          students: 85
        }
      ]
    };

    beforeEach(() => {
      cy.intercept('GET', '/api/training/courses', {
        statusCode: 200,
        body: mockCourses
      }).as('getCourses');
    });

    it('should load the training catalogue and display courses', () => {
      cy.visit('/en/training');
      cy.wait('@getCourses');
      
      // Verify Header
      cy.contains('Training Centre', { matchCase: false }).should('exist');
      
      // Verify Course Cards
      cy.contains('Autism Awareness').should('be.visible');
      cy.contains('Advanced CBT').should('be.visible');
      cy.contains('Dr. Smith').should('be.visible');
    });

    it('should filter courses by category', () => {
      cy.visit('/en/training');
      cy.wait('@getCourses');

      // Select a category filter
      cy.get('select[aria-label="Filter by category"]').select('Special Educational Needs', { force: true });

      // Verify filtering logic (client-side)
      cy.contains('Autism Awareness').should('be.visible');
      cy.contains('Advanced CBT').should('not.exist');
    });

    it('should search for courses', () => {
      cy.visit('/en/training');
      cy.wait('@getCourses');

      // Type in search box
      cy.get('input[placeholder="Search courses..."]').type('CBT', { force: true });

      // Verify search results
      cy.contains('Advanced CBT').should('be.visible');
      cy.contains('Autism Awareness').should('not.exist');
    });
  });

  // --- Marketplace Tests ---
  describe('Marketplace', () => {
    const mockProfessionals = {
      results: [
        {
          id: 1,
          userId: 101,
          name: 'Dr. Sarah Connor',
          avatar: null,
          title: 'Senior Educational Psychologist',
          bio: 'Expert in trauma and resilience.',
          location: 'London',
          specialisms: ['Trauma', 'ASD'],
          dailyRate: 500,
          rating: 5.0,
          reviewCount: 12,
          isLaPanel: true,
          nextAvailable: '2025-01-15',
          yearsExperience: 15,
          verified: true
        }
      ]
    };

    beforeEach(() => {
      // Mock the search API
      cy.intercept('GET', '/api/marketplace/professionals/search*', {
        statusCode: 200,
        body: mockProfessionals
      }).as('searchProfessionals');
    });

    it('should load the marketplace and display professionals', () => {
      cy.visit('/en/marketplace');
      cy.wait('@searchProfessionals');

      cy.contains('Find an Educational Psychologist').should('be.visible');
      cy.contains('Dr. Sarah Connor').should('be.visible');
      cy.contains('London').should('be.visible');
    });

    it('should update filters and trigger new search', () => {
      cy.visit('/en/marketplace');
      cy.wait('@searchProfessionals');

      // Create a specific alias for the search we expect
      cy.intercept('GET', '/api/marketplace/professionals/search*q=Trauma*').as('searchTrauma');

      // Type in location filter
      cy.get('input[placeholder*="Search by name"]').clear({ force: true }).type('Trauma', { force: true });
      
      // Wait for the specific request
      cy.wait('@searchTrauma');
    });
  });

  // --- Forum Tests ---
  describe('Forum', () => {
    it('should display forum categories', () => {
      cy.visit('/en/forum');

      // Verify static categories from FORUM_CATEGORIES constant
      cy.contains('SEND Support Strategies').should('be.visible');
      cy.contains('Assessment & Evaluation').should('be.visible');
      cy.contains('Mental Health & Wellbeing').should('be.visible');
    });

    it('should have a search bar', () => {
      cy.visit('/en/forum');
      cy.get('input[placeholder*="Search topics"]').should('exist');
    });
  });

  // --- Blog Tests ---
  describe('Blog', () => {
    it('should load the blog page', () => {
      cy.visit('/en/blog');
      // Basic check as we don't have the full blog implementation details in context
      // but we know it exists
      cy.url().should('include', '/blog');
    });
  });

});
