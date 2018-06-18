/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

/** Chat: Types a new user's message */
function newUserMessage(trainMessage: string) {
  cy.on('uncaught:exception', (err, runnable) => {
    return false
  })

  // Submit message to WebChat
  cy.server()
  cy.route('POST', '/directline/conversations/**').as('postConversations')

  cy.get('input[class="wc-shellinput"]').type(trainMessage)
  cy.get('label[class="wc-send"]').click()

  cy.wait('@postConversations')
}

function clickDone() {
  cy.get('[data-testid="chatsession-modal-footer-button1"]')
    .click()
}

export { newUserMessage, clickDone };
