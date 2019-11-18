/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

import * as actionTypeSelector from '../../support/components/ActionTypeSelector'
import * as helpers from '../../support/Helpers'

const SelectorTextResponse = '[data-testid="action-scorer-text-response"]'
const SelectorApiName = '[data-testid="action-scorer-api-name"]'
const SelectorApiResponse = '[data-testid="action-scorer-api"]'
const SelectorCardName = '[data-testid="action-scorer-card-name"]'
const SelectorCardResponse = '[data-testid="action-scorer-card"]'
const SelectorEndSessionResponse = '[data-testid="action-scorer-session-response-user"]'

export const stateEnum = { selected: 1, qualified: 2, disqualified: 3 }
export const entityQualifierStateEnum = { unknown: 'unknown', green: 'Green', greenStrikeout: 'GreenStrikeout', red: 'Red', redStrikeout: 'RedStrikeout' }

// data-testid="teach-session-admin-train-status" (Running, Completed, Failed)
export function ClickRefreshScoreButton() { cy.Get('[data-testid="teach-session-admin-refresh-score-button"]').Click() }
export function ClickAddActionButton() { cy.Get('[data-testid="action-scorer-add-action-button"]').Click() }
export function VerifyMissingActionNotice() { cy.Get('.cl-font--warning').ExactMatch('MISSING ACTION') }

export function ClickTextAction(expectedResponse) { ClickActionButon(SelectorTextResponse, expectedResponse) }
export function ClickApiAction(apiName) { ClickActionButon(SelectorApiName, apiName) }
export function ClickEndSessionAction(expectedData) { ClickActionButon(SelectorEndSessionResponse, expectedData) }
export function ClickSetEntityAction(enumValue) { ClickActionButon('[data-testid="action-scorer-action-set-entity"]', enumValue) }


export function VerifyContainsEnabledAction(expectedResponse) { VerifyActionState(SelectorTextResponse, expectedResponse, '[data-testid="action-scorer-button-clickable"]', false) }
export function VerifyContainsDisabledAction(expectedResponse) { VerifyActionState(SelectorTextResponse, expectedResponse, '[data-testid="action-scorer-button-no-click"]', true) }

export function VerifyContainsEnabledEndSessionAction(expectedData) { VerifyActionState(SelectorEndSessionResponse, expectedData, '[data-testid="action-scorer-button-clickable"]', false) }
export function VerifyContainsDisabledEndSessionAction(expectedData) { VerifyActionState(SelectorEndSessionResponse, expectedData, '[data-testid="action-scorer-button-no-click"]', true) }
export function VerifyContainsSelectedEndSessionAction(expectedData) { VerifyActionState(SelectorEndSessionResponse, expectedData, '[data-testid="action-scorer-button-selected"]', false) }

export function ClickTextEntityValueNameToggleButon(expectedResponse) { ClickEntityValueNameToggleButon(SelectorTextResponse, expectedResponse) }
export function ClickApiEntityValueNameToggleButon(apiName) { ClickEntityValueNameToggleButon(SelectorApiName, apiName) }
export function ClickCardEntityValueNameToggleButon(cardName) { ClickEntityValueNameToggleButon(SelectorCardName, cardName) }
export function ClickEndSessionEntityValueNameToggleButon(expectedData) { ClickEntityValueNameToggleButon(SelectorEndSessionResponse, expectedData) }

export function VerifyContainsTextAction(expectedResponse) { VerifyActionExists(SelectorTextResponse, expectedResponse) }
export function VerifyContainsApiAction(apiResponse) { VerifyActionExists(SelectorApiResponse, apiResponse) }
export function VerifyContainsCardAction(cardResponse) { VerifyActionExists(SelectorCardResponse, cardResponse) }
export function VerifyContainsEndSessionAction(expectedData) { VerifyActionExists(SelectorEndSessionResponse, expectedData) }


// To VALIDATE All of the Data in the Score Actions Grid use this class. 
// Here is the development process:
// 1) Write your test suite and use this class for the verification of the Score Actions Pane.
//    See existing test cases that already use this class as an example to follow.
//
// 2) Generate and persist the data by running the test suite with the following environment variable:
//      set CYPRESS_GENERATE_SCORE_ACTIONS_DATA=pause
//    OR...
//      set CYPRESS_GENERATE_SCORE_ACTIONS_DATA=true|anything
//    Doing this will generate a file in the "cypress/fixtures/scoreActions" folder that will be used in #4
//    If the value is "pause", then the test will pause at each data collection point.
//
// 3) Manually verify the data in each Score Actions grid for each chat turn that the test suite will verify.
//
// 4) Clear out that environment variable and run the tests as usual. They will grab the generated test data
//    and use it during validations that use the VerifyScoreActionsList() function.

