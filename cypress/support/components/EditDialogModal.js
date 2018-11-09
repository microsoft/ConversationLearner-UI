/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

export function TypeYourMessage(trainMessage)         { cy.Get('input[class="wc-shellinput"]').type(`${trainMessage}{enter}`) }  // data-testid NOT possible
export function ClickSetInitialStateButton()          { cy.Get('[data-testid="teach-session-set-initial-state"]').Click() }
export function ClickScoreActionsButton()             { cy.Get('[data-testid="entity-extractor-score-actions-button"]').Click() }
export function ClickSaveButton()                     { cy.Get('[data-testid="teach-session-footer-button-save"]').Click() }
export function clickAbandonButton()                  { cy.Get('[data-testid="teach-session-footer-button-abandon"]').Click() }
export function VerifyEntityMemoryIsEmpty()           { cy.Get('[data-testid="memory-table-empty"]').contains('Empty') }
export function EntitySearch()                        { cy.Get('[data-testid="entity-picker-entity-search"]') }
export function AlternativeInputText()                { cy.Get('[data-testid="entity-extractor-alternative-input-text"]') }
export function ClickAddAlternativeInputButton()      { cy.Get('[data-testid="entity-extractor-add-alternative-input-button"]').Click() }
export function ClickEntityDetectionToken(tokenValue) { cy.Get('[data-testid="token-node-entity-value"]').contains(tokenValue).Click() }

// Selects from ALL chat messages, from both Bot and User
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
    .parents('div.wc-message-selected').Contains('p', originalMessage)

  cy.Get('@branchButton').Click()
  
  cy.Get('[data-testid="user-input-modal-new-message-input"]').type(`${newMessage}{enter}`)

}

export function SelectEachChatTurn(index = 0)
{
  if (index == 0) cy.Get('[data-testid="web-chat-utterances"]').as('allChatTurns')
  cy.Get('@allChatTurns').then(elements => 
  {
    if (index < elements.length)
    {
      cy.wrap(elements[index]).Click().then(() =>
      {
        SelectEachChatTurn(index + 1)
      })
    }
  })
}

export function ValidateChatTurnControls(element)
{
  if (Cypress.$(element).$('div.wc-message-from-bot') != undefined) 
  {} //do something
  else if (Cypress.$(element).$('div.wc-message-from-me') != undefined)
  {} //do something  
}

// Use these to get either Bot or User chat messages
// div.wc-message.wc-message-from-me.wc-message-color-train
// div.wc-message.wc-message-from-bot.wc-message-color-bot


export function VerifyDetectedEntity(entityName, entityValue)
{
  cy.Get('[data-testid="custom-entity-name-button"]').contains(entityName)
  cy.Get('[data-testid="token-node-entity-value"]').contains(entityValue)
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

