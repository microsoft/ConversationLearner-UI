/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

const testLog = require('../utils/testlog')

/** Verify: the Train Dialog page is rendered */
function verifyPageTitle() {
  cy.get('div[data-testid="train-dialogs-title"]')
    .contains('Train Dialogs')
}

/** starts a new train dialog */
function createNew() {
  testLog.logStart("TrainDialog: Click Create New");
  cy.server()
  cy.route('POST', '/app/*/teach').as('postTeach')
  cy.route('POST', 'directline/conversations').as('postConv')
  cy.route('PUT', '/state/conversationId?username=ConversationLearnerDeveloper&id=*').as('putConv')

  cy.get('[data-testid="button-new-train-dialog"]')
    .then(function (response) {
      testLog.logStep("Click on New Train Dialog button")
    })
    .click()
  .wait('@postTeach')
  .wait('@postConv')
  .wait('@putConv')
  testLog.logEnd();
}

export { verifyPageTitle, createNew }