/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

// data-testid="teach-session-admin-train-status" (Running, Completed, Failed)
export function ClickRefreshScoreButton()       { cy.Get('[data-testid="teach-session-admin-refresh-score-button"]').Click() }
export function SelectAnAction()                { cy.Get('[data-testid="actionscorer-buttonClickable"]').should("be.visible").Click() }
export function ClickAddActionButton()          { cy.Get('[data-testid="action-scorer-add-action-button"]').Click() }

export function ClickAction(expectedResponse)
{
  cy.Get('[data-testid="actionscorer-responseText"]').contains(expectedResponse)
    .parents('div.ms-DetailsRow-fields').find('[data-testid="actionscorer-buttonClickable"]')
    .Click()

  var expectedUtterance = expectedResponse.replace(/'/g, "’")
  cy.Get('[data-testid="web-chat-utterances"]').then(elements => {
    cy.wrap(elements[elements.length - 1]).within(e => {
      cy.get('div.format-markdown > p').should('have.text', expectedUtterance)
    })})
}

export function VerifyContainsEnabledAction(expectedResponse)
{
    cy.Get('[data-testid="actionscorer-responseText"]').contains(expectedResponse)
    .parents('div.ms-DetailsRow-fields').find('[data-testid="actionscorer-buttonClickable"]')
    .should('be.enabled')
}

export function VerifyContainsDisabledAction(expectedResponse)
{
    cy.Get('[data-testid="actionscorer-responseText"]').contains(expectedResponse)
    .parents('div.ms-DetailsRow-fields').find('[data-testid="actionscorer-buttonNoClick"]')
    .should('be.disabled')
}

export function VerifyEntityInMemory(entityName, entityValue)
{
  cy.Get('[data-testid="entity-memory-name"]').contains(entityName)
  cy.Get('[data-testid="entity-memory-value"]').contains(entityValue)
}

