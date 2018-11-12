/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

 const helpers = require('../../support/Helpers')

export function TypeYourMessage(trainMessage)         { cy.Get('input[class="wc-shellinput"]').type(`${trainMessage}{enter}`) }  // data-testid NOT possible
export function ClickSetInitialStateButton()          { cy.Get('[data-testid="teach-session-set-initial-state"]').Click() }
export function ClickScoreActionsButton()             { cy.Get('[data-testid="entity-extractor-score-actions-button"]').Click() }
export function ClickSaveButton()                     { cy.Get('[data-testid="teach-session-modal-save-button"]').Click() }
export function ClickAbandonButton()                  { cy.Get('[data-testid="teach-session-modal-abandon-button"]').Click() }
export function ClickSaveCloseButton()                { cy.Get('[data-testid="edit-dialog-modal-close-save-button"]').Click() }
export function VerifyEntityMemoryIsEmpty()           { cy.Get('[data-testid="memory-table-empty"]').contains('Empty') }
export function EntitySearch()                        { cy.Get('[data-testid="entity-picker-entity-search"]') }
export function AlternativeInputText()                { cy.Get('[data-testid="entity-extractor-alternative-input-text"]') }
export function ClickAddAlternativeInputButton()      { cy.Get('[data-testid="entity-extractor-add-alternative-input-button"]').Click() }
export function ClickEntityDetectionToken(tokenValue) { cy.Get('[data-testid="token-node-entity-value"]').contains(tokenValue).Click() }

// data-testid="edit-dialog-modal-replay-button"
// data-testid="edit-dialog-modal-delete"

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

  cy.Get('[data-testid="web-chat-utterances"]').within(elements => {
    cy.get('div.format-markdown > p').ExactMatches(message).then(elements => {
    if (elements.length <= index) throw `Could not find '${message}' #${index} in chat utterances`
    cy.wrap(elements[index]).Click()
  })})
}

export function BranchChatTurn(originalMessage, newMessage, originalIndex = 0)
{
  originalMessage = originalMessage.replace(/'/g, "’")

  SelectChatTurn(originalMessage, originalIndex)

  // Validate that the branch button is within the same control group as the originalMessage that was just selected.
  cy.Get('[data-testid="edit-dialog-modal-branch-button"]').as('branchButton')
    .parents('div.wc-message-selected').contains('p', originalMessage)

  cy.Get('@branchButton').Click()
  
  cy.Get('[data-testid="user-input-modal-new-message-input"]').type(`${newMessage}{enter}`)
  // TODO: Verify that data-testid="edit-dialog-modal-score-actions-button" exists
  //       Verify that number of turns are reduced by the ones that were cut off.
  //       Verify that "Replay", "Save Branch" & "Abandon Branch" buttons appear and are enabled.
}

export function SelectAndValidateEachChatTurn(index = 0)
{
  helpers.ConLog(`SelectEachChatTurn(${index})`, '')
  if (index == 0) cy.Get('[data-testid="web-chat-utterances"]').as('allChatTurns')
  cy.Get('@allChatTurns').then(elements => 
  {
    if (index < elements.length)
    {
      cy.wrap(elements[index]).Click().then(() =>
      {
        ValidateChatTurnControls(elements[index], index)
        SelectAndValidateEachChatTurn(index + 1)
      })
    }
  })
}

export function ValidateChatTurnControls(element, index)
{
  helpers.Dump(`ValidateChatTurnControls()`, element)

  var userMessage
  if (element.classList.contains('wc-message-from-me')) userMessage = true
  else if (element.classList.contains('wc-message-from-bot')) userMessage = false
  else
  {
    helpers.Dump(`ValidateChatTurnControls()`, element)
    throw 'Expecting element to contain class with either "wc-message-from-me" or "wc-message-from-bot" (see console output for element dump)'
  }

  if (index > 0) cy.Contains('[data-testid="edit-dialog-modal-delete-turn-button"]', 'Delete Turn')
  else cy.DoesNotContain('[data-testid="edit-dialog-modal-delete-turn-button"]')
  
  cy.Contains('[data-testid="chat-edit-add-score-button"]', '+')

  if (userMessage) cy.Get('[data-testid="edit-dialog-modal-branch-button"]').Contains('Branch').ConLog(`ValidateChatTurnControls()`, 'Branch Found')
  else cy.DoesNotContain('[data-testid="edit-dialog-modal-branch-button"]')

  cy.Contains('[data-testid="chat-edit-add-input-button"]', '+')
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

