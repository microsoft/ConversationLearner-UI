/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

const helpers = require('../../support/Helpers')

// data-testid="teach-session-admin-train-status" (Running, Completed, Failed)
export function ClickRefreshScoreButton()       { cy.get('[data-testid="teach-session-admin-refresh-score-button"]').Click() }
export function SelectAnAction()                { cy.get('[data-testid="action-scorer-button-clickable"]').should("be.visible").Click() }
export function ClickAddActionButton()          { cy.get('[data-testid="action-scorer-add-action-button"]').Click() }

export function ClickAction(expectedResponse, expectedIndexForActionPlacement)
{
  cy.get('[data-testid="action-scorer-text-response"]').ExactMatch(expectedResponse)
    .parents('div.ms-DetailsRow-fields').find('[data-testid="action-scorer-button-clickable"]')
    .Click()
  VerifyChatMessage(expectedResponse, expectedIndexForActionPlacement)
}

// To verify the last chat utterance leave expectedIndexOfMessage undefined
export function VerifyChatMessage(expectedMessage, expectedIndexOfMessage)
{
  var expectedUtterance = expectedMessage.replace(/'/g, "’")
  cy.get('[data-testid="web-chat-utterances"]').then(elements => {
    if(!expectedIndexOfMessage) expectedIndexOfMessage = elements.length - 1
    cy.wrap(elements[expectedIndexOfMessage]).within(e => {
      cy.get('div.format-markdown > p').should('have.text', expectedUtterance)
    })})
}

export function VerifyContainsEnabledAction(expectedResponse)
{
    cy.get('[data-testid="action-scorer-text-response"]').contains(expectedResponse)
    .parents('div.ms-DetailsRow-fields').find('[data-testid="action-scorer-button-clickable"]')
    .should('be.enabled')
}

export function VerifyContainsDisabledAction(expectedResponse)
{
    cy.get('[data-testid="action-scorer-text-response"]').contains(expectedResponse)
    .parents('div.ms-DetailsRow-fields').find('[data-testid="action-scorer-button-no-click"]')
    .should('be.disabled')
}

export function VerifyEntityInMemory(entityName, entityValue)
{
  cy.get('[data-testid="entity-memory-name"]').contains(entityName)
  cy.get('[data-testid="entity-memory-value"]').contains(entityValue)
}

