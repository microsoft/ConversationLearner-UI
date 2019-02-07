import { assertNever } from 'office-ui-fabric-react';

/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

const helpers = require('../../support/Helpers')

// data-testid="teach-session-admin-train-status" (Running, Completed, Failed)
export function ClickRefreshScoreButton() { cy.Get('[data-testid="teach-session-admin-refresh-score-button"]').Click() }
export function SelectAnAction() { cy.Get('[data-testid="action-scorer-button-clickable"]').should("be.visible").Click() }
export function ClickAddActionButton() { cy.Get('[data-testid="action-scorer-add-action-button"]').Click() }

export function ClickAction(expectedResponse, expectedIndexForActionPlacement) {
  cy.Get('[data-testid="action-scorer-text-response"]').ExactMatch(expectedResponse)
    .parents('div.ms-DetailsRow-fields').find('[data-testid="action-scorer-button-clickable"]')
    .Click()
  VerifyChatMessage(expectedResponse, expectedIndexForActionPlacement)
}

export function ClickEndSessionAction(expectedData, expectedIndexForActionPlacement) {
  cy.Get('[data-testid="action-scorer-session-response"]')
    .ExactMatch('EndSession')
    .siblings('[data-testid="action-scorer-session-response-user"]')
    .ExactMatch(expectedData)
    .parents('div.ms-DetailsRow-fields')
    .find('[data-testid="action-scorer-button-clickable"]')
    .Click()

  VerifyEndSessionChatMessage(expectedData, expectedIndexForActionPlacement)
}

// To verify the last chat utterance leave expectedIndexOfMessage undefined
export function VerifyChatMessage(expectedMessage, expectedIndexOfMessage) {
  var expectedUtterance = expectedMessage.replace(/'/g, "’")
  cy.Get('[data-testid="web-chat-utterances"]').then(elements => {
    if (!expectedIndexOfMessage) expectedIndexOfMessage = elements.length - 1
    cy.wrap(elements[expectedIndexOfMessage]).within(e => {
      cy.get('div.format-markdown > p').should('have.text', expectedUtterance)
    })
  })
}

export function VerifyEndSessionChatMessage(expectedData, expectedIndexOfMessage) {
  var expectedUtterance = 'EndSession: ' + expectedData.replace(/'/g, "’");
  cy.Get('[data-testid="web-chat-utterances"]').then(elements => {
    if (!expectedIndexOfMessage) expectedIndexOfMessage = elements.length - 1;
    let element = Cypress.$(elements[expectedIndexOfMessage]).find('div.wc-adaptive-card > div > div > p')[0];
    expect(element.innerText).to.equal(expectedUtterance);
  })
}

export function VerifyContainsEnabledAction(expectedResponse) {
  cy.Get('[data-testid="action-scorer-text-response"]').contains(expectedResponse)
    .parents('div.ms-DetailsRow-fields').find('[data-testid="action-scorer-button-clickable"]')
    .should('be.enabled')
}

export function VerifyContainsDisabledAction(expectedResponse) {
  cy.Get('[data-testid="action-scorer-text-response"]').contains(expectedResponse)
    .parents('div.ms-DetailsRow-fields').find('[data-testid="action-scorer-button-no-click"]')
    .should('be.disabled')
}

export function VerifyEntityInMemory(entityName, entityValue) {
  cy.Get('[data-testid="entity-memory-name"]').contains(entityName)
  cy.Get('[data-testid="entity-memory-value"]').contains(entityValue)
}

