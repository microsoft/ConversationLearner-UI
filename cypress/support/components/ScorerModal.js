/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

import * as helpers from '../../support/Helpers'

// data-testid="teach-session-admin-train-status" (Running, Completed, Failed)
export function ClickRefreshScoreButton() { cy.Get('[data-testid="teach-session-admin-refresh-score-button"]').Click() }
export function SelectAnAction() { cy.Get('[data-testid="action-scorer-button-clickable"]').should("be.visible").Click() }
export function ClickAddActionButton() { cy.Get('[data-testid="action-scorer-add-action-button"]').Click() }
export function VerifyMissingActionNotice() { cy.Get('.cl-font--warning').ExactMatch('MISSING ACTION') }

export function ClickTextAction(expectedResponse) {
  cy.Get('[data-testid="action-scorer-text-response"]').ExactMatch(expectedResponse)
    .parents('div.ms-DetailsRow-fields').find('[data-testid="action-scorer-button-clickable"]')
    .Click()
}

export function ClickApiAction(apiName, expectedResponse, expectedIndexForActionPlacement) {
  cy.Get('[data-testid="action-scorer-api-name"]').ExactMatch(apiName)
    .parents('div.ms-DetailsRow-fields').find('[data-testid="action-scorer-button-clickable"]')
    .Click()
}

export function ClickEndSessionAction(expectedData) {
  cy.Get('[data-testid="action-scorer-session-response"]')
    .ExactMatch('EndSession')
    .siblings('[data-testid="action-scorer-session-response-user"]')
    .ExactMatch(expectedData)
    .parents('div.ms-DetailsRow-fields')
    .find('[data-testid="action-scorer-button-clickable"]')
    .Click()
}

// To verify the last chat utterance leave expectedIndexOfMessage undefined
export function VerifyTextChatMessage(expectedMessage, expectedIndexOfMessage) {
  cy.Get('[data-testid="web-chat-utterances"]').then(allChatElements => {
    if (!expectedIndexOfMessage) expectedIndexOfMessage = allChatElements.length - 1
    let elements = Cypress.$(allChatElements[expectedIndexOfMessage]).find('div.format-markdown > p')
    if (elements.length == 0) {
      throw new Error(`Did not find expected Text Chat Message '${expectedMessage}'`)
    }
    
    const expectedUtterance = expectedMessage.replace(/'/g, "’")
    let textContentWithoutNewlines = helpers.TextContentWithoutNewlines(elements[0])
    helpers.ConLog('VerifyTextChatMessage', textContentWithoutNewlines)

    if (helpers.TextContentWithoutNewlines(elements[0]) !== expectedUtterance) {
      throw new Error(`Expected to find '${expectedUtterance}' in the text chat pane, instead we found '${textContentWithoutNewlines}'`)
    }
  })
}

// To verify the last chat utterance leave expectedIndexOfMessage undefined
// Leave expectedMessage temporarily undefined so that you can copy the text
// output from the screen or log to paste into your code.
export function VerifyCardChatMessage(expectedCardTitle, expectedCardText, expectedIndexOfMessage) {
  cy.Get('[data-testid="web-chat-utterances"]').then(allChatElements => {
    if (!expectedIndexOfMessage) expectedIndexOfMessage = allChatElements.length - 1
    let elements = Cypress.$(allChatElements[expectedIndexOfMessage]).find(`div.format-markdown > p:contains('${expectedCardTitle}')`).parent()
    if (elements.length == 0) {
      throw new Error(`Did not find expected '${expectedCardTitle}' card with '${expectedCardText}'`)
    }
    elements = Cypress.$(elements[0]).next('div.wc-list').find('div.wc-adaptive-card > div.ac-container > div.ac-container > div > p')
    if (elements.length == 0) {
      throw new Error(`Did not find expected content element for API Call card that should contain '${expectedCardText}'`)
    }
    
    // Log the contents of the API Call card so that we can copy the exact string into the .spec.js file.
    let textContentWithoutNewlines = helpers.TextContentWithoutNewlines(elements[0])
    helpers.ConLog('VerifyCardChatMessage', textContentWithoutNewlines)
    
    if (textContentWithoutNewlines !== expectedCardText) {
      throw new Error(`Expected to find '${expectedCardTitle}' card with '${expectedCardText}', instead we found '${textContentWithoutNewlines}'`)
    }
  })
}

export function VerifyEndSessionChatMessage(expectedData, expectedIndexOfMessage) {
  const expectedUtterance = 'EndSession: ' + expectedData.replace(/'/g, "’")
  cy.Get('[data-testid="web-chat-utterances"]').then(elements => {
    if (!expectedIndexOfMessage) expectedIndexOfMessage = elements.length - 1
    const element = Cypress.$(elements[expectedIndexOfMessage]).find('div.wc-adaptive-card > div > div > p')[0]
    expect(helpers.TextContentWithoutNewlines(element)).to.equal(expectedUtterance)
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

export function VerifyContainsEnabledEndSessionAction(expectedData) { VerifyEndSessionActionState(expectedData, 'action-scorer-button-clickable', 'be.enabled') }
export function VerifyContainsDisabledEndSessionAction(expectedData) { VerifyEndSessionActionState(expectedData, 'action-scorer-button-no-click', 'be.disabled') }
export function VerifyContainsSelectedEndSessionAction(expectedData) { VerifyEndSessionActionState(expectedData, 'action-scorer-button-selected', 'be.enabled') }

function VerifyEndSessionActionState(expectedData, selectButtonDataTestId, stateToVerify) {
  cy.Get('[data-testid="action-scorer-session-response"]')
    .ExactMatch('EndSession')
    .siblings('[data-testid="action-scorer-session-response-user"]')
    .ExactMatch(expectedData)
    .parents('div.ms-DetailsRow-fields')
    .find(`[data-testid="${selectButtonDataTestId}"]`)
    .should(stateToVerify)
}