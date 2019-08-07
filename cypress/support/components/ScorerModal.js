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

export function VerifyScoreActions(expectedScoreActions) {
  const funcName = 'VerifyScoreActions'
  let expectedScoreAction
  let errorMessages = []
  let rowIndex = 0

  function AccumulateErrors(message) {
    const fullMessage = `Row: ${rowIndex} - Response: ${expectedScoreAction.response} - ${message}`
    errorMessages.push(fullMessage)
    helpers.ConLog(funcName, fullMessage)
  }

  cy.Enqueue(() => {
    for (let i = 0; i < expectedScoreActions.length; i++) {
      expectedScoreAction = expectedScoreActions[i]
      let expectedButtonTestId
      let expectedScore

      switch (expectedScoreAction.state)
      {
        case stateEnum.selected:
          expectedButtonTestId = 'action-scorer-button-selected'
          expectedScore = '100.0%'
          break
        case stateEnum.qualified:
          expectedButtonTestId = 'action-scorer-button-clickable'
          expectedScore = '-'
          break
        case stateEnum.disqualified:
          expectedButtonTestId = 'action-scorer-button-no-click'
          expectedScore = 'Disqualified'
          break
      }
      rowIndex = undefined
      
      // This gets the row of the Score Action to validate and it also validates the response while doing so.
      const rowElementsOrErrorMessage = FindActionRowElements(actionTypeSelector.GetSelector(expectedScoreAction.type), expectedScoreAction.response)
      if (typeof rowElementsOrErrorMessage == 'string') {
        AccumulateErrors(rowElementsOrErrorMessage)
        continue
      }
      const rowElements = rowElementsOrErrorMessage
      helpers.ConLog(funcName, `Element found: ${rowElements[0].outerHTML}`)

      // We use the rowIndex only for the purpose of logging errors as a debugging aid.
      rowIndex = Cypress.$(rowElements[0]).parents('div[role="presentation"].ms-List-cell').attr('data-list-index')
      
      let elements

      // Verify the button.
      //let elements = Cypress.$(rowElements[0]).find('[data-testid^="action-scorer-button-"]')
      eval(`elements = Cypress.$(rowElements[0]).find('[data-testid^="action"]')`)
      if (elements.length != 1) { 
        AccumulateErrors(`Expected to find 1 and only 1 data-testid starting with "action-scorer-button-", instead we found ${elements.length}`)
      } else {
        let attr = elements.attr('data-testid')
        if (attr != expectedButtonTestId) {
          AccumulateErrors(`Expected to find data-testid="${expectedButtonTestId}" instead we found "${attr}"`)
        }
      }

      
      // Verify the score.
      elements = Cypress.$(rowElements[0]).find('[data-testid="action-scorer-score"]')
      if (elements.length != 1) { 
        AccumulateErrors(`Expected to find 1 and only 1 data-testid with "action-scorer-score", instead we found ${elements.length}`)
      } else {
        let score = helpers.TextContentWithoutNewlines(elements[0])
        if (score != expectedScore) {
          AccumulateErrors(`Expected to find a score with '${expectedScore}' but instead found this '${score}'`)
        }
      }

      
      // Verify the entities.
      elements = Cypress.$(rowElements[0]).find('[data-testid="action-scorer-entities"]').parent('div[role="listitem"]')
      if (elements.length != expectedScoreAction.entities.length) { 
        AccumulateErrors(`Expected to find ${expectedScoreAction.entities.length} entities but instead we found ${elements.length}`)
      }
      expectedScoreAction.entities.forEach(entity => {
        let entityElement = Cypress.$(elements).find(`[data-testid="action-scorer-entities"]:contains("${entity.name}")`)
        if (entityElement.length != 1) {
          AccumulateErrors(`Expected to find 1 and only 1 "action-scorer-entities" named "${entity.name}" instead we found ${entityElement.length}`)
        } else {
          let strikeOut = Cypress.$(entityElement).find(`del:contains("${entity.name}")`).length == 1 ? 'Strikeout' : ''
          let entityQualifierState

          if (entityElement.hasClass('cl-entity--match')) {
            entityQualifierState = entityQualifierStateEnum.green + strikeOut
          } else if (entityElement.hasClass('cl-entity--mismatch')) {
            entityQualifierState = entityQualifierStateEnum.red + strikeOut
          } else {
            AccumulateErrors(`Expected to find class with either 'cl-entity--match' or 'cl-entity--mismatch' but found neither. Element: ${entityElement[0].outerHTML}`)
          }

          if (entity.qualifierState != entityQualifierState) {
            AccumulateErrors(`Expected '${entity.name}' Entity Qualifier to have State: ${entity.qualifierState} but instead found: ${entityQualifierState}`)
          }
        }
      })

            
      // Verify the Wait flag.
      elements = Cypress.$(rowElements[0]).find('[data-testid="action-scorer-wait"]')
      if (elements.length != 1) { 
        AccumulateErrors(`Expected to find 1 and only 1 data-testid with "action-scorer-wait", instead we found ${elements.length}`)
      } else {
        let wait = elements.attr('data-icon-name') == 'CheckMark'
        if (wait != expectedScoreAction.wait) {
          AccumulateErrors(`Expected to find Wait: '${expectedScoreAction.wait}' but instead it was: '${wait}'`)
        }
      }


      // Verify the Action Type.
      elements = Cypress.$(rowElements[0]).find('[data-testid="action-details-action-type"]')
      if (elements.length != 1) { 
        AccumulateErrors(`Expected to find 1 and only 1 data-testid with "action-details-action-type", instead we found ${elements.length}`)
      } else {
        let actionType = helpers.TextContentWithoutNewlines(elements[0])
        if (actionType != expectedScoreAction.type) {
          AccumulateErrors(`Expected to find Action Type: '${expectedScoreAction.type}' but instead it was: '${actionType}'`)
        }
      }
    }
    
    if (errorMessages.length > 0) {throw new Error(`${errorMessages.length} Errors Detected in Action Scorer Grid- See log file for full list. - 1st Error: ${errorMessages[0]}`)}    
  })
}

export const stateEnum = { selected: 1, qualified: 2, disqualified: 3 }
//export const entityQualifierStateEnum = { unknown: 0, green: 1, greenStrikeout: 2, red: 3, redStrikeout: 4 }
export const entityQualifierStateEnum = { unknown: 'unknown', green: 'Green', greenStrikeout: 'GreenStrikeout', red: 'Red', redStrikeout: 'RedStrikeout' }