export class GeneratedData {
  constructor(dataFileName) {
    this.dataFileName = dataFileName
    this.generateScoreActionsData = Cypress.env('GENERATE_SCORE_ACTIONS_DATA')

    if (this.generateScoreActionsData) {
      this.data = []
    } else {
      context('Load Generated Verification Data', () => {
        it('Read the generated Score Actions data from a JSON file', () => {
          cy.readFile(`cypress/fixtures/scoreActions/${this.dataFileName}`).then(scoreActionsData => this.data = scoreActionsData)
        })
        this.index = 0
      })
    }
  }

  // In many cases the score deviates significantly and that is not considered an error. But, in some cases, with a well
  // trained model, these values should deviate only slightly, for those pass in acceptableScoreDeviation as the 
  // percentage points that we can allow the score to deviate and still be acceptable.
  VerifyScoreActionsList(acceptableScoreDeviation = 70) {
    if (this.generateScoreActionsData) {
      it('GENERATE the Score Actions data', () => {
        if (this.generateScoreActionsData == 'pause') { cy.pause() }
        else { cy.wait(2000) }
        cy.WaitForStableDOM().then(() => { this.data.push(GenerateScoreActionsDataFromGrid()) })
      })
    } else {
      it('Verify the Score Actions data', () => {
        cy.WaitForStableDOM().then(() => VerifyScoreActions(this.data[this.index++], acceptableScoreDeviation))
      })
    }
  }

  VerifyScoreActionsListUnwrapped(acceptableScoreDeviation = 70) {
    if (this.generateScoreActionsData) {
      if (this.generateScoreActionsData == 'pause') { cy.pause() }
      else { cy.wait(2000) }
      cy.WaitForStableDOM().then(() => { this.data.push(GenerateScoreActionsDataFromGrid()) })
    } else {
      cy.WaitForStableDOM().then(() => (this.data[this.index++], acceptableScoreDeviation))
    }
  }

  SaveGeneratedData() {
    if (this.generateScoreActionsData) {
      context('SAVE GENERATED VERIFICATION DATA', () => {
        it('Write the generated Score Actions data to a JSON file', () => {
          cy.writeFile(`cypress/fixtures/scoreActions/${this.dataFileName}`, this.data)
        })
      })
    }    
  }
}


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

export function VerifyActionExists(selector, expectedData) {
  cy.WaitForStableDOM()
  cy.Enqueue(() => {
    const rowElementsOrErrorMessage = FindActionRowElements(selector, expectedData)
    if (typeof rowElementsOrErrorMessage == 'string') { throw new Error(rowElementsOrErrorMessage) }
  })
}

export function ClickActionButon(selector, expectedData) {
  cy.WaitForStableDOM()
  cy.Enqueue(() => {
    const rowElementsOrErrorMessage = FindActionRowElements(selector, expectedData)
    if (typeof rowElementsOrErrorMessage == 'string') { throw new Error(rowElementsOrErrorMessage) }

    cy.wrap(rowElementsOrErrorMessage).find('[data-testid="action-scorer-button-clickable"]').Click() 
  })
}

