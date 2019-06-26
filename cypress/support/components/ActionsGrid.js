/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as helpers from '../../support/Helpers'

export function VerifyPageTitle() { cy.Get('[data-testid="actions-title"]').contains('Actions').should('be.visible') }
export function ClickNewAction() { cy.Get('[data-testid="actions-button-create"]').Click() }

export function Edit(action) {
  cy.Get('[data-testid="action-scorer-text-response"]')
    .contains(action)
    .Click()
}

export class Row {
  constructor(actionType, textId) {
    let typeSelectorPair = Row.typeSelectorPairs.find(typeSelectorPair => typeSelectorPair.type === actionType)
    if (!typeSelectorPair) {
      throw new Error(`Test Code Error - Unrecognized type: '${actionType}'`)
    }
    
    cy.Get(typeSelectorPair.selector)
      .contains(textId)
      .parents('div.ms-DetailsRow-fields')
      .as('responseDetailsRow')
  }

  EditAction() { cy.Get('@responseDetailsRow').Click() }
  
  VerifyActionType(actionType) {cy.Get('@responseDetailsRow').find('[data-testid="action-details-action-type"]').ExactMatch(actionType)}
  
  VerifyExpectedEntity(entity) { this._VerifyEntities('[data-testid="action-details-expected-entity"]', '[data-testid="action-details-empty-expected-entity"]', entity) }

  // The UI automatically populates the Required Entities field with entities found in the response text,
  // so the additionalRequiredEntities parameter allows the caller to specify entities not found in the response text.
  VerifyRequiredEntities(requiredEntitiesFromResponse, additionalRequiredEntities) { this._VerifyEntities('[data-testid="action-details-required-entity"]', '[data-testid="action-details-empty-required-entities"]', requiredEntitiesFromResponse, additionalRequiredEntities) }
  
  // The UI automatically populates the Disqualtifying Entities field with the expected entity,
  // so the disqualifyingEntities parameter allows the caller to specify entities not found in expectedEntity.
  VerifyDisqualifyingEntities(expectedEntity, disqualifyingEntities) { this._VerifyEntities('[data-testid="action-details-disqualifying-entity"]', '[data-testid="action-details-empty-disqualifying-entities"]', expectedEntity, disqualifyingEntities) }
  
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
  {type: 'CARD', selector: '[data-testid="action-scorer-card-name"]'}
]

export function VerifyActionRow(response, type, requiredEntities, disqualifyingEntities, expectedEntity, wait, responseDetails) {
  let actionsGridRow = new Row(type, response)
  if (type === 'API') { actionsGridRow.VerifyApi(responseDetails) }
  else if (type === 'CARD') { actionsGridRow.VerifyCard(responseDetails) }
  actionsGridRow.VerifyActionType(type)
  actionsGridRow.VerifyRequiredEntities(requiredEntities)
  actionsGridRow.VerifyDisqualifyingEntities(disqualifyingEntities)
  actionsGridRow.VerifyExpectedEntity(expectedEntity)
  actionsGridRow.VerifyWaitForResponse(wait)
}

