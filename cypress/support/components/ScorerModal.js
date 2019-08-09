/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

import * as actionTypeSelector from '../../support/components/ActionTypeSelector'
import * as helpers from '../../support/Helpers'

export const stateEnum = { selected: 1, qualified: 2, disqualified: 3 }
export const entityQualifierStateEnum = { unknown: 'unknown', green: 'Green', greenStrikeout: 'GreenStrikeout', red: 'Red', redStrikeout: 'RedStrikeout' }

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

  function FindWithinAndVerify(baseElements, findCommand, verificationFunction, expectedElementCount = 1) {
    let elements = eval(`Cypress.$(baseElements).${findCommand}`)
    if (elements.length != expectedElementCount) { 
      AccumulateErrors(`Expected to find exactly ${expectedElementCount} element(s) instead we found ${elements.length} - Selection Command: ${findCommand}`)
    } else { 
      verificationFunction(elements) 
    }
    return elements
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
      let rowElement = rowElementsOrErrorMessage[0]
      helpers.ConLog(funcName, `Element found: ${rowElement.outerHTML}`)

      // We use the rowIndex only for the purpose of logging errors as a debugging aid.
      rowIndex = Cypress.$(rowElement).parents('div[role="presentation"].ms-List-cell').attr('data-list-index')
      
      
      // Verify the button.
      FindWithinAndVerify(rowElement, `find('[data-testid^="action-scorer-button-"]')`, elements => {
        let attr = elements.attr('data-testid')
        if (attr != expectedButtonTestId) {
          AccumulateErrors(`Expected to find data-testid="${expectedButtonTestId}" instead we found "${attr}"`)
        }
      })

      
      // Verify the score.
      FindWithinAndVerify(rowElement, `find('[data-testid="action-scorer-score"]')`, elements => {
        let score = helpers.TextContentWithoutNewlines(elements[0])
        if (score != expectedScore) {
          AccumulateErrors(`Expected to find a score with '${expectedScore}' but instead found this '${score}'`)
        }
      })

      
      // Verify the entities.
      FindWithinAndVerify(rowElement, `find('[data-testid="action-scorer-entities"]').parent('div[role="listitem"]')`, elements => {
        expectedScoreAction.entities.forEach(entity => {
          FindWithinAndVerify(elements, `find('[data-testid="action-scorer-entities"]:contains("${entity.name}")')`, entityElement => {
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
          })
        })
      }, expectedScoreAction.entities.length)

      
      // Verify the Wait flag.
      FindWithinAndVerify(rowElement, `find('[data-testid="action-scorer-wait"]')`, elements => {
        let wait = elements.attr('data-icon-name') == 'CheckMark'
        if (wait != expectedScoreAction.wait) {
          AccumulateErrors(`Expected to find Wait: '${expectedScoreAction.wait}' but instead it was: '${wait}'`)
        }
      })


      // Verify the Action Type.
      FindWithinAndVerify(rowElement, `find('[data-testid="action-details-action-type"]')`, elements => {
        let actionType = helpers.TextContentWithoutNewlines(elements[0])
        if (actionType != expectedScoreAction.type) {
          AccumulateErrors(`Expected to find Action Type: '${expectedScoreAction.type}' but instead it was: '${actionType}'`)
        }
      })
    }
    
    if (errorMessages.length > 0) {throw new Error(`${errorMessages.length} Errors Detected in Action Scorer Grid - See log file for full list. --- 1st Error: ${errorMessages[0]}`)}    
  })
}

