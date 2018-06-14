/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

 /** VERIFY: Model Page Title */
function verifyPageTitle(modelName) {
        // Verify: Ensure app page displays new application title
        cy.get('[data-testid="app-index-title"]')
        .should(el => {
          expect(el).to.contain(modelName)
        })
}

/** Navigate back to the Converation Learner Home page */
function navigateToHomepage() {
  cy.server()
  cy.route('GET', '/apps?**').as('getHomePage')
  cy.visit('http://localhost:5050')
  cy.wait('@getHomePage')
}

/** Navigate to the Entities page */
function navigateToEntities() {

    cy.get('a[href$="/entities"]').click().wait(1000)
}

/** Navigate to Actions Page */
function navigateToActions() {
  cy.get('a[href$="/actions"]')
    .click();
}

/** Navitage to Train Dialogs Page */
function navigateToTrainDialogs() {
  cy.get('a[href$="/trainDialogs"]')
    .click()
}

export {verifyPageTitle, navigateToHomepage, navigateToEntities, navigateToActions, navigateToTrainDialogs}