describe('Student Lesson Player', () => {
  beforeEach(() => {
    // Mock authentication
    cy.setCookie('next-auth.session-token', 'mock-token');
  });

  it('should navigate to the student dashboard', () => {
    cy.visit('/en/student');
    cy.contains('Student Portal');
    cy.contains('My Lessons');
  });

  it('should list lessons', () => {
    // Mock API response
    cy.intercept('GET', '/api/coding/curriculum?type=curricula', {
      statusCode: 200,
      body: [
        {
          id: 'curr-1',
          title: 'Python Basics',
          description: 'Learn Python',
          level: 'beginner',
          lessons: [
            {
              id: 'lesson-1',
              title: 'Hello World',
              description: 'First program',
              lesson_order: 1,
              estimated_minutes: 15,
              cognitive_load: 2,
              has_audio_version: true,
              has_visual_guide: false,
              has_simplified_version: true
            }
          ]
        }
      ]
    }).as('getCurricula');

    cy.visit('/en/student/lessons');
    cy.wait('@getCurricula');
    cy.contains('Python Basics');
    cy.contains('Hello World');
  });

  it('should load the lesson player', () => {
    // Mock API response
    cy.intercept('GET', '/api/coding/curriculum*', {
      statusCode: 200,
      body: {
        id: 'lesson-1',
        title: 'Hello World',
        description: 'Write your first program',
        instructions: {
          original: '# Instructions\n\nPrint "Hello World"',
          simplified: '# Simple Instructions\n\nJust print it.'
        },
        starter_code: 'print("Hello")',
        solution_code: 'print("Hello World")',
        has_audio_version: true,
        has_visual_guide: false,
        has_simplified_version: true,
        hints: ['Use the print function']
      }
    }).as('getLesson');

    cy.visit('/en/student/lessons/lesson-1');
    cy.wait('@getLesson');
    cy.contains('Hello World');
    cy.contains('Run Programme'); // Check UK spelling
    cy.contains('Console Output');
  });
});
