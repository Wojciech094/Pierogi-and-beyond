describe("Comments functionality", () => {
  const testComment = {
    name: "Test User",
    content: "This is a test comment.",
  };

  beforeEach(() => {
    cy.visit("/post/index.html?id=1"); 
  });

  it("should display the comment form", () => {
    cy.get("#comment-form").should("be.visible");
    cy.get("#comment-name").should("be.visible");
    cy.get("#comment-content").should("be.visible");
    cy.get("#comment-form button[type='submit']").should("be.visible");
  });

  it("should add a new comment", () => {
    cy.get("#comment-name").type(testComment.name);
    cy.get("#comment-content").type(testComment.content);
    cy.get("#comment-form").submit();

    cy.get("#comments-list .comment").should("contain", testComment.name);
    cy.get("#comments-list .comment").should("contain", testComment.content);
  });

  it("should delete the comment", () => {
    // Dodaj komentarz
    cy.get("#comment-name").type(testComment.name);
    cy.get("#comment-content").type(testComment.content);
    cy.get("#comment-form").submit();

    
    cy.get(".delete-comment").last().click();
    cy.on("window:confirm", () => true);

    
    cy.get("#comments-list .comment").should(
      "not.contain",
      testComment.content
    );
  });
});
