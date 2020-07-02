/// <reference types="Cypress" />

context('Login', () => {
  describe('works as expected', () => {
    beforeEach(() => {
      cy.clearCookies();
      cy.visit(Cypress.config().baseUrl);
    });

    it('Logs in using UI', () => {
      cy.visit(`${Cypress.config().baseUrl}ui`);
      // enter valid username and password
      cy.get('[id=email]').type(Cypress.env('username'));
      cy.get('[name=password]').clear().type(Cypress.env('password'));
      cy.contains('button', 'Log in').click().wait(300);

      // confirm we have logged in successfully
      cy.getCookie('JWT').should('have.property', 'value');

      // now we can log out
      cy.contains('.header-dropdown', Cypress.env('username')).click({ force: true });
      cy.contains('span', 'Log out').click({ force: true });
      cy.contains('Log in').should('be.visible');
    });

    it('does not stay logged in across sessions, after browser restart', () => {
      cy.contains('Log in').should('be.visible');
    });

    it('fails to access unknown resource', () => {
      cy.request({
        url: Cypress.config().baseUrl + '/users',
        failOnStatusCode: false
      })
        .its('status')
        .should('equal', 404);
    });

    it('Does not log in with invalid password', () => {
      cy.clearCookies();
      cy.contains('Log in').should('be.visible');
      cy.get('[id=email]').type(Cypress.env('username'));
      cy.get('[name=password]').type('lewrongpassword');
      cy.contains('button', 'Log in').click().wait(3000);

      // still on /login page plus an error is displayed
      cy.contains('Log in').should('be.visible');
      cy.contains('There was a problem logging in').should('be.visible');
    });
  });

  describe('stays logged in across sessions, after browser restart if selected', () => {
    beforeEach(() => {
      cy.visit(`${Cypress.config().baseUrl}ui/`);
      Cypress.Cookies.preserveOnce('JWT', 'noExpiry');
    });

    it('pt1', () => {
      cy.clearCookies();
      cy.get('[id=email]').type(Cypress.env('username'));
      cy.get('[name=password]').type(Cypress.env('password'));
      cy.get('[type=checkbox]').check();
      cy.contains('button', 'Log in').click().wait(3000);
    });

    it('pt2', () => {
      cy.contains('Log in')
        .should('not.be.visible')
        .then(() => cy.getCookie('JWT').should('have.property', 'value'));
    });
  });
});
