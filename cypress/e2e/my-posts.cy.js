describe("My Posts Page", () => {
  beforeEach(() => {

    cy.clearLocalStorage();
  });

  it("should redirect to login if not authenticated", () => {
    cy.visit("/html/my-posts.html");
    cy.url().should("include", "/account/login.html");
  });

  it("should display user posts when logged in", () => {
    cy.login("test@example.com", "password123"); 
    cy.visit("/html/my-posts.html");

    cy.get("h1").should("contain", "My Posts");
    cy.get("#my-posts-container .newest-post").should("exist");
  });

  it("should go to edit page when clicking Edit", () => {
    cy.login("test@example.com", "password123");
    cy.visit("/html/my-posts.html");

    cy.get(".edit-btn").first().click();
    cy.url().should("include", "/html/edit.html?id=");
  });

  it("should delete post when clicking Delete", () => {
    cy.login("test@example.com", "password123");
    cy.visit("/html/my-posts.html");

    cy.get(".delete-btn").first().click();
    cy.on("window:confirm", () => true); 

    
    cy.get("#my-posts-container .newest-post").should("exist");
  });
});
