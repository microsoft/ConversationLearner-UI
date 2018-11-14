/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

const homePage = require('../../support/components/HomePage')
const helpers = require('../../support/Helpers')

const AllChatMessagesSelector = 'div[data-testid="web-chat-utterances"] > div.wc-message-content > div > div.format-markdown > p'

export function TypeYourMessage(trainMessage)         { cy.Get('input[class="wc-shellinput"]').type(`${trainMessage}{enter}`) }  // data-testid NOT possible
export function ClickSetInitialStateButton()          { cy.Get('[data-testid="teach-session-set-initial-state"]').Click() }
export function ClickScoreActionsButton()             { cy.Get('[data-testid="score-actions-button"]').Click() }
export function VerifyEntityMemoryIsEmpty()           { cy.Get('[data-testid="memory-table-empty"]').contains('Empty') }
export function EntitySearch()                        { cy.Get('[data-testid="entity-picker-entity-search"]') }
export function AlternativeInputText()                { cy.Get('[data-testid="entity-extractor-alternative-input-text"]') }
export function ClickAddAlternativeInputButton()      { cy.Get('[data-testid="entity-extractor-add-alternative-input-button"]').Click() }
export function ClickEntityDetectionToken(tokenValue) { cy.Get('[data-testid="token-node-entity-value"]').contains(tokenValue).Click() }

export function GetAllChatMessages()                  { return helpers.StringArrayFromInnerHtml(AllChatMessagesSelector)}

// These are for the NEW TRAIN DIALOG mode
export function ClickSaveButton()                     { cy.Get('[data-testid="teach-session-modal-save-button"]').Click() }
export function ClickAbandonButton()                  { cy.Get('[data-testid="teach-session-modal-abandon-button"]').Click() }

// These are for EDIT EXISTING TRAINING mode
export function ClickSaveCloseButton()                { cy.Get('[data-testid="edit-dialog-modal-close-save-button"]').Click() }
export function VerifyCloseButtonLabel()              { cy.Get('[data-testid="edit-dialog-modal-close-save-button"]').contains('Close') }
export function VerifySaveBranchButtonLabel()         { cy.Get('[data-testid="edit-dialog-modal-close-save-button"]').contains('Save Branch') }
export function ClickAbandonDeleteButton()            { cy.Get('[data-testid="edit-dialog-modal-delete-button"]').Click() }
export function VerifyDeleteButtonLabel()             { cy.Get('[data-testid="edit-dialog-modal-delete-button"]').contains('Delete') }
export function VerifyAbandonBranchButtonLabel()      { cy.Get('[data-testid="edit-dialog-modal-delete-button"]').contains('Abandon Branch') }

export function VerifyBranchButtonGroupContainsMessage(message)
  // Verify that the branch button is within the same control group as the originalMessage that was just selected.
  cy.Get('[data-testid="edit-dialog-modal-branch-button"]').as('branchButton')
    .parents('div.wc-message-selected').contains('p', message)


export function AbandonBranchChanges()
{
  ClickAbandonDeleteButton()
  homePage.ClickConfirmButton()
}
// data-testid="edit-dialog-modal-replay-button"

export function VerifyDetectedEntity(entityName, entityValue)
{
  cy.Get('[data-testid="custom-entity-name-button"]').contains(entityName)
  cy.Get('[data-testid="token-node-entity-value"]').contains(entityValue)
}

// Selects FROM ALL chat messages, from both Bot and User
// Once clicked, more UI elements will become visible & enabled
export function SelectChatTurn(message, index = 0)
{
  message = message.replace(/'/g, "’")

  cy.Get(AllChatMessagesSelector).ExactMatches(message).then(elements => {
    if (elements.length <= index) throw `Could not find '${message}' #${index} in chat utterances`
    cy.wrap(elements[index]).Click()
  })
}

export function BranchChatTurn(originalMessage, newMessage, originalIndex = 0)
{
  originalMessage = originalMessage.replace(/'/g, "’")

  SelectChatTurn(originalMessage, originalIndex)

  // Verify that the branch button is within the same control group as the originalMessage that was just selected.
  cy.Get('[data-testid="edit-dialog-modal-branch-button"]').as('branchButton')
    .parents('div.wc-message-selected').contains('p', originalMessage)

  // Capture the list of messages currently in the chat, truncate it at the point of branching, then add the new message to it.
  // This array will be used later to validate that the changed chat is persisted.
  cy.WaitForStableDOM().then(() => 
  { 
    window.capturedAllChatMessages = editDialogModal.GetAllChatMessages()
    for (var i = 0; i < window.capturedAllChatMessages.length; i++)
    {
      if (window.capturedAllChatMessages[i] == originalMessage)
      {
        window.capturedAllChatMessages.length = i + 1
        window.capturedAllChatMessages[i] = newMessage
      }
    }
  })

  cy.Get('@branchButton').Click()
  
  cy.Get('[data-testid="user-input-modal-new-message-input"]').type(`${newMessage}{enter}`)
}

export function SelectAndVerifyEachChatTurn(index = 0)
{
  if (index == 0) cy.Get('[data-testid="web-chat-utterances"]').as('allChatTurns')
  cy.Get('@allChatTurns').then(elements => 
  {
    if (index < elements.length)
    {
      cy.wrap(elements[index]).Click().then(() =>
      {
        VerifyChatTurnControls(elements[index], index)
        SelectAndVerifyEachChatTurn(index + 1)
      })
    }
  })
}

export function VerifyChatTurnControls(element, index)
{
  var userMessage
  if (element.classList.contains('wc-message-from-me')) userMessage = true
  else if (element.classList.contains('wc-message-from-bot')) userMessage = false
  else
  {
    helpers.Dump(`VerifyChatTurnControls()`, element)
    throw 'Expecting element to contain class with either "wc-message-from-me" or "wc-message-from-bot" (see console output for element dump)'
  }

  if (index > 0) cy.Contains('[data-testid="edit-dialog-modal-delete-turn-button"]', 'Delete Turn')
  else cy.DoesNotContain('[data-testid="edit-dialog-modal-delete-turn-button"]')
  
  cy.Contains('[data-testid="chat-edit-add-score-button"]', '+')

  if (userMessage) cy.Get('[data-testid="edit-dialog-modal-branch-button"]').Contains('Branch').ConLog(`VerifyChatTurnControls()`, 'Branch Found')
  else cy.DoesNotContain('[data-testid="edit-dialog-modal-branch-button"]')

  cy.Contains('[data-testid="chat-edit-add-input-button"]', '+')
}

// Provide any user message and any bot message expected in chat.
export function VerifyThereAreNoChatEditControls(userMessage, botMessage)
{
  cy.Get('.wc-message-from-me').contains(userMessage)
  cy.Get('.wc-message-from-bot').contains(botMessage)
  cy.DoesNotContain('[data-testid="edit-dialog-modal-delete-turn-button"]')
  cy.DoesNotContain('[data-testid="chat-edit-add-score-button"]', '+')
  cy.DoesNotContain('[data-testid="edit-dialog-modal-branch-button"]')
  cy.DoesNotContain('[data-testid="chat-edit-add-input-button"]', '+')
}




export function HighlightWord(word) {
  cy.get('span[class="cl-token-node"]')
    .trigger('keydown')
    .click(10, 10)
    .wait(1000)

  cy.get('.custom-toolbar.custom-toolbar--visible')
    .invoke('show')
    .wait()
}

export function VerifyTokenNodeExists() {
  cy.get('.cl-token-node')
    .should('exists')
}

