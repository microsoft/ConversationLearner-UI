/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
export function navigateTo() {
  cy.server()
  cy.route('GET', '/sdk/apps?**').as('getApps')
  cy.route('GET', '/sdk/bot?**').as('getBot')

  // Open application
  cy.visit('http://localhost:5050')
  cy.wait(['@getApps', '@getBot'])
  cy.wait(1000)
}

/** Creates a New Model */
export function createNewModel(modelName) {
  cy.server()
  cy.route('POST', '/sdk/app?userId=**').as('postCreateNew')
  cy.route('GET', '/sdk/app/*/source**').as('getAppSource')
  cy.route('GET', '/sdk/app/*/logdialogs**').as('getAppLogDialogs')

  // Click the button to create app
  cy.get('[data-testid="apps-list-button-create-new"]')
    .should('be.visible')
    .click()

  // Wait for modal to render
  cy.wait(1000)

  cy.get('[data-testid="app-create-input-name"]')
    .type(modelName)

  cy.get('[data-testid="app-create-button-submit"]')
    .click()

  cy.wait('@postCreateNew')
  cy.wait(['@getAppLogDialogs', '@getAppSource'])
}

/** Delete an existent Model */
export function deleteModel(modelName) {
  cy.contains(modelName)
    .parents('.ms-DetailsRow-fields')
    .find('i[data-icon-name="Delete"]')
    .click()

  cy.get('.ms-Dialog-main')
    .contains('Confirm')
    .click()
}
