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

export function VerifyContainsEnabledEndSessionAction(expectedData) { VerifyEndSessionActionState(expectedData, 'action-scorer-button-clickable', false) }
export function VerifyContainsDisabledEndSessionAction(expectedData) { VerifyEndSessionActionState(expectedData, 'action-scorer-button-no-click', true) }
export function VerifyContainsSelectedEndSessionAction(expectedData) { VerifyEndSessionActionState(expectedData, 'action-scorer-button-selected', false) }

function VerifyEndSessionActionState(expectedData, selectButtonDataTestId, disabled) {
  const funcName = `VerifyEndSessionActionState(${expectedData}, ${selectButtonDataTestId}, ${disabled})`
  cy.WaitForStableDOM()
  
  // Originally we used straight Cypress code and chained all of these element search functions, and it all worked well,
  // but a change in the UI rendering caused the chained series to fail every once in a while. So by breaking them up
  // and putting them inside of a Cypress .should function, we get the retry on the entire chain instead of just the last
  // elements.
  cy.wrap(1).should(() =>{
    let elements = Cypress.$('[data-testid="action-scorer-session-response"]')
    if (elements.length == 0) { throw new Error('Found ZERO elements containing [data-testid="action-scorer-session-response"]')}
    
    elements = helpers.ExactMatch(elements, 'EndSession')

    elements = Cypress.$(elements).siblings('[data-testid="action-scorer-session-response-user"]')
    if (elements.length == 0) { throw new Error('Found ZERO sibling elements containing [data-testid="action-scorer-session-response-user"]')}

    helpers.ExactMatch(elements, expectedData)

    elements = Cypress.$(elements).parents('div.ms-DetailsRow-fields')
    if (elements.length == 0) { throw new Error('Found ZERO parent elements containing div.ms-DetailsRow-fields')}

    elements = Cypress.$(elements).find(`[data-testid="${selectButtonDataTestId}"]`)
    if (elements.length != 1) { throw new Error(`We were expecting only 1 but instead we found ${elements.length} child elements containing [data-testid="${selectButtonDataTestId}"]`)}
    
    if (elements[0].disabled != disabled) {
      helpers.ConLog(funcName, `Element that should be ${disabled ? 'Disabled' : 'Enabled'} --- ${elements[0].outerHTML}`)
      throw new Error(`Expected the Action Scorer Button to be ${disabled ? 'Disabled' : 'Enabled'}, but it was not.`)
    }
  })
}

export function VerifyNoEnabledSelectActionButtons() {
  cy.Enqueue(() => {

    const clickable = Cypress.$('[data-testid="action-scorer-button-clickable"]')
    const selected = Cypress.$('[data-testid="action-scorer-button-selected"]')
    const addActionButton = Cypress.$('[data-testid="action-scorer-add-action-button"][aria-disabled="false"]')
    const addApiButton = Cypress.$('[data-testid="action-scorer-add-apistub-button"][aria-disabled="false"]')

    if (clickable.length > 0) { helpers.ConLog('VerifyNoEnabledSelectActionButtons', clickable[0].outerHTML) }
    if (selected.length > 0) { helpers.ConLog('VerifyNoEnabledSelectActionButtons', selected[0].outerHTML) }
    if (addActionButton.length > 0) { helpers.ConLog('VerifyNoEnabledSelectActionButtons', addActionButton[0].outerHTML) }
    if (addApiButton.length > 0) { helpers.ConLog('VerifyNoEnabledSelectActionButtons', addApiButton[0].outerHTML) }

    const length = clickable.length + selected.length + addActionButton.length + addApiButton.length

    if (length > 0 ) {
      throw new Error(`We are expecting to find NO enabled Action Scorer buttons, instead we found ${length} of them. See log file for details.`)
    }
  })
}