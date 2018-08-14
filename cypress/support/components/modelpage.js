/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
export function verifyPageTitle(modelName) {
  cy.get('[data-testid="app-index-title"]')
    .should(el => {
      expect(el).to.contain(modelName)
    })
}

/** Navigate back to the Converation Learner Home page */
export function navigateToHomepage() {
  cy.server()
  cy.route('GET', '/sdk/apps?**').as('getHomePage')
  cy.visit('http://localhost:5050')
  cy.wait('@getHomePage')
}

/** Navigate to the Entities page */
export function navigateToEntities() {
  cy.get('[data-testid="app-index-nav-link-entities"]')
    .click()
    .wait(1000)
}

/** Navigate to Actions Page */
export function navigateToActions() {
  cy.get('[data-testid="app-index-nav-link-actions"]')
    .click()
    .wait(1000)
}

/** Navitage to Train Dialogs Page */
export function navigateToTrainDialogs() {
  cy.get('[data-testid="app-index-nav-link-train-dialogs"]')
    .click()
}

/** Navigate to Log Dialogs Page */
export function navigateToLogDialogs() {
  cy.get('[data-testid="app-index-nav-link-log-dialogs"]')
    .click()
}