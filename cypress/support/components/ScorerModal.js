/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

const helpers = require('../../support/Helpers')

// data-testid="teach-session-admin-train-status" (Running, Completed, Failed)
export function ClickRefreshScoreButton()       { cy.Get('[data-testid="teach-session-admin-refresh-score-button"]').Click() }
export function SelectAnAction()                { cy.Get('[data-testid="action-scorer-button-clickable"]').should("be.visible").Click() }
export function ClickAddActionButton()          { cy.Get('[data-testid="action-scorer-add-action-button"]').Click() }

export function ClickAction(expectedResponse)
{
  cy.Get('[data-testid="action-scorer-text-response"]').ExactMatch(expectedResponse)
    .parents('div.ms-DetailsRow-fields').find('[data-testid="action-scorer-button-clickable"]')
    .Click()
  VerifyLastChatMessage(expectedResponse)
}

// Currently this function is known to work ONLY for:
// TEXT and END_SESSION Actions.
export function VerifyLastChatMessage(expectedMessage)
{
  var expectedUtterance = expectedMessage.replace(/'/g, "’")
  cy.Get('[data-testid="web-chat-utterances"]').then(elements => 
  {
    var element = elements[elements.length - 1]
    if (!Cypress.$(element).find('div.wc-adaptive-card').length) {
      expect(helpers.RemoveMarkup(Cypress.$(element).find('p').text())).to.equal(expectedUtterance)
    } else {
      if (expectedUtterance && (Cypress.$(element).html().indexOf(helpers.RemoveMarkup(expectedUtterance)) < 0)) {
        throw new Error('Adaptive card rendered incorrectly!!')
      }
    }
  })
}

export function VerifyContainsEnabledAction(expectedResponse)
{
    cy.Get('[data-testid="action-scorer-text-response"]').contains(expectedResponse)
    .parents('div.ms-DetailsRow-fields').find('[data-testid="action-scorer-button-clickable"]')
    .should('be.enabled')
}

export function VerifyContainsDisabledAction(expectedResponse)
{
    cy.Get('[data-testid="action-scorer-text-response"]').contains(expectedResponse)
    .parents('div.ms-DetailsRow-fields').find('[data-testid="action-scorer-button-no-click"]')
    .should('be.disabled')
}

export function VerifyEntityInMemory(entityName, entityValue)
{
  cy.Get('[data-testid="entity-memory-name"]').contains(entityName)
  cy.Get('[data-testid="entity-memory-value"]').contains(entityValue)
}

