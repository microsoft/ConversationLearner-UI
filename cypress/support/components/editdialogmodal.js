/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
export function typeYourMessage(trainmessage)         { cy.Get('input[class="wc-shellinput"]').type(`${trainmessage}{enter}`) }  // data-testid NOT possible
export function clickSetInitialStateButton()          { cy.Get('[data-testid="teach-session-set-initial-state"]').Click() }
export function clickScoreActionsButton()             { cy.Get('[data-testid="entity-extractor-score-actions-button"]').Click() }
export function clickSaveButton()                     { cy.Get('[data-testid="teach-session-footer-button-save"]').Click() }
export function clickAbandonButton()                  { cy.Get('[data-testid="teach-session-footer-button-abandon"]').Click() }
export function verifyEntityMemoryIsEmpty()           { cy.Get('[data-testid="memory-table-empty"]').contains('Empty') }
export function entitySearch()                        { cy.Get('[data-testid="entity-picker-entity-search"]') }
export function alternativeInputText()                { cy.Get('[data-testid="entity-extractor-alternative-input-text"]') }
export function clickAddAlternativeInputButton()      { cy.Get('[data-testid="entity-extractor-add-alternative-input-button"]').Click() }
export function clickEntityDetectionToken(tokenValue) { cy.Get('[data-testid="text-entity-value"]').contains(tokenValue).Click() }

export function verifyDetectedEntity(entityName, entityValue)
{
  cy.Get('[data-testid="button-entity-indicatorName"]').contains(entityName)
  cy.Get('[data-testid="text-entity-value"]').contains(entityValue)
}


export function highlightWord(word) {
  cy.get('span[class="cl-token-node"]')
    .trigger('keydown')
    .click(10, 10)
    .wait(1000)

  cy.get('.custom-toolbar.custom-toolbar--visible')
    .invoke('show')
    .wait()
}

export function verifyTokenNodeExists() {
  cy.get('.cl-token-node')
    .should('exists')
}

