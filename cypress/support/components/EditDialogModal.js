/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

const homePage = require('../../support/components/HomePage')
const helpers = require('../../support/Helpers')
const scorerModal = require('../../support/components/ScorerModal')

export const AllChatMessagesSelector = 'div[data-testid="web-chat-utterances"] > div.wc-message-content > div > div.format-markdown > p'

export function TypeYourMessage(trainMessage) { cy.Get('input.wc-shellinput').type(`${trainMessage}{enter}`) }  // data-testid NOT possible
export function TypeAlternativeInput(trainMessage) { cy.Get('[data-testid="entity-extractor-alternative-input-text"]').type(`${trainMessage}{enter}`) }
export function ClickSetInitialStateButton() { cy.Get('[data-testid="teach-session-set-initial-state"]').Click() }
export function ClickScoreActionsButton() { cy.Get('[data-testid="score-actions-button"]').Click() }
export function VerifyEntityMemoryIsEmpty() { cy.Get('[data-testid="memory-table-empty"]').contains('Empty') }
export function EntitySearch() { cy.Get('[data-testid="entity-picker-entity-search"]') }
export function ClickAddAlternativeInputButton() { cy.Get('[data-testid="entity-extractor-add-alternative-input-button"]').Click() }
export function ClickEntityDetectionToken(tokenValue) { cy.Get('[data-testid="token-node-entity-value"]').contains(tokenValue).Click() }
export function ClickSubmitChangesButton() { cy.Get('[data-testid="submit-changes-button"]').Click() }
export function GetAllChatMessages() { return helpers.StringArrayFromInnerHtml(AllChatMessagesSelector) }
export function VerifyErrorMessage(expectedMessage) { cy.Get('div.cl-editdialog-error > div > span').ExactMatch(expectedMessage) }
export function VerifyNoErrorMessage() { cy.DoesNotContain('div.cl-editdialog-error > div > span') }
export function ClickDeleteChatTurn() { cy.Get('[data-testid="edit-dialog-modal-delete-turn-button"]').Click() }

export function ClickSaveCloseButton() { cy.Get('[data-testid="edit-teach-dialog-close-save-button"]').Click() }
export function VerifyCloseButtonLabel() { cy.Get('[data-testid="edit-teach-dialog-close-save-button"]').contains('Close') }
export function VerifySaveBranchButtonLabel() { cy.Get('[data-testid="edit-teach-dialog-close-save-button"]').contains('Save Branch') }
export function ClickAbandonDeleteButton() { cy.Get('[data-testid="edit-dialog-modal-abandon-delete-button"]').Click() }
export function VerifyDeleteButtonLabel() { cy.Get('[data-testid="edit-dialog-modal-abandon-delete-button"]').contains('Delete') }
export function VerifyAbandonBranchButtonLabel() { cy.Get('[data-testid="edit-dialog-modal-abandon-delete-button"]').contains('Abandon Branch') }
export function ClickUndoButton() { cy.Get('[data-testid="edit-teach-dialog-undo-button"]').Click() }

export function ClickConfirmAbandonDialogButton() { return cy.Get('.ms-Dialog-main').contains('abandon').parents('.ms-Dialog-main').contains('Confirm').Click() }

// Verify that the branch button is within the same control group as the message.
export function VerifyBranchButtonGroupContainsMessage(message) {
  cy.Get('[data-testid="edit-dialog-modal-branch-button"]').as('branchButton')
    .parents('div.wc-message-selected').contains('p', message)
}

export function AbandonBranchChanges() {
  ClickAbandonDeleteButton()
  homePage.ClickConfirmButton()
}

