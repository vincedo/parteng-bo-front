describe('Dashboard', () => {
  beforeEach(() => {
    sessionStorage.clear();
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.server();
  });

  it('should visit go to the dashboard from the homepage', () => {
    cy.visit('/parteng/backoffice');
    cy.wait(1000);
    cy.visit('/parteng/backoffice');
    cy.wait(1000);
    cy.get('#dataEntry button').click();
    cy.wait(1000);
    cy.get('parteng-projects-list-table').dblclick();
  });

  it('should contains 5 pseudo folders', () => {
    cy.visit('http://localhost:4200/parteng/data-entry/projects/9/dashboard');
    cy.wait(1000);
    cy.get('.pseudo-folders .folder').should('have.length', 5);
  });
});
