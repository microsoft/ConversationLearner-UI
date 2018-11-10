/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

 const helpers = require('../../support/Helpers')

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
    .parents('div.wc-message-selected').contains('p', originalMessage)

  cy.Get('@branchButton').Click()
  
  cy.Get('[data-testid="user-input-modal-new-message-input"]').type(`${newMessage}{enter}`)

}

export function SelectEachChatTurn(index = 0)
{
  helpers.ConLog(`SelectEachChatTurn(${index})`, '')
  if (index == 0) cy.Get('[data-testid="web-chat-utterances"]').as('allChatTurns')
  cy.Get('@allChatTurns').then(elements => 
  {
    if (index < elements.length)
    {
      cy.wrap(elements[index]).Click().then(() =>
      {
        ValidateChatTurnControls(elements[index])
        SelectEachChatTurn(index + 1)
      })
    }
  })
}

export function ValidateChatTurnControls(element)
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

  // var currentHtml = Cypress.$('html')[0].outerHTML
  // if (currentHtml.includes('data-testid="edit-dialog-modal-branch-button"')) helpers.ConLog(`ValidateChatTurnControls()`, 'FOUND Branch Button')
  if (userMessage) cy.Get('[data-testid="edit-dialog-modal-branch-button"]').Contains('Branch').ConLog(`ValidateChatTurnControls()`, 'Branch Found')
  // if (Cypress.$(element).find('i[data-icon-name="Delete"]') != undefined) 
  // { helpers.ConLog(`ValidateChatTurnControls()`, 'FOUND Delete Icon')}
  
  // if (Cypress.$(element).find('div[data-testid="chat-edit-add-score-button"]') != undefined) 
  // { helpers.ConLog(`ValidateChatTurnControls()`, 'FOUND Add Score Button')}

  // var branchButtonElement = Cypress.$(element).find('button[data-testid="edit-dialog-modal-branch-button"]')
  // { helpers.Dump(`ValidateChatTurnControls()`, branchButtonElement)}

  // if (Cypress.$(element).find('button[data-testid="edit-dialog-modal-branch-button"]') != undefined) 
  // { helpers.ConLog(`ValidateChatTurnControls()`, 'FOUND Branch Button')}

  // if (Cypress.$(element).find('div[data-testid="chat-edit-add-input-button"]') != undefined) 
  // { helpers.ConLog(`ValidateChatTurnControls()`, 'FOUND Add Input Button')}
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