export function ClickEntityValueNameToggleButon(selector, expectedData) {
  cy.WaitForStableDOM()
  cy.Enqueue(() => {
    const rowElementsOrErrorMessage = FindActionRowElements(selector, expectedData)
    if (typeof rowElementsOrErrorMessage == 'string') { throw new Error(rowElementsOrErrorMessage) }

    cy.wrap(rowElementsOrErrorMessage).find('[data-testid="action-scorer-entity-toggle"]').Click() 
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

// In many cases the score deviates significantly and that is not considered an error. But for those that should 
// remain within a defined range, pass in acceptableScoreDeviation as the points that we can allow the score to 
// deviate and still be acceptable.
export function VerifyScoreActions(expectedScoreActions, acceptableScoreDeviation = 70) {
  const funcName = 'VerifyScoreActions'
  let expectedScoreAction
  let errorMessages = []
  let rowIndex = 0

  function AccumulateErrors(message) {
    const fullMessage = `ERROR - Row: ${rowIndex} - Response: ${expectedScoreAction.response} - ${message}`
    errorMessages.push(fullMessage)
    helpers.ConLog(funcName, fullMessage)
  }

  function FindWithinAndVerify(baseElements, findCommand, verificationFunction, expectedElementCount = 1) {
    const elements = eval(`Cypress.$(baseElements).${findCommand}`)
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
      rowIndex = undefined
      
      // This gets the row of the Score Action to validate and it also validates the response while doing so.
      const rowElementsOrErrorMessage = FindActionRowElements(actionTypeSelector.GetSelector(expectedScoreAction.type), expectedScoreAction.response)
      if (typeof rowElementsOrErrorMessage == 'string') {
        AccumulateErrors(rowElementsOrErrorMessage)
        continue
      }
      const rowElement = rowElementsOrErrorMessage[0]
      helpers.ConLog(funcName, `Element found: ${rowElement.outerHTML}`)

      // We use the rowIndex only for the purpose of logging errors as a debugging aid.
      rowIndex = Cypress.$(rowElement).parents('div[role="presentation"].ms-List-cell').attr('data-list-index')
      
      
      // Verify the button.
      FindWithinAndVerify(rowElement, `find('[data-testid^="action-scorer-button-"]')`, elements => {
        const attr = elements.attr('data-testid')
        if (attr != expectedScoreAction.buttonTestId) {
          AccumulateErrors(`Expected to find data-testid="${expectedScoreAction.buttonTestId}" instead we found "${attr}"`)
        }
      })

      // Verify Entity Value/Name Toggle Control.
      const elements = Cypress.$(rowElement).find('[data-testid="action-scorer-entity-toggle"]')
      if ((elements.length == 1) !== expectedScoreAction.hasEntityValueNameToggle) {
        AccumulateErrors(`Expected to find the Entity Value/Name Toggle switch to be ${expectedScoreAction.hasEntityValueNameToggle? 'present' : 'absent'}`)
      }
 
      // Verify the score.
      FindWithinAndVerify(rowElement, `find('[data-testid="action-scorer-score"]')`, elements => {
        const score = helpers.TextContentWithoutNewlines(elements[0])
        const acceptableDeviation = acceptableScoreDeviation * 10

        if (score.endsWith('%') && expectedScoreAction.score.endsWith('%')) {
          const actualScore = +score.replace(/(\.|%)/gm, '')
          const expectedScore = +expectedScoreAction.score.replace(/(\.|%)/gm, '')
          helpers.ConLog(funcName, `actualScore: ${actualScore} - expectedScore: ${expectedScore}`)
          if (actualScore < expectedScore - acceptableDeviation || actualScore > expectedScore + acceptableDeviation) {
            AccumulateErrors(`Expected to find a score within ${acceptableScoreDeviation} points of '${expectedScoreAction.score}' but instead found '${score}'`)
          }
          return
        }

        if (score != expectedScoreAction.score) {
          AccumulateErrors(`Expected to find a score with '${expectedScoreAction.score}' but instead found '${score}'`)
        }
      })

      
      // Verify the entities.
      FindWithinAndVerify(rowElement, `find('[data-testid="action-scorer-entities"]').parent('div[role="listitem"]')`, elements => {
        expectedScoreAction.entities.forEach(entity => {
          FindWithinAndVerify(elements, `find('[data-testid="action-scorer-entities"]:contains("${entity.name}")')`, entityElement => {
            const strikeOut = Cypress.$(entityElement).find(`del:contains("${entity.name}")`).length == 1 ? 'Strikeout' : ''
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
        const wait = elements.attr('data-icon-name') == 'CheckMark'
        if (wait != expectedScoreAction.wait) {
          AccumulateErrors(`Expected to find Wait: '${expectedScoreAction.wait}' but instead it was: '${wait}'`)
        }
      })


      // Verify the Action Type.
      FindWithinAndVerify(rowElement, `find('[data-testid="action-details-action-type"]')`, elements => {
        const actionType = helpers.TextContentWithoutNewlines(elements[0])
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
  let generatedData = []
  let rowData

  function AccumulateErrors(message) {
    rowData.errors += `${message}\r`
    helpers.ConLog(funcName, message)
  }

  function FindWithinAndCapture(baseElements, findCommand, captureFunction, oneElementExpected = true) {
    const elements = eval(`Cypress.$(baseElements).${findCommand}`)
    if (oneElementExpected && elements.length != 1) { 
      AccumulateErrors(`Expected to find exactly 1 element instead we found ${elements.length} - Selection Command: ${findCommand}`)
    } else { 
      captureFunction(elements) 
    }
    return elements
  }

  // Get all the row DOM elements in the Score Actions pane.
  const rowsElements = Cypress.$('div.cl-dialog-admin-title:contains("Action")').next('div').find('div[role="presentation"].ms-List-cell')

  for (let rowIndex = 0; rowIndex < rowsElements.length; rowIndex++) {
    rowData = {}

    const rowElement = Cypress.$(rowsElements[rowIndex]).find('div.ms-DetailsRow-fields')[0]
    helpers.ConLog(funcName, `Row #: ${rowIndex} - Element found: ${rowElement.outerHTML}`)

    // The selection button.
    FindWithinAndCapture(rowElement, `find('[data-testid^="action-scorer-button-"]')`, elements => {
      const attr = elements.attr('data-testid')
      rowData.buttonTestId = attr
    })


    // Response
    FindWithinAndCapture(rowElement, `find('[data-testid="action-scorer-text-response"], [data-testid="action-scorer-api"], [data-testid="action-scorer-session-response-user"], [data-testid="action-scorer-card"], [data-testid="action-scorer-action-set-entity"]')`, elements => {
      const responseData = helpers.TextContentWithoutNewlines(elements[0])
      rowData.response = responseData
    })

    
    // Entity Value/Name Toggle Control.
    const elements = Cypress.$(rowElement).find('[data-testid="action-scorer-entity-toggle"]')
    rowData.hasEntityValueNameToggle = elements.length == 1

    
    // Action Type.
    FindWithinAndCapture(rowElement, `find('[data-testid="action-details-action-type"]')`, elements => {
      const actionType = helpers.TextContentWithoutNewlines(elements[0])
      rowData.type = actionType
    })

    
    // Get the score.
    FindWithinAndCapture(rowElement, `find('[data-testid="action-scorer-score"]')`, elements => {
      const score = helpers.TextContentWithoutNewlines(elements[0])
      rowData.score = score
    })

    
    // Get the entities and their display attributes.
    let entities = []
    FindWithinAndCapture(rowElement, `find('[data-testid="action-scorer-entities"]').parent('div[role="listitem"]')`, elements => {
      if (elements.length > 0) {
        for (let i = 0; i < elements.length; i++) {
          const name = helpers.TextContentWithoutNewlines(elements[i])

          const strikeOut = Cypress.$(elements[i]).find(`del:contains("${name}")`).length == 1 ? 'Strikeout' : ''
          let entityQualifierState
          
          const entityElement = Cypress.$(elements[i]).find('[data-testid="action-scorer-entities"]')
          if (entityElement.hasClass('cl-entity--match')) {
            entityQualifierState = entityQualifierStateEnum.green + strikeOut
          } else if (entityElement.hasClass('cl-entity--mismatch')) {
            entityQualifierState = entityQualifierStateEnum.red + strikeOut
          } else {
            entityQualifierState = `ERROR - Expected to find class with either 'cl-entity--match' or 'cl-entity--mismatch' but found neither. Element: ${entityElement[0].outerHTML}`
            AccumulateErrors(entityQualifierState)
          }
          
          entities.push({ name: name, qualifierState: entityQualifierState })
        }
      }
      rowData.entities = entities
    }, false)

    
    // Get the Wait flag.
    FindWithinAndCapture(rowElement, `find('[data-testid="action-scorer-wait"]')`, elements => {
      const wait = elements.attr('data-icon-name') == 'CheckMark'
      rowData.wait = wait
    })
    
    generatedData.push(rowData)
  }
  
  return generatedData
}

// To use this function 1st select the chat message whose text you want to capture.
// This is intended to capture text, with $ entity names, just as it will be seen as "LastResponse" in the TD Grid.
// For example it would capture: "Hello $name" rather than "Hello David"
// If there are no entities specified for the action, it still returns the text of the action.
export function GetTextWithEntityNamesFromSelectedAction() {
  const elements = FindActionRowElements('[data-testid="action-scorer-button-selected"]', 'SelectedSelected')
  if (typeof elements == 'string') { 
    throw new Error(elements) 
  }

  const toggleElements = Cypress.$(elements).find('[data-testid="action-scorer-entity-toggle"]')
  if (toggleElements.length == 1) { 
    toggleElements.click() 
  }

  return cy.WaitForStableDOM().then(() => {
    const responseElement = Cypress.$(elements).find('[data-testid="action-scorer-text-response"], [data-testid="action-scorer-api-name"], [data-testid="action-scorer-session-response-user"], [data-testid="action-scorer-card-name"]')
    if (responseElement.length != 1) {
      // Won't work for [data-testid="action-scorer-action-set-entity"] - need to ask devs to change lastResponse in grid to get this working.
      throw new Error('in scorerModal.GetTextWithEntityNamesFromSelectedAction() - The last Bot response of this Train Dialog uses an action type that is NOT supported by this function, the test code needs to be fixed.')
    }
    const text = helpers.TextContentWithoutNewlines(responseElement[0])
    return text
  })
}