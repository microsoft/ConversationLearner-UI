/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

/** Verify: the Train Dialog page is rendered */
function verifyPageTitle() {
  cy.get('div[data-testid="logdialogs-title"]')
    .contains('Log Dialogs')
}

/** starts a new train dialog */
function createNew() {
  cy.on('uncaught:exception', (err, runnable) => {
    return false
  })
  cy.server()
  cy.route('PUT', '/state/conversationId?username=ConversationLearnerDeveloper&id=*').as('putConv')
  cy.get('[data-testid="logdialogs-button-create"]')
    .click()
  cy.wait('@putConv')
}

export { verifyPageTitle, createNew };
