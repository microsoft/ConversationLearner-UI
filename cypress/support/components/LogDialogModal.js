/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

export function CreateNewLogDialogButton() { cy.Get('[data-testid="log-dialogs-new-button"]').Click() }
export function ClickDoneTestingButton() { return cy.Get('[data-testid="chat-session-modal-done-testing-button"]').Click() }
export function ClickSessionTimeoutButton() { cy.Get('[data-testid="chat-session-modal-session-timeout-button"]').Click() }
export function TypeYourMessage(message) { cy.Get('input[placeholder="Type your message..."]').type(`${message}{enter}`) }  // data-testid NOT possible

export function TypeYourMessageValidateResponse(message, expectedResponse) {
  let originalUtteranceCount = 0
  cy.WaitForStableDOM()
  cy.Enqueue(() => {
    let elements = Cypress.$('.wc-message-content')
    originalUtteranceCount =  elements.length
  })

  cy.Get('input[placeholder="Type your message..."]').type(`${message}{enter}`)  // data-testid NOT possible

  // Verify both the input message is reflected back and the response is what we are expecting.
  // This also has the useful side effect of blocking this function from returning until after
  // the response has been returned.
  let expectedUtterance = message.replace(/'/g, "’")
  cy.Get('.wc-message-content').last().contains(expectedUtterance).then(() => {
    
    // We allow for a long retry timeout because there have been times the Bot is either slow to respond
    // or it does not respond at all and we want to which of those errors are frequent or rare.
    cy.get('.wc-message-content', { timeout: 30000 }).should('have.length', originalUtteranceCount + 2).then(elements =>{
      if (expectedResponse) {
        expectedUtterance = expectedResponse.replace(/'/g, "’")
        cy.wrap(elements[elements.length - 1]).contains(expectedUtterance)
      }
    })
  })
}