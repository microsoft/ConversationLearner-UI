/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

function NavigateTo() {
  cy.server()
  cy.route('GET', '/apps?**').as('getHomePage')

  // Open application
  cy.visit('http://localhost:5050')
  cy.wait('@getHomePage')
}

/** Creates a New Model */
function CreateNewModel(modelName) {
  cy.on('uncaught:exception', (err, runnable) => {
    return false
  })
  cy.server()
  cy.route('POST', '/app?userId=**').as('postCreateNew')

  // Click the button to create app
  cy.get('[data-testid="apps-list-button-create-new"]')
    .click()

  // Ensure that name input is focused
  cy.focused()

  cy.get('[data-testid="app-create-input-name"]')
    .type(modelName)

  cy.get('[data-testid="app-create-button-submit"]')
    .click()

  cy.wait('@postCreateNew')
}

/** Delete an existent Model */
function DeleteModel(modelName) {
  cy.server()
  cy.route('GET', '/apps?**').as('getHomePage')
  cy.visit('http://localhost:5050')
  cy.wait('@getHomePage')

  cy.contains(modelName)
    .parents('.ms-DetailsRow-fields')
    .find('i[data-icon-name="Delete"]')
    .click()

  cy.get('.ms-Dialog-main')
    .contains('Confirm')
    .click()
}

export{NavigateTo, CreateNewModel, DeleteModel}