/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
export function typeYourMessage(trainmessage) {
  cy.server()
  cy.route('POST', '/directline/conversations/**').as('postConversations')

  cy.get('input[class="wc-shellinput"]')
    .should("be.visible")
    .type(`${trainmessage}{enter}`)

  cy.wait('@postConversations')
    .wait(500)
}

export function clickDone() {
  cy.get('[data-testid="chatsession-modal-footer-button1"]')
    .should("be.visible")
    .click()
    .wait(500)

}
