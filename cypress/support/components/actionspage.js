/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
const testLog = require('../utils/testlog')

/** Click on create a new action button */
function createNew() {
  cy.get('.cl-page').within(() => {
  cy
    .get('[data-testid="actions-button-create"]')
    .should("be.visible")
    .then(function (response) {
      testLog.logStep("Create a New Action")
    })
    .click({ force: true })
  })
  cy.get( '[data-testid="dropdown-action-type"]')
    .should("be.visible");
}
export {createNew};