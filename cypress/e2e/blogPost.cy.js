describe('Specific Blog Post Page', () => {
  beforeEach(() => {
    // Visit a specific blog post - we'll use a test post ID
    cy.visit('/post/index.html?id=1');
  });

  it('should display blog post details', () => {
    cy.contains('h1').should('be.visible'); // Post title
    cy.get('.post-author').should('be.visible');
    cy.get('.post-date').should('be.visible');
    cy.get('.post-banner-image').should('be.visible');
    cy.get('.post-content').should('be.visible');
  });

  it('should have a working share button', () => {
    cy.get('.share-button').should('be.visible').click();
    
    // Test if URL contains post ID
    cy.url().should('include', 'id=');
    
    // Test if share dialog appears
    cy.get('.share-dialog').should('be.visible');
    cy.get('.share-url').should('have.value', Cypress.config().baseUrl + '/post/index.html?id=1');
  });

  it('should display related posts section', () => {
    cy.get('.related-posts')
      .should('be.visible')
      .within(() => {
        cy.get('.post-card').should('have.length.at.least', 3);
      });
  });

  it('should handle non-existent post IDs gracefully', () => {
    cy.visit('/post/index.html?id=999999');
    cy.contains('Post not found').should('be.visible');
  });
});
