/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as actionTypeSelector from '../../support/components/ActionTypeSelector'
import * as helpers from '../../support/Helpers'

export function VerifyPageTitle() { cy.Get('[data-testid="actions-title"]').contains('Actions').should('be.visible') }
export function ClickNewAction() { cy.Get('[data-testid="actions-button-create"]').Click() }
export function VerifyTextActionNotInGrid(actionName) { cy.DoesNotContainExact('[data-testid="action-scorer-text-response"]', actionName) }

export function EditTextAction(actionName) { new Row('TEXT', actionName).EditAction() }
export function EditCardAction(cardText) { new Row('CARD', cardText).EditAction() }
export function EditEndSessionAction(endSessionData) { new Row('END_SESSION', endSessionData).EditAction() }
export function EditSetEntityAction(setEntityName) { new Row('SET_ENTITY', setEntityName).EditAction() }

// You can get the fullApiNameAndArguments from the end of log file. Just call this function with any value and 
// when the test fails view the end of the log file and look for "ExactMatch([your argument]) - elementText:".
export function EditApiAction(fullApiNameAndArguments) { new Row('API', fullApiNameAndArguments).EditAction() }


export class Row {
  constructor(actionType, textId) {
    cy.Get(actionTypeSelector.GetSelector(actionType))
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

export function VerifyActionRow(response, type, requiredEntities, disqualifyingEntities, expectedEntity, wait) {
  cy.Enqueue(() => {
    helpers.ConLog('VerifyActionRow', `${response}, ${type}, ${requiredEntities}, ${disqualifyingEntities}, ${expectedEntity}, ${wait}`)
    let actionGridRow = new Row(type, response)
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
      helpers.ConLog('VerifyAllActionRows', `${row.response}, ${row.type}, ${row.requiredEntities}, ${row.disqualifyingEntities}, ${row.expectedEntity}, ${row.wait}`)
      VerifyActionRow(row.response, row.type, row.requiredEntities, row.disqualifyingEntities, row.expectedEntity, row.wait)
    })
    
    const gridRowCount = Cypress.$('div[role="presentation"].ms-List-cell').length
    if (gridRowCount > rows.length) {
      throw new Error(`Found all of the expected Action Rows, however there are an additional ${gridRowCount - rows.length} Action Rows in the grid that we were not expecting.`)
    }
  })
}

export function GetAllRows() { 
  const funcName = 'GetAllRows'
  helpers.ConLog(funcName, 'start')

  let allRowData = []

  const allRowElements = Cypress.$('div[role="presentation"].ms-List-cell')

  for (let i = 0; i < allRowElements.length; i++) {
    let type = helpers.TextContentWithoutNewlines(Cypress.$(allRowElements[i]).find('[data-testid="action-details-action-type"]')[0])
    let response = helpers.TextContentWithoutNewlines(Cypress.$(allRowElements[i]).find(actionTypeSelector.GetSelector(type))[0])

    let requiredEntities = helpers.ArrayOfTextContentWithoutNewlines(Cypress.$(allRowElements[i]).find('[data-testid="action-details-required-entities"]'))
    let disqualifyingEntities = helpers.ArrayOfTextContentWithoutNewlines(Cypress.$(allRowElements[i]).find('[data-testid="action-details-disqualifying-entities"]'))
    let expectedEntity = helpers.TextContentWithoutNewlines(Cypress.$(allRowElements[i]).find('[data-testid="action-details-expected-entity"]')[0])
    let wait = Cypress.$(allRowElements[i]).find('[data-icon-name="CheckMark"][data-testid="action-details-wait"]').length == 1

    allRowData.push({ 
      response: response, 
      type: type, 
      requiredEntities: requiredEntities, 
      disqualifyingEntities: disqualifyingEntities, 
      expectedEntity: expectedEntity, 
      wait: wait, 
    })
    helpers.ConLog(funcName, `${response}, ${type}, ${requiredEntities}, ${disqualifyingEntities}, ${expectedEntity}, ${wait}`)
  }
    
  return allRowData
}