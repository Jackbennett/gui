import { onlyOn } from '@cypress/skip-test';
/// <reference types="Cypress" />

context('Layout assertions', () => {
  beforeEach(() => {
    cy.login(Cypress.env('username'), Cypress.env('password'));
    cy.restoreLocalStorage();
    onlyOn('staging', () => {
      cy.tenantTokenRetrieval();
    });
    Cypress.Cookies.preserveOnce('JWT');
  });

  describe('device details', () => {
    it('has basic inventory', () => {
      cy.get('a').contains('Devices').click();
      cy.contains('.deviceListItem', 'release', { timeout: 10000 });
      cy.get('.deviceListItem').click().should('contain', 'release').end();
      cy.get('.expandedDevice')
        .should('contain', `${Cypress.config('demoDeviceName') || 'release-v1'}`)
        .and('contain', 'Linux')
        .and('contain', 'mac')
        .and('contain', 'qemux86-64');
    });

    it('can open a terminal', () => {
      cy.get('a').contains('Devices').click();
      cy.waitUntil(
        () =>
          cy
            .get('.deviceListItem')
            .click()
            // the deviceconnect connection might not be established right away,
            // due to polling intervals the fastest way to refresh is collapsing & expanding again...
            .click()
            .click()
            .then(() => Boolean(Cypress.$('.expandedDevice .device-connect button').length)),
        { timeout: 10000 }
      )
        .get('.expandedDevice')
        .contains('Launch a new Remote Terminal')
        .click()
        .end();
      cy.get('.MuiDialog-paper .terminal.xterm canvas').should('be.visible');
      // the terminal content might take a bit to get painted - thus the waiting
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.get('.MuiSnackbar-root').should('contain', 'Connection with the device established').wait(3000);
      cy.get('.MuiDialog-paper .terminal.xterm')
        // the terminal content differs a bit depending on the device id, thus the higher threshold allowed
        // NB! without the screenshot-name argument the options don't seem to be applied
        // NB! screenshots should only be taken by running the docker composition (as in CI) - never in open mode,
        // as the resizing option on `allowSizeMismatch` only pads the screenshot with transparent pixels until
        // the larger size is met (when diffing screenshots of multiple sizes) and does not scale to fit!
        .matchImageSnapshot('terminalContent', { failureThreshold: 0.05, failureThresholdType: 'percent' })
        .then(result => expect(result.pass).to.be.true);
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.get('.MuiDialog-paper .terminal.xterm textarea')
        .type('top{enter}', { force: true })
        .wait(5000)
        .get('.MuiDialog-paper .terminal.xterm')
        .matchImageSnapshot('terminalContent', { failureThreshold: 0.05, failureThresholdType: 'percent' })
        .then(result => expect(result.pass).to.be.false);
    });
  });
});
