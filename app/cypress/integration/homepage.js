export function healthcheckMock() {
  cy.route({
    method: 'GET',
    url: '**/api/rest/v1/healthcheck',
    response: JSON.stringify({
      database: {
        sql_mode: 'database sql mode',
        time_zone: 'database time zone',
        character_set_results: 'database character set results',
        character_set_connection: 'database character set connection',
        collation_connection: 'database collation connection',
        character_set_client: 'database character set client',
      },
      filesystem: 42,
      redis: {
        version: 'redis version',
      },
    }),
    status: 200,
    delay: 100,
  }).as('healthcheck');
}

describe('Homepage', () => {
  beforeEach(() => {
    sessionStorage.clear();
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.server();

    healthcheckMock();
  });

  it('should visit the homepage', () => {
    cy.visit('/parteng/backoffice');
  });

  it('should display 7 blocks', () => {
    cy.visit('/parteng/backoffice');
    cy.get('parteng-homepage-block').should('have.length', 7);
  });
});
