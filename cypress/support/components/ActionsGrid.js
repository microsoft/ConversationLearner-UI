/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as helpers from '../../support/Helpers'

export function VerifyPageTitle() { cy.Get('[data-testid="actions-title"]').contains('Actions').should('be.visible') }
export function ClickNewAction() { cy.Get('[data-testid="actions-button-create"]').Click() }
export function VerifyTextActionNotInGrid(actionName) { cy.DoesNotContainExact('[data-testid="action-scorer-text-response"]', actionName) }

export function EditTextAction(actionName) { new Row('TEXT', actionName).EditAction() }
export function EditApiAction(apiName) { new Row('API', apiName).EditAction() }
export function EditCardAction(cardContains) { new Row('CARD', cardContains).EditAction() }
export function EditEndSessionAction(endSessionData) { new Row('END_SESSION', endSessionData).EditAction() }
export function EditSetEntityAction(setEntityName) { new Row('SET_ENTITY', setEntityName).EditAction() }

export class Row {
  constructor(actionType, textId) {
    let typeSelectorPair = Row.typeSelectorPairs.find(typeSelectorPair => typeSelectorPair.type === actionType)
    if (!typeSelectorPair) {
      throw new Error(`Test Code Error - Unrecognized Action Type: '${actionType}'`)
    }
    
    cy.Get(typeSelectorPair.selector)
      .ExactMatch(textId)
      .parents('div.ms-DetailsRow-fields')
      .as('responseDetailsRow')
  }

  EditAction() { cy.Get('@responseDetailsRow').Click() }
  
  VerifyActionType(actionType) {cy.Get('@responseDetailsRow').find('[data-testid="action-details-action-type"]').ExactMatch(actionType)}
  
  VerifyExpectedEntity(entity) { this._VerifyEntities('[data-testid="action-details-expected-entity"]', '[data-testid="action-details-empty-expected-entity"]', entity) }

  // The UI automatically populates the Required Entities field with entities found in the response text,
  // so the additionalRequiredEntities parameter allows the caller to specify entities not found in the response text.
  VerifyRequiredEntities(requiredEntitiesFromResponse, additionalRequiredEntities) { this._VerifyEntities('[data-testid="action-details-required-entities"]', '[data-testid="action-details-empty-required-entities"]', requiredEntitiesFromResponse, additionalRequiredEntities) }
  
  // The UI automatically populates the Disqualtifying Entities field with the expected entity,
  // so the disqualifyingEntities parameter allows the caller to specify entities not found in expectedEntity.
  VerifyDisqualifyingEntities(expectedEntity, disqualifyingEntities) { this._VerifyEntities('[data-testid="action-details-disqualifying-entities"]', '[data-testid="action-details-empty-disqualifying-entities"]', expectedEntity, disqualifyingEntities) }
  
  // In order to get the 'expectedApiResponse' parameter right, first run a test with this undefined,
  // then look in the log to see the actual value, then add it to the code.
  VerifyApi(expectedApiResponse) {
    cy.Get('@responseDetailsRow')
      .find('[data-testid="action-scorer-api-name"]')
      .parent('div').then(elements => {
        let textContentWithoutNewlines = helpers.TextContentWithoutNewlines(elements[0])
        helpers.ConLog('VerifyApi', textContentWithoutNewlines)
        if (expectedApiResponse && expectedApiResponse !== textContentWithoutNewlines) {
          throw new Error(`Expecting API response to show up in the grid like this "${expectedApiResponse}" --- instead we found "${textContentWithoutNewlines}"`)
        }
      })
  }

  // In order to get the 'expetedCardResponse' parameter right, first run a test with this undefined,
  // then look in the log to see the actual value, then add it to the code.
  VerifyCard(expetedCardResponse) {
    cy.Get('@responseDetailsRow')
      .find('[data-testid="action-scorer-card-name"]')
      .next('div').then(elements => {
        let textContentWithoutNewlines = helpers.TextContentWithoutNewlines(elements[0])
        helpers.ConLog('VerifyCard', textContentWithoutNewlines)
        if (expetedCardResponse && expetedCardResponse !== textContentWithoutNewlines) {
          throw new Error(`Expecting Card response to show up in the grid like this "${expetedCardResponse}" --- instead we found "${textContentWithoutNewlines}"`)
        }
      })
  }

  VerifyIncidentTriangle() { cy.Get('@responseDetailsRow').find('[data-icon-name="IncidentTriangle"]') }

  VerifyWaitForResponse(checked) { cy.Get('@responseDetailsRow').find(`[data-icon-name="${checked ? 'CheckMark' : 'Remove'}"][data-testid="action-details-wait"]`) }

  _VerifyEntitiesIsEmpty(selector) { cy.Get('@responseDetailsRow').find(selector) }

