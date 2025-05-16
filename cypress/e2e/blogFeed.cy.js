describe('Blog Feed Page', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Carousel', () => {
    it('should display carousel with 3 latest posts', () => {
      cy.contains('Latest Posts').should('be.visible');
      cy.get('.carousel-item').should('have.length', 3);
    });

    it('should navigate through carousel using next button', () => {
      const firstPostTitle = cy.contains('.carousel-item.active h2').invoke('text');
      cy.contains('Next').click();
      cy.get('.carousel-item.active h2').should('not.have.text', firstPostTitle);
    });

    it('should navigate through carousel using previous button', () => {
      cy.contains('Next').click();
      const secondPostTitle = cy.contains('.carousel-item.active h2').invoke('text');
      cy.contains('Previous').click();
      cy.get('.carousel-item.active h2').should('not.have.text', secondPostTitle);
    });

    it('should return to first post after reaching the end', () => {
      const firstPostTitle = cy.contains('.carousel-item.active h2').invoke('text');
      cy.contains('Next').click().click().click();
      cy.get('.carousel-item.active h2').should('have.text', firstPostTitle);
    });

    it('should have clickable read more buttons', () => {
      cy.get('.carousel-item.active')
        .find('a')
        .contains('Read more')
        .click();
      cy.url().should('include', '/post/index.html');
    });
  });

  describe('Blog Post Grid', () => {
    it('should display at least 12 blog posts', () => {
      cy.get('.blog-grid .post-card').should('have.length.at.least', 12);
    });

    it('should have clickable post thumbnails', () => {
      cy.get('.blog-grid .post-card')
        .first()
        .click();
      cy.url().should('include', '/post/index.html');
    });

    it('should display post information in grid items', () => {
      cy.get('.blog-grid .post-card').first().within(() => {
        cy.get('img').should('be.visible');
        cy.get('h3').should('be.visible');
        cy.get('.post-date').should('be.visible');
        cy.get('.post-author').should('be.visible');
      });
    });

    it('should have responsive grid layout', () => {
      cy.viewport('iphone-6');
      cy.get('.blog-grid').should('have.css', 'grid-template-columns');
      cy.viewport('macbook-15');
      cy.get('.blog-grid').should('have.css', 'grid-template-columns');
    });
  });
});
