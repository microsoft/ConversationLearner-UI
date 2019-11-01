/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as popupModal from './PopupModal'
import * as helpers from '../Helpers'

export function CreateNewLogDialogButton() { cy.Get('[data-testid="log-dialogs-new-button"]').Click() }
export function ClickDoneTestingButton() { return cy.Get('[data-testid="chat-session-modal-done-testing-button"]').Click() }
export function ClickAbandonDeleteButton() { cy.Get('[data-testid="edit-dialog-modal-abandon-delete-button"]').Click() }
export function TypeYourMessage(message) { cy.Get('input[placeholder="Type your message..."]').type(`${message}{enter}`) }  // data-testid NOT possible

export function ClickSessionTimeoutButtonAndOkayThePopup() { 
  cy.Get('[data-testid="chat-session-modal-session-timeout-button"]').Click()
  popupModal.VerifyExactTitleNoContentClickButton('The EndSession callback will be invoked on the next user input, and a new Session started', '[data-testid="confirm-cancel-modal-ok"]') 
}

// This function verifies both the input message is reflected back and the response is what we are expecting.
// This also has the useful side effect of blocking this function from returning until after
// the response has been returned.
// For END_SESSION Actions leave 'expectedResponse' undefined.
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
  })

  // data-testid is NOT possible for this field
  cy.Get('input[placeholder="Type your message..."]').type(`${message}{enter}`).then(() => {
    if (!expectedResponse) {
      // No expected response = an END_SESSION Action.
      // END_SESSION actions do not result in a Bot response. This is difficult to test for since
      // it can take 5-30 seconds for a Bot response to show up. Even though 1-2 seconds is typical
      // we cannot be certain there will be no Bot response unless we wait much longer to confirm 
      // and that will cause tests to take a very long time. So to confidently validate no Bot response
      // for this case we must do that at a later point in the test code. However, we do a quick 
      // validation here because we should also give the UI and backend a chance to process the 
      // user turn to produce the END_SESSION response.
      
      // Bug 2196: EndSession Action in Log Dialog is causing 'Session not found' error
      // I wanted to set this to 1000, but when I do this bug is triggered. 
      // If the bug gets fixed we can reduce this wait time.
      let callItGoodTime = new Date().getTime() + 3000
      
      expectedUtteranceCount = indexBotResponse
      cy.get('.wc-message-content').should(elements => {
        if (elements.length < expectedUtteranceCount) {
          throw new Error('User utterance has not shown up yet...retrying')
        } else if (elements.length > expectedUtteranceCount) {
          // Cypress will retry this even though the result should not change but there is not much we can do about it.
          throw new Error('Too many utterances in the Log Dialog, we were expecting an END_SESSION action without an utterance.')
        } else if (new Date().getTime() < callItGoodTime) {
          throw new Error('The utterance count is good, however, retrying to ensure some random Bot utterance does not come up unexpectedly')
        }
      })
    } else {
      expectedUtteranceCount = indexBotResponse + 1

      startTime = Cypress.moment()

      let expectedUtterance = message//.replace(/'/g, "’")
      
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
    }
  })
}