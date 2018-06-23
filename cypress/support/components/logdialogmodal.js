/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
const testLog = require('../utils/testlog')

/** Chat: Types a new user's message */
function typeYourMessage(trainmessage) {
  // Submit message to WebChat
  cy.server()
  cy.route('POST', '/directline/conversations/**').as('postConversations')

  cy.get('input[class="wc-shellinput"]')
    .should("be.visible")
    .type(trainmessage)
  cy.get('label[class="wc-send"]')
    .should("be.visible")
    .then(function (response) {
      testLog.logStep("Send a new message to WebChat")
    })
    .click()
    .wait('@postConversations')
}

function clickDone() {
  cy.get('[data-testid="chatsession-modal-footer-button1"]')
    .should("be.visible")
    .click()
}

export { typeYourMessage, clickDone };
