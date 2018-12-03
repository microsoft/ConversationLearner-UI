/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

const homePage = require('../../support/components/HomePage')
const helpers = require('../../support/Helpers')
const scorerModal = require('../../support/components/ScorerModal')

export const AllChatMessagesSelector = 'div[data-testid="web-chat-utterances"] > div.wc-message-content > div > div.format-markdown > p'

export function TypeYourMessage(trainMessage)         { cy.Get('input[class="wc-shellinput"]').type(`${trainMessage}{enter}`) }  // data-testid NOT possible
export function ClickSetInitialStateButton()          { cy.Get('[data-testid="teach-session-set-initial-state"]').Click() }
export function ClickScoreActionsButton()             { cy.Get('[data-testid="score-actions-button"]').Click() }
export function VerifyEntityMemoryIsEmpty()           { cy.Get('[data-testid="memory-table-empty"]').contains('Empty') }
export function EntitySearch()                        { cy.Get('[data-testid="entity-picker-entity-search"]') }
export function AlternativeInputText()                { cy.Get('[data-testid="entity-extractor-alternative-input-text"]') }
export function ClickAddAlternativeInputButton()      { cy.Get('[data-testid="entity-extractor-add-alternative-input-button"]').Click() }
export function ClickEntityDetectionToken(tokenValue) { cy.Get('[data-testid="token-node-entity-value"]').contains(tokenValue).Click() }

export function GetAllChatMessages()                  { return helpers.StringArrayFromInnerHtml(AllChatMessagesSelector)}

export function ClickSaveCloseButton()                { cy.Get('[data-testid="edit-teach-dialog-close-save-button"]').Click() }
export function VerifyCloseButtonLabel()              { cy.Get('[data-testid="edit-teach-dialog-close-save-button"]').contains('Close') }
export function VerifySaveBranchButtonLabel()         { cy.Get('[data-testid="edit-teach-dialog-close-save-button"]').contains('Save Branch') }
export function ClickAbandonDeleteButton()            { cy.Get('[data-testid="edit-dialog-modal-delete-button"]').Click() }
export function VerifyDeleteButtonLabel()             { cy.Get('[data-testid="edit-dialog-modal-delete-button"]').contains('Delete') }
export function VerifyAbandonBranchButtonLabel()      { cy.Get('[data-testid="edit-dialog-modal-delete-button"]').contains('Abandon Branch') }

// Verify that the branch button is within the same control group as the message.
export function VerifyBranchButtonGroupContainsMessage(message)
{
  cy.Get('[data-testid="edit-dialog-modal-branch-button"]').as('branchButton')
    .parents('div.wc-message-selected').contains('p', message)
}

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

// This is meant to be called after SelectChatTurn for a user message.
// Do NOT use this for bot messages, since they have no branching capabilities.
// Side Effect: '@branchButton' alias is created.
export function VerifyBranchButtonIsInSameControlGroupAsMessage(message)
{
  // Verify that the branch button is within the same control group as the originalMessage that was just selected.
  cy.Get('[data-testid="edit-dialog-modal-branch-button"]').as('branchButton')
    .parents('div.wc-message-selected').contains('p', message)
}

// This depends on the '@branchButton' alias having been created by the VerifyBranchButtonIsInSameControlGroupAsMessage() function.
export function BranchChatTurn(message)
{
  cy.Get('@branchButton').Click()
  cy.Get('[data-testid="user-input-modal-new-message-input"]').type(`${message}{enter}`)
}

// Creates the '@allChatTurns' alias.
export function GetAllChatTurns()
{
  cy.Get('[data-testid="web-chat-utterances"]').as('allChatTurns')  
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
  // These confirm we are looking at the chat history we are expecting to validate.
  cy.Get('.wc-message-from-me').contains(userMessage)
  cy.Get('.wc-message-from-bot').contains(botMessage)

  // These do the actual validation this function is intended to validate.
  cy.DoesNotContain('[data-testid="edit-dialog-modal-delete-turn-button"]')
  cy.DoesNotContain('[data-testid="chat-edit-add-score-button"]', '+')
  cy.DoesNotContain('[data-testid="edit-dialog-modal-branch-button"]')
  cy.DoesNotContain('[data-testid="chat-edit-add-input-button"]', '+')
}

// TODO: This method DOES NOT WORK! Need Lars or Brian to come up with a solution.
export function LabelTextAsEntity(text, entity)
{
  cy.Get('[data-testid="entity-extractor-alternative-input-text"]').type('{shift}{tab}{rightarrow}')

  //cy.Get('[data-testid="token-node-entity-value"]').contains(text)
  //.parents('[data-testid="token-node-entity-value"]')
  //.focus().select()
  //.select()
  //.click({ force: true })
  //.trigger('MouseDown').wait(100).trigger('MouseUp')
  cy.wait(1000)
  cy.Get('[data-testid="entity-picker-entity-search"]').type(`${entity}{enter}`)
}