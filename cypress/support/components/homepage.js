/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

const testLog = require('../utils/testlog')

/** Navigate to the Conversation Learner Homepage */
function navigateTo() {
  testLog.logStart("Navigate to homepage");
  cy.server()
  cy.route('GET', '/apps?**').as('getHomePage')

  // Open application
  cy.visit('http://localhost:5050')
  cy.wait('@getHomePage')
  testLog.logEnd();
}

/** Creates a New Model */
function createNewModel(modelName) {
  testLog.logStart("Create New Model");
  cy.server()
  cy.route('POST', '/app?userId=**').as('postcreateNew')

  // Click the button to create app
  cy.get('[data-testid="apps-list-button-create-new"]')
    .should("be.visible")
    .click()

  // Ensure that name input is focused
  cy.focused()

  cy.get('[data-testid="app-create-input-name"]')
    .should("be.visible")
    .type(modelName)

  cy.get('[data-testid="app-create-button-submit"]')
    .should("be.visible")
    .then(function (response) {
      testLog.logStep("Click on Create button ")
    })
    .click()

  cy.wait('@postcreateNew')
  testLog.logEnd();
}

/** Delete an existent Model */
function deleteModel(modelName) {
  testLog.logStart("Function Delete Model");
  cy.contains(modelName)
    .parents('.ms-DetailsRow-fields')
    .find('i[data-icon-name="Delete"]')
    .click()

  cy.get('.ms-Dialog-main')
    .contains('Confirm')
    .click()
  testLog.logEnd();
}

export { navigateTo, createNewModel, deleteModel }