/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

/** navitage to train dialogs page */
function NavigateTo() {
  cy.get('a[href$="/trainDialogs"]')
    .click()
}

/** Verify: the Train Dialog page is rendered */
function VerifyPageTitle() {
  cy.get('div[data-testid="train-dialogs-title"]')
    .contains('Train Dialogs')
}

/** starts a new train dialog */
function CreateNew() {
  cy.on('uncaught:exception', (err, runnable) => {
    return false
  })
  cy.server()
  cy.route('POST', '/app/*/teach').as('postTeach')
  cy.route('POST', 'directline/conversations').as('postConv')
  cy.route('PUT', '/state/conversationId?username=ConversationLearnerDeveloper&id=*').as('putConv')

  cy.get('[data-testid="button-new-train-dialog"]')
    .click()

  cy.wait('@postTeach')
  cy.wait('@postConv')
  cy.wait('@putConv')
}

export { NavigateTo, VerifyPageTitle, CreateNew }