// Selects FROM ALL chat messages, from both Bot and User.
// Once clicked, more UI elements will become visible & enabled.
// OPTIONAL index parameter lets you select other than the 1st 
// instance of a message.
// RETURNS: A Promise containing the index of the selected turn.
export function SelectChatTurn(message, index = 0) {
  var funcName = `SelectChatTurn(${message}, ${index})`
  cy.ConLog(`SelectChatTurn(${message}, ${index})`, `Start`)
  return new Promise(resolve => {
    cy.WaitForStableDOM()
    cy.Enqueue(() => {
      message = message.replace(/'/g, "’")
      var elements = Cypress.$(AllChatMessagesSelector)
      helpers.ConLog(funcName, `Chat message count: ${elements.length}`)
      for (var i = 0; i < elements.length; i++) {
        helpers.ConLog(funcName, `Chat turn: '${elements[i].innerHTML}'`)
        if (helpers.RemoveMarkup(elements[i].innerHTML) == message) {
          if (index > 0) index--
          else {
            helpers.ConLog(funcName, `FOUND!`)
            cy.wrap(elements[i]).Click().then(() => { resolve(i) })
            return
          }
        }
        else helpers.ConLog(funcName, `NOT A MATCH`)
        helpers.ConLog(funcName, `NEXT`)
      }
      throw `${funcName} - Failed to find the message in chat utterances`
    })
  })
}

// This is meant to be called after SelectChatTurn for a user message.
// Do NOT use this for bot messages, since they have no branching capabilities.
// Side Effect: '@branchButton' alias is created.
export function VerifyBranchButtonIsInSameControlGroupAsMessage(message) {
  // Verify that the branch button is within the same control group as the originalMessage that was just selected.
  cy.Get('[data-testid="edit-dialog-modal-branch-button"]').as('branchButton')
    .parents('div.wc-message-selected').contains('p', message)
}

// This depends on the '@branchButton' alias having been created by the VerifyBranchButtonIsInSameControlGroupAsMessage() function.
export function BranchChatTurn(message) {
  cy.Get('@branchButton').Click()
  cy.Get('[data-testid="user-input-modal-new-message-input"]').type(`${message}{enter}`)
}

// Creates the '@allChatTurns' alias.
export function GetAllChatTurns() {
  cy.Get('[data-testid="web-chat-utterances"]').as('allChatTurns')
}

export function VerifyChatTurnControls(element, index) {
  var userMessage
  if (element.classList.contains('wc-message-from-me')) userMessage = true
  else if (element.classList.contains('wc-message-from-bot')) userMessage = false
  else {
    helpers.Dump(`VerifyChatTurnControls()`, element)
    throw 'Expecting element to contain class with either "wc-message-from-me" or "wc-message-from-bot" (see console output for element dump)'
  }

  if (index > 0) cy.Contains('[data-testid="edit-dialog-modal-delete-turn-button"]', 'Delete Turn')
  else cy.DoesNotContain('[data-testid="edit-dialog-modal-delete-turn-button"]')

  cy.Contains('[data-testid="chat-edit-add-bot-response-button"]', '+')

  if (userMessage) cy.Get('[data-testid="edit-dialog-modal-branch-button"]').Contains('Branch').ConLog(`VerifyChatTurnControls()`, 'Branch Found')
  else cy.DoesNotContain('[data-testid="edit-dialog-modal-branch-button"]')

  cy.Contains('[data-testid="chat-edit-add-user-input-button"]', '+')
}

// Provide any user message and any Bot message expected in chat.
export function VerifyThereAreNoChatEditControls(userMessage, botMessage) {
  // These confirm we are looking at the chat history we are expecting to validate.
  cy.Get('.wc-message-from-me').contains(userMessage)
  cy.Get('.wc-message-from-bot').contains(botMessage)

  // These do the actual validation this function is intended to validate.
  cy.DoesNotContain('[data-testid="edit-dialog-modal-delete-turn-button"]')
  cy.DoesNotContain('[data-testid="chat-edit-add-bot-response-button"]', '+')
  cy.DoesNotContain('[data-testid="edit-dialog-modal-branch-button"]')
  cy.DoesNotContain('[data-testid="chat-edit-add-user-input-button"]', '+')
}

export function LabelTextAsEntity(text, entity) {
  cy.Get('body').trigger('Test_SelectWord', { detail: text })
  cy.Get('[data-testid="entity-picker-entity-search"]').type(`${entity}{enter}`)
}

// Verify that a specific word of a user utterance has been labeled as an entity.
// word = a word within the utterance that should already be labeled
// entity = name of entity the word was labled with
// *** This may work for multiple word labels, but you must only pass in the one
// *** word that uniquely identifies the labeled text
export function RemoveEntityLabel(word, entity, index = 0) {
  cy.Get('div.slate-editor').then(elements => {
    expect(elements.length).to.be.at.least(index - 1)
    cy.wrap(elements[index]).within(() => {
      cy.wrap(elements[index]).click()
      cy.Get('[data-testid="token-node-entity-value"] > span > span')
        .ExactMatch(word)
        .parents('.cl-entity-node--custom')
        .find('[data-testid="custom-entity-name-button"]')
        .contains(entity)
        .Click()

      cy.Get('button[title="Unselect Entity"]').Click()
    })
  })

}

// Verify that a specific word of a user utterance has been labeled as an entity.
// textEntityPairs object contains these two variables, it can be either an array or single instance:
//  word = a word within the utterance that should already be labeled
//  entity = name of entity the word should be labeled with
// *** This does NOT work for multiple words. ***
export function VerifyEntityLabel(word, entity) {
  cy.Get('[data-testid="token-node-entity-value"] > span > span')
    .ExactMatch(word)
    .parents('.cl-entity-node--custom')
    .find('[data-testid="custom-entity-name-button"]')
    .contains(entity)
}

// textEntityPairs object contains these two variables, it can be either an array or single instance:
//  text = a word within the utterance that should already be labeled
//  entity = name of entity to label the word with
export function VerifyEntityLabeledDifferentPopupAndClose(textEntityPairs) { VerifyEntityLabeledDifferentPopupAndClickButton(textEntityPairs, 'Close') }
export function VerifyEntityLabeledDifferentPopupAndAccept(textEntityPairs) { VerifyEntityLabeledDifferentPopupAndClickButton(textEntityPairs, 'Accept') }

function VerifyEntityLabeledDifferentPopupAndClickButton(textEntityPairs, buttonLabel) {
  cy.Get('.ms-Dialog-main')     // This returns multiple parent objects
    .contains('Entity is labelled differently in another user utterance') // Narrows it down to 1
    .parents('.ms-Dialog-main') // Back to the single parent object
    .within(() => {
      if (!Array.isArray(textEntityPairs)) textEntityPairs = [textEntityPairs]
      for (var i = 0; i < textEntityPairs.length; i++) VerifyEntityLabel(textEntityPairs[i].text, textEntityPairs[i].entity)

      // TODO: Wanted to use 'ExactMatch' instead of 'contains', but there is a weird problem...
      //       for some reson the first two button texts on this popup all end with a newline.
      cy.get('button.ms-Button').contains(buttonLabel).Click()
    })
}

export function VerifyEntityLabelWithinSpecificInput(textEntityPairs, index) {
  cy.Get('div.slate-editor').then(elements => {
    expect(elements.length).to.be.at.least(index - 1)
    cy.wrap(elements[index]).within(() => {
      if (!Array.isArray(textEntityPairs)) textEntityPairs = [textEntityPairs]
      for (var i = 0; i < textEntityPairs.length; i++) VerifyEntityLabel(textEntityPairs[i].text, textEntityPairs[i].entity)
    })
  })
}

export function InsertUserInputAfter(existingMessage, newMessage) {
  SelectChatTurn(existingMessage)
  cy.RunAndExpectDomChange(() => { Cypress.$('[data-testid="chat-edit-add-user-input-button"]')[0].click() })
  cy.Get('[data-testid="user-input-modal-new-message-input"]').type(`${newMessage}{enter}`)
}

// OPTIONAL index parameter lets you select other than the 1st 
// instance of a message as the point of insertion.
export function InsertBotResponseAfter(existingMessage, newMessage, index = 0) {
  cy.ConLog(`InsertBotResponseAfter(${existingMessage}, ${newMessage})`, `Start`)
  SelectChatTurn(existingMessage, index).then(indexOfSelectedChatTurn => {
    cy.RunAndExpectDomChange(() => { Cypress.$('[data-testid="chat-edit-add-bot-response-button"]')[0].click() })
    if (newMessage) {
      cy.WaitForStableDOM()
      cy.wait(1000) // TODO: Remove this after fixing Bug 1855: More Odd Rendering in Train Dialog Chat Pane
      cy.Enqueue(() => { // Sometimes the UI has already automaticly selected the Bot response we want
        // so we need to confirm that we actually need to click on the action, 
        // otherwise an unnecessary message box pops up that we don't want to deal with.

        var chatMessages = helpers.StringArrayFromInnerHtml(AllChatMessagesSelector)
        if (chatMessages[indexOfInsertedBotResponse] != newMessage)
          scorerModal.ClickAction(newMessage)
      })
    }
    cy.ConLog(`InsertBotResponseAfter(${existingMessage}, ${newMessage})`, `End`)
  })
}
