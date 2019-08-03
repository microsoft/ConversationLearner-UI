/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

import * as actionTypeSelector from '../../support/components/ActionTypeSelector'
import * as helpers from '../../support/Helpers'

// data-testid="teach-session-admin-train-status" (Running, Completed, Failed)
export function ClickRefreshScoreButton() { cy.Get('[data-testid="teach-session-admin-refresh-score-button"]').Click() }
export function SelectAnAction() { cy.Get('[data-testid="action-scorer-button-clickable"]').should("be.visible").Click() }
export function ClickAddActionButton() { cy.Get('[data-testid="action-scorer-add-action-button"]').Click() }
export function VerifyMissingActionNotice() { cy.Get('.cl-font--warning').ExactMatch('MISSING ACTION') }

export function ClickTextAction(expectedResponse) { ClickActionButon('[data-testid="action-scorer-text-response"]', expectedResponse) }
export function ClickApiAction(apiName) { ClickActionButon('[data-testid="action-scorer-api-name"]', apiName) }
export function ClickEndSessionAction(expectedData) { ClickActionButon('[data-testid="action-scorer-session-response-user"]', expectedData) }

export function VerifyContainsEnabledAction(expectedResponse) { VerifyActionState('[data-testid="action-scorer-text-response"]', expectedResponse, '[data-testid="action-scorer-button-clickable"]', false) }
export function VerifyContainsDisabledAction(expectedResponse) { VerifyActionState('[data-testid="action-scorer-text-response"]', expectedResponse, '[data-testid="action-scorer-button-no-click"]', true) }

export function VerifyContainsEnabledEndSessionAction(expectedData) { VerifyActionState('[data-testid="action-scorer-session-response-user"]', expectedData, '[data-testid="action-scorer-button-clickable"]', false) }
export function VerifyContainsDisabledEndSessionAction(expectedData) { VerifyActionState('[data-testid="action-scorer-session-response-user"]', expectedData, '[data-testid="action-scorer-button-no-click"]', true) }
export function VerifyContainsSelectedEndSessionAction(expectedData) { VerifyActionState('[data-testid="action-scorer-session-response-user"]', expectedData, '[data-testid="action-scorer-button-selected"]', false) }


export function FindActionRowElements(selector, expectedData) {
  helpers.ConLog('FindActionRowElements', `selector: '${selector}' - expectedData: '${expectedData}'`)

  let elements = Cypress.$(selector)
  if (elements.length == 0) { return `Found ZERO elements using selector ${selector}` }

  elements = helpers.ExactMatch(elements, expectedData)
  if (elements.length == 0) { return `Found ZERO elements that exactly matches '${expectedData}'` }

  elements = Cypress.$(elements).parents('div.ms-DetailsRow-fields')
  if (elements.length == 0) { return 'Found ZERO parent elements containing div.ms-DetailsRow-fields' }

  return elements
}

export function ClickActionButon(selector, expectedData) {
  cy.WaitForStableDOM()
  cy.Enqueue(() => {
    const rowElementsOrErrorMessage = FindActionRowElements(selector, expectedData)
    if (typeof rowElementsOrErrorMessage == 'string') { throw new Error(rowElementsOrErrorMessage) }

    cy.wrap(rowElementsOrErrorMessage).find('[data-testid="action-scorer-button-clickable"]').Click() 
  })
}

export function VerifyActionState(rowSelector, expectedData, buttonSelector, disabled) {
  cy.wrap(1).should(() => {
    const rowElementsOrErrorMessage = FindActionRowElements(rowSelector, expectedData)
    if (typeof rowElementsOrErrorMessage == 'string') { throw new Error(rowElementsOrErrorMessage) }

    let elements = Cypress.$(rowElementsOrErrorMessage).find(buttonSelector)
    if (elements.length == 0) { throw new Error(`Found ZERO elements for buttonSelector: '${buttonSelector}' from rowSelector: '${rowSelector}' with expectedData: '${expectedData}'`) }
    
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

export function VerifyEntierScoreActionList(expectedScoreActions) {
  let errorMessages = []
  let rowIndex = 0
  let lastErrorRowIndex = -1

  function AcumulateErrors(message) {
    if (lastErrorRowIndex != rowIndex) {
      errorMessages.push(`Row ${rowIndex}`)
      lastErrorRowIndex = rowIndex
    }
    errorMessages.push(message)
  }

  cy.Enqueue(() => {
    let rowElements = Cypress.$('div.cl-dialog-admin-title:contains("Action")')
                             .parents('div.cl-dialog-admin__content')
                             .find('div[role="presentation"].ms-List-cell')
                             .find('div.ms-List-surface[role="presentation"]')
    
    expectedScoreActions.foreach(expectedScoreAction => {
      let expectedButtonTestId
      let score
      let selector

      switch (expectedScoreAction.state)
      {
        case stateEnum.selected:
          expectedButtonTestId = 'action-scorer-button-selected'
          score = '100.0%'
          break
        case stateEnum.qualified:
          expectedButtonTestId = 'action-scorer-button-clickable'
          score = '-'
          break
        case stateEnum.disqualified:
          expectedButtonTestId = 'action-scorer-button-no-click'
          score = 'Disqualified'
          break
      }
      
      let rowElements = FindActionRowElements(actionTypeSelector.GetSelector(expectedScoreAction.type), expectedScoreAction.expectedData)

      '[data-testid="action-scorer-text-response"]'
      '[data-testid="action-scorer-api-name"]'
      '[data-testid="action-scorer-session-response-user"]'
            
      let element = Cypress.$(rowElements[rowIndex]).find('[data-testid^="action-scorer-button-"]')
      if (element.length != 1) { 
        AcumulateErrors(`Expected to find 1 and only 1 data-testid starting with "action-scorer-button-", instead we found ${element.length}`)
      } else {
        let attr = element[0].attr('data-testid')
        if (attr != expectedButtonTestId) {
          AcumulateErrors(``)
        }
          // data-testid="action-scorer-button-selected"
        // data-testid="action-scorer-button-clickable"
        // data-testid="action-scorer-button-no-click"
      }
    })
  })

}

export const stateEnum = { selected: 1, qualified: 2, disqualified: 3 }
