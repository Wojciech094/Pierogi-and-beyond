describe('Edit Blog Post', () => {
  beforeEach(() => {
    cy.login('test@example.com', 'password123');
    // Create a test post and store its ID
    cy.createBlogPost('Test Post', 'Test Content', 'https://example.com/image.jpg');
  });

  it('should require authentication to access edit page', () => {
    cy.clearLocalStorage();
    cy.visit('/post/edit.html?id=1');
    cy.url().should('include', '/account/login.html');
  });

  it('should load existing post data in edit form', () => {
    cy.visit('/post/edit.html?id=1');
    cy.get('input[name="title"]').should('have.value', 'Test Post');
    cy.get('textarea[name="content"]').should('have.value', 'Test Content');
    cy.get('.current-image').should('be.visible');
  });

  it('should update post successfully', () => {
    const updates = {
      title: 'Updated Test Post',
      content: 'Updated test content'
    };

    cy.visit('/post/edit.html?id=1');
    cy.get('input[name="title"]').clear().type(updates.title);
    cy.get('textarea[name="content"]').clear().type(updates.content);
    cy.get('form').submit();

    // Should redirect to updated post
    cy.url().should('include', '/post/index.html');
    cy.contains(updates.title).should('be.visible');
    cy.contains(updates.content).should('be.visible');
  });

  it('should delete post successfully', () => {
    cy.visit('/post/edit.html?id=1');
    cy.contains('Delete Post').click();
    cy.get('.confirm-delete-dialog').within(() => {
      cy.contains('Yes, delete').click();
    });
    
    // Should redirect to blog feed
    cy.url().should('eq', Cypress.config().baseUrl + '/');
    cy.contains('Post deleted successfully').should('be.visible');
  });

  it('should validate required fields on update', () => {
    cy.visit('/post/edit.html?id=1');
    cy.get('input[name="title"]').clear();
    cy.get('textarea[name="content"]').clear();
    cy.get('form').submit();
    cy.contains('Title is required').should('be.visible');
    cy.contains('Content is required').should('be.visible');
  });

  it('should handle non-existent post IDs', () => {
    cy.visit('/post/edit.html?id=999999');
    cy.contains('Post not found').should('be.visible');
  });

  it('should confirm before deleting', () => {
    cy.visit('/post/edit.html?id=1');
    cy.contains('Delete Post').click();
    cy.get('.confirm-delete-dialog').should('be.visible');
    cy.contains('Cancel').click();
    cy.url().should('include', '/post/edit.html');
  });
});