  // entities1 can be either and array or a single entity string or undefined
  _VerifyEntities(selector, emptySelector, entities1, entities2) {
    if (!entities1 && !entities2) return this._VerifyEntitiesIsEmpty(emptySelector)

    let entities = []
    if (entities1) { 
      if (!Array.isArray(entities1)) { entities = [entities1] }
      else { entities = entities1 }
    }
    if (entities2) { entities = [...entities, ...entities2] }
    entities = helpers.RemoveDuplicates(entities)

    if (entities.length == 0) return this._VerifyEntitiesIsEmpty(emptySelector)

    cy.Get('@responseDetailsRow').find(selector).as('entitiesList')
    entities.forEach(entity => cy.Get('@entitiesList').contains(entity))
    cy.Get('@entitiesList').should('have.length', entities.length)
  }
}

Row.typeSelectorPairs = [
  {type: 'TEXT', selector: '[data-testid="action-scorer-text-response"]'},
  {type: 'API', selector: '[data-testid="action-scorer-api-name"]'},
  {type: 'END_SESSION', selector: '[data-testid="action-scorer-session-response-user"]'},
  {type: 'CARD', selector: '[data-testid="action-scorer-card-name"] + div'},
  {type: 'SET_ENTITY', selector: '[data-testid="actions-list-set-entity"]'}
]

export function VerifyActionRow(response, type, requiredEntities, disqualifyingEntities, expectedEntity, wait, responseDetails) {
  cy.Enqueue(() => {
    helpers.ConLog('VerifyActionRow', `${response}, ${type}, ${requiredEntities}, ${disqualifyingEntities}, ${expectedEntity}, ${wait}, ${responseDetails}`)
    let actionGridRow = new Row(type, response)
    if (type === 'API') { actionGridRow.VerifyApi(responseDetails) }
    else if (type === 'CARD') { actionGridRow.VerifyCard(responseDetails) }
    actionGridRow.VerifyActionType(type)
    actionGridRow.VerifyRequiredEntities(requiredEntities)
    actionGridRow.VerifyDisqualifyingEntities(disqualifyingEntities)
    actionGridRow.VerifyExpectedEntity(expectedEntity)
    actionGridRow.VerifyWaitForResponse(wait)
  })
}

export function VerifyAllActionRows(rows) {
  cy.WaitForStableDOM()
  cy.Enqueue(() => {
    rows.forEach(row => {
      helpers.ConLog('VerifyAllActionRows', `${row.response}, ${row.type}, ${row.requiredEntities}, ${row.disqualifyingEntities}, ${row.expectedEntity}, ${row.wait}, ${row.responseDetails}`)
      VerifyActionRow(row.response, row.type, row.requiredEntities, row.disqualifyingEntities, row.expectedEntity, row.wait, row.responseDetails)
    })
    
    const gridRowCount = Cypress.$('div[role="presentation"].ms-List-cell').length
    if (gridRowCount > rows.length) {
      throw new Error(`Found all of the expected Action Rows, however there are an additional ${gridRowCount - rows.length} Action Rows in the grid that we were not expecting.`)
    }
  })
}

export function GetAllRows() { 
  helpers.ConLog('GetAllRows', 'start')

  let allRowData = []

  const allRowElements = Cypress.$('div[role="presentation"].ms-List-cell')

  for (let i = 0; i < allRowElements.length; i++) {
    let type = helpers.TextContentWithoutNewlines(Cypress.$(allRowElements[i]).find('[data-testid="action-details-action-type"]')[0])
    let typeSelectorPair = Row.typeSelectorPairs.find(typeSelectorPair => typeSelectorPair.type === type)
    if (!typeSelectorPair) {
      throw new Error(`Test Code Error - Unrecognized type: '${type}'`)
    }
    let response = helpers.TextContentWithoutNewlines(Cypress.$(allRowElements[i]).find(typeSelectorPair.selector)[0])

    let requiredEntities = helpers.ArrayOfTextContentWithoutNewlines(Cypress.$(allRowElements[i]).find('[data-testid="action-details-required-entities"]'))
    let disqualifyingEntities = helpers.ArrayOfTextContentWithoutNewlines(Cypress.$(allRowElements[i]).find('[data-testid="action-details-disqualifying-entities"]'))
    let expectedEntity = helpers.TextContentWithoutNewlines(Cypress.$(allRowElements[i]).find('[data-testid="action-details-expected-entity"]')[0])
    let wait = Cypress.$(allRowElements[i]).find('[data-icon-name="CheckMark"][data-testid="action-details-wait"]').length == 1

    let responseDetails
    if (type === 'API') { 
      let elements = Cypress.$(allRowElements[i]).find('[data-testid="action-scorer-api-name"]').parent('div')
      responseDetails = helpers.TextContentWithoutNewlines(elements[0])       
    } else if (type === 'CARD') { 
      let elements = Cypress.$(allRowElements[i]).find('[data-testid="action-scorer-card-name"]').next('div')
      responseDetails = helpers.TextContentWithoutNewlines(elements[0])
    }

    allRowData.push({ 
      response: response, 
      type: type, 
      requiredEntities: requiredEntities, 
      disqualifyingEntities: disqualifyingEntities, 
      expectedEntity: expectedEntity, 
      wait: wait, 
      responseDetails: responseDetails
    })
    helpers.ConLog('GetAllRows', `${response}, ${type}, ${requiredEntities}, ${disqualifyingEntities}, ${expectedEntity}, ${wait}, ${responseDetails}`)
  }
    
  return allRowData
}