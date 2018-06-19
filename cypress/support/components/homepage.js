/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

const testLog = require('../utils/testlog')

/** Navigate to the Conversation Learner Homepage */
function navigateTo() {
  cy.server()
  cy.route('GET', '/apps?**').as('getHomePage')

  // Open application
  cy.visit('http://localhost:5050')
  cy.wait('@getHomePage')
}

/** Creates a New Model */
function createNewModel(modelName) {
  cy.server()
  cy.route('POST', '/app?userId=**').as('postcreateNew')

  // Click the button to create app
  cy.get('[data-testid="apps-list-button-create-new"]')
    .click()

  // Ensure that name input is focused
  cy.focused()

  cy.get('[data-testid="app-create-input-name"]')
    .type(modelName)

  cy.get('[data-testid="app-create-button-submit"]')
    .then(function (response) {
      testLog.printStep("Click on Create button ")
    })
    .click()

  cy.wait('@postcreateNew')
}

/** Delete an existent Model */
function deleteModel(modelName) {
  cy.contains(modelName)
    .parents('.ms-DetailsRow-fields')
    .find('i[data-icon-name="Delete"]')
    .click()

  cy.get('.ms-Dialog-main')
    .contains('Confirm')
    .click()
}

export { navigateTo, createNewModel, deleteModel }