export function GenerateScoreActionsDataFromGrid() {
  const funcName = 'GenerateScoreActionsDataFromGrid'
  let generatedData = ''

  function AccumulateOutput(line) {
    generatedData += `  ${line}\r`
    helpers.ConLog(funcName, line)
  }

  function FindWithinAndCapture(baseElements, findCommand, captureFunction, oneElementExpected = true) {
    let elements = eval(`Cypress.$(baseElements).${findCommand}`)
    if (oneElementExpected && elements.length != 1) { 
      AccumulateOutput(`Expected to find exactly 1 element instead we found ${elements.length} - Selection Command: ${findCommand}`)
    } else { 
      captureFunction(elements) 
    }
    return elements
  }

  cy.Enqueue(() => {
    const rowsElements = Cypress.$('div.cl-dialog-admin-title:contains("Action")').next('div').find('div[role="presentation"].ms-List-cell')
    for (let rowIndex = 0; rowIndex < rowsElements.length; rowIndex++) {
      AccumulateOutput(`{`)

      let rowElement = Cypress.$(rowsElements[rowIndex]).find('div.ms-DetailsRow-fields')[0]
      helpers.ConLog(funcName, `Row #: ${rowIndex} - Element found: ${rowElement.outerHTML}`)

      
      // Response
      FindWithinAndCapture(rowElement, `find('[data-testid="action-scorer-text-response"], [data-testid="action-scorer-api"], [data-testid="action-scorer-session-response-user"], [data-testid="action-scorer-card"], [data-testid="action-scorer-action-set-entity"]')`, elements => {
        let responseData = helpers.TextContentWithoutNewlines(elements[0])
        AccumulateOutput(`  response: '${responseData}',`)
      })

      
      // Action Type.
      FindWithinAndCapture(rowElement, `find('[data-testid="action-details-action-type"]')`, elements => {
        let actionType = helpers.TextContentWithoutNewlines(elements[0])
        AccumulateOutput(`  type: '${actionType}',`)
      })

      
      // Get the state from the score.
      FindWithinAndCapture(rowElement, `find('[data-testid="action-scorer-score"]')`, elements => {
        const scoreToStateTranslation = [
          {score: '100.0%', enum: 'scorerModal.stateEnum.selected'}, 
          {score: '-', enum: 'scorerModal.stateEnum.qualified'}, 
          {score: 'Disqualified', enum: 'scorerModal.stateEnum.disqualified'},
        ]

        let score = helpers.TextContentWithoutNewlines(elements[0])
        let state = scoreToStateTranslation.find(pair => pair.score == score).enum
        AccumulateOutput(`  state: ${state},`)
      })

      
      // Get the entities and their display attributes.
      let entities
      FindWithinAndCapture(rowElement, `find('[data-testid="action-scorer-entities"]').parent('div[role="listitem"]')`, elements => {
        if (elements.length == 0) { entities = '  entities: [],' }
        else {
          entities = '  entities: ['
          for (let i = 0; i < elements.length; i++) {
            const name = helpers.TextContentWithoutNewlines(elements[i])

            const strikeOut = Cypress.$(elements[i]).find(`del:contains("${name}")`).length == 1 ? 'Strikeout' : ''
            let entityQualifierState
            
            const entityElement = Cypress.$(elements[i]).find('[data-testid="action-scorer-entities"]')
            if (entityElement.hasClass('cl-entity--match')) {
              entityQualifierState = 'scorerModal.entityQualifierStateEnum.green' + strikeOut
            } else if (entityElement.hasClass('cl-entity--mismatch')) {
              entityQualifierState = 'scorerModal.entityQualifierStateEnum.red' + strikeOut
            } else {
              entityQualifierState = `ERROR - Expected to find class with either 'cl-entity--match' or 'cl-entity--mismatch' but found neither. Element: ${entityElement[0].outerHTML}`
            }
            
            entities += `\n      { name: '${name}', qualifierState: ${entityQualifierState} },`
          }
          entities += `\n    ],`
        }
        AccumulateOutput(entities)
      }, false)

      
      // Get the Wait flag.
      FindWithinAndCapture(rowElement, `find('[data-testid="action-scorer-wait"]')`, elements => {
        const wait = elements.attr('data-icon-name') == 'CheckMark'
        AccumulateOutput(`  wait: ${wait},`)
      })
      
      AccumulateOutput(`},`)
    }
    
    helpers.ConLog(funcName, `Action Scorer Grid Data:\r[\r${generatedData}]`)
  })
}
