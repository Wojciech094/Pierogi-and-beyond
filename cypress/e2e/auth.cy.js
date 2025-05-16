describe('Authentication', () => {
  describe('Login', () => {
    beforeEach(() => {
      cy.visit('/account/login.html');
    });

    it('should display login form', () => {
      cy.contains('Login').should('be.visible');
      cy.get('form').within(() => {
        cy.get('input[type="email"]').should('be.visible');
        cy.get('input[type="password"]').should('be.visible');
        cy.get('button[type="submit"]').contains('Login').should('be.visible');
      });
    });

    it('should validate required fields', () => {
      cy.get('form').submit();
      cy.contains('Email is required').should('be.visible');
      cy.contains('Password is required').should('be.visible');
    });

    it('should validate email format', () => {
      cy.get('input[type="email"]').type('invalid-email');
      cy.get('form').submit();
      cy.contains('Please enter a valid email').should('be.visible');
    });

    it('should login successfully with valid credentials', () => {
      cy.get('input[type="email"]').type('test@example.com');
      cy.get('input[type="password"]').type('password123');
      cy.get('form').submit();
      cy.url().should('eq', Cypress.config().baseUrl + '/');
      cy.get('.user-menu').should('be.visible');
    });

    it('should show error message with invalid credentials', () => {
      cy.get('input[type="email"]').type('test@example.com');
      cy.get('input[type="password"]').type('wrongpassword');
      cy.get('form').submit();
      cy.contains('Invalid email or password').should('be.visible');
    });
  });

  describe('Registration', () => {
    beforeEach(() => {
      cy.visit('/account/register.html');
    });

    it('should display registration form', () => {
      cy.contains('Register').should('be.visible');
      cy.get('form').within(() => {
        cy.get('input[name="name"]').should('be.visible');
        cy.get('input[type="email"]').should('be.visible');
        cy.get('input[type="password"]').should('be.visible');
        cy.get('input[name="confirmPassword"]').should('be.visible');
        cy.get('button[type="submit"]').contains('Register').should('be.visible');
      });
    });

    it('should validate required fields', () => {
      cy.get('form').submit();
      cy.contains('Name is required').should('be.visible');
      cy.contains('Email is required').should('be.visible');
      cy.contains('Password is required').should('be.visible');
    });

    it('should validate password match', () => {
      cy.get('input[name="name"]').type('Test User');
      cy.get('input[type="email"]').type('test@example.com');
      cy.get('input[type="password"]').type('password123');
      cy.get('input[name="confirmPassword"]').type('password124');
      cy.get('form').submit();
      cy.contains('Passwords do not match').should('be.visible');
    });

    it('should register successfully with valid data', () => {
      const testUser = {
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: 'password123'
      };

      cy.get('input[name="name"]').type(testUser.name);
      cy.get('input[type="email"]').type(testUser.email);
      cy.get('input[type="password"]').type(testUser.password);
      cy.get('input[name="confirmPassword"]').type(testUser.password);
      cy.get('form').submit();

      // Should redirect to login page
      cy.url().should('include', '/account/login.html');
      cy.contains('Registration successful').should('be.visible');
    });

    it('should show error for existing email', () => {
      cy.get('input[name="name"]').type('Test User');
      cy.get('input[type="email"]').type('existing@example.com');
      cy.get('input[type="password"]').type('password123');
      cy.get('input[name="confirmPassword"]').type('password123');
      cy.get('form').submit();
      cy.contains('Email already registered').should('be.visible');
    });
  });

  describe('Logout', () => {
    beforeEach(() => {
      cy.login('test@example.com', 'password123');
    });

    it('should logout successfully', () => {
      cy.get('.user-menu').click();
      cy.contains('Logout').click();
      cy.url().should('include', '/account/login.html');
      cy.get('.user-menu').should('not.exist');
    });
  });
});
