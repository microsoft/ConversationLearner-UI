/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
const testLog = require('../utils/testlog')

/** Verify: the log Dialog page is rendered */
function verifyPageTitle() {
  cy.get('div[data-testid="logdialogs-title"]')
    .contains('Log Dialogs')
}

/** starts a new log dialog */
function createNew() {
  cy.server()
  cy.route('PUT', '/state/conversationId?username=ConversationLearnerDeveloper&id=*').as('putConv')
  cy.get('[data-testid="logdialogs-button-create"]')
    .should("be.visible")
    .then(function (response) {
      testLog.logStep("Click button New Log Dialog ")
    })
    .click()
    .wait('@putConv')
}
export { verifyPageTitle, createNew };
