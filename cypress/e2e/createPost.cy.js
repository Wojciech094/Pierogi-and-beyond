describe('Create Blog Post', () => {
  beforeEach(() => {
    // Login before each test
    cy.login('test@example.com', 'password123');
  });

  it('should require authentication to access create post page', () => {
    // First logout
    cy.clearLocalStorage();
    cy.visit('/post/create.html');
    cy.url().should('include', '/account/login.html');
  });

  it('should display create post form when authenticated', () => {
    cy.visit('/post/create.html');
    cy.contains('Create New Post').should('be.visible');
    cy.get('form').within(() => {
      cy.get('input[name="title"]').should('be.visible');
      cy.get('textarea[name="content"]').should('be.visible');
      cy.get('input[type="file"]').should('be.visible');
    });
  });

  it('should validate required fields', () => {
    cy.visit('/post/create.html');
    cy.get('form').submit();
    cy.contains('Title is required').should('be.visible');
    cy.contains('Content is required').should('be.visible');
  });

  it('should create a new blog post', () => {
    const testPost = {
      title: 'Test Post Title',
      content: 'This is a test post content',
      imageUrl: 'https://example.com/test-image.jpg'
    };

    cy.visit('/post/create.html');
    cy.get('input[name="title"]').type(testPost.title);
    cy.get('textarea[name="content"]').type(testPost.content);
    cy.get('input[name="imageUrl"]').type(testPost.imageUrl);
    cy.get('form').submit();

    // Should redirect to the new post
    cy.url().should('include', '/post/index.html');
    cy.contains(testPost.title).should('be.visible');
  });

  it('should handle image upload', () => {
    cy.visit('/post/create.html');
    cy.get('input[type="file"]').attachFile('test-image.jpg');
    cy.get('.image-preview').should('be.visible');
  });

  it('should show error message on failed submission', () => {
    cy.intercept('POST', '/api/posts', {
      statusCode: 500,
      body: { error: 'Server error' }
    });

    cy.visit('/post/create.html');
    cy.get('input[name="title"]').type('Test Title');
    cy.get('textarea[name="content"]').type('Test Content');
    cy.get('form').submit();
    cy.contains('Error creating post').should('be.visible');
  });
});
