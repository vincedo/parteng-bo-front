// @ts-check

import { allResources } from '../support/commands';

function canChoose(resource: string) {
  it(`can choose referentiel \'${resource}\'`, () => {
    cy.getByTestId(`parteng-${resource}-block`).within(() => {
      cy.get('button').should('be.enabled').click();
      cy.url().should('contains', resource);
    });
  });
}
function canNotChoose(resource: string) {
  it(`can not choose referentiel \'${resource}\'`, () => {
    cy.getByTestId(`parteng-${resource}-block`).within(() => {
      cy.get('button').should('be.disabled');
    });
  });
}

describe('backoffice home page Permissioning', () => {
  before(() => {
    cy.clearLocalStorage();
    cy.visit('/');
  });
  it('should see 8 blocks', () => {
    cy.get('parteng-homepage-block').should('have.length', 8);
  });

  allResources.forEach((route) => {
    const titleForTest = `can not directly go to ${route}`; // Construct an informative title
    it(titleForTest, () => {
      cy.visit(`/parteng/${route}/list`);

      // cy.url().then(url => {
      //   expect(url).contains(route+'/list')
      //   console.log('route is ', url)
      // });
      cy.findByTestId('parteng-breadcrumb').should('not.exist');
    });
  });

  allResources.forEach((resource) => {
    describe(`connected as a no-${resource} user`, () => {
      before(() => {
        cy.clearLocalStorage();
        cy.visit('/');
        cy.getByTestId('parteng-user-selector').click();
        cy.getByTestId('parteng-user-selector').get('mat-option').contains(resource).click();
      });

      beforeEach(() => {
        cy.getByAltText('Logo Parteng').click().click();
      });

      canNotChoose(resource);
      allResources.filter((r) => r !== resource).forEach((r) => canChoose(r));
    });
  });
});
