/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

export function TypeYourMessage(trainmessage)         { cy.Get('input[class="wc-shellinput"]').type(`${trainmessage}{enter}`) }  // data-testid NOT possible
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
// This will make visible & enable more UI elements to interact with
export function SelectChatTurn(message, index = 0)
{
  cy.Get('[data-testid="web-chat-utterances"]').within(elements => {
    cy.get('div.format-markdown > p').ExactMatches(message).then(elements => {
    if (elements.length <= index) throw `Could not find '${message}' #${index} in chat utterances`
    cy.wrap(elements[index]).Click()
  })})
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

