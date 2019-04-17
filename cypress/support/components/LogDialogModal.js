/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as helpers from '../Helpers'

export function CreateNewLogDialogButton() { cy.Get('[data-testid="log-dialogs-new-button"]').Click() }
export function ClickDoneTestingButton() { return cy.Get('[data-testid="chat-session-modal-done-testing-button"]').Click() }
export function ClickSessionTimeoutButton() { cy.Get('[data-testid="chat-session-modal-session-timeout-button"]').Click() }
export function TypeYourMessage(message) { cy.Get('input[placeholder="Type your message..."]').type(`${message}{enter}`) }  // data-testid NOT possible

// This function verifies both the input message is reflected back and the response is what we are expecting.
// This also has the useful side effect of blocking this function from returning until after
// the response has been returned.
// If you do not pass in the 'expectedResponse' then it will merely verify that it got a response.
export function TypeYourMessageValidateResponse(message, expectedResponse) {
  let startTime
  let indexUserMesage
  let indexBotResponse
  let expectedUtteranceCount

  cy.WaitForStableDOM()
  cy.Enqueue(() => {
    let elements = Cypress.$('.wc-message-content')
    indexUserMesage = elements.length 
    indexBotResponse = indexUserMesage + 1
    expectedUtteranceCount =  indexBotResponse + 1
  })

  // data-testid is NOT possible for this field
  cy.Get('input[placeholder="Type your message..."]').type(`${message}{enter}`).then(() => {
    startTime = Cypress.moment()

    let expectedUtterance = message.replace(/'/g, "’")
    
    // We allow for a long retry timeout because there have been times the Bot is either slow to respond
    // or it does not respond at all and we want to know which of those errors are frequent or rare.
    cy.get('.wc-message-content', { timeout: 30000 }).should('have.length', expectedUtteranceCount).then(elements =>{
      let elapsedTime = Cypress.moment().diff(startTime)
      helpers.ConLog(`TypeYourMessageValidateResponse(${message}, ${expectedResponse})`, `Elapsed Time for Bot's Response: ${elapsedTime}`)
      
      cy.wrap(elements[indexUserMesage]).contains(expectedUtterance).then(() => {
        if (expectedResponse) {
          expectedUtterance = expectedResponse.replace(/'/g, "’")
          cy.wrap(elements[indexBotResponse]).contains(expectedUtterance)
        }
      })
    })
  })
}