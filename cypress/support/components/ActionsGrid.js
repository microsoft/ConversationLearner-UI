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

  ValidateActionType(actionType) {cy.Get('@responseDetailsRow').find('[data-testid="action-details-action-type"]').contains(actionType)}
  
  ValidateExpectedEntities(entities) { this._ValidateEntities('[data-testid="action-details-expected-entity"]', '[data-testid="action-details-empty-expected-entities"]', entities) }

  // The UI automatically populates the Required Entities field with entities found in the response text,
  // so the additionalRequiredEntities parameter allows the caller to specify entities not found in the response text.
  ValidateRequiredEntities(requiredEntitiesFromResponse, additionalRequiredEntities) { this._ValidateEntities('[data-testid="action-details-required-entity"]', '[data-testid="action-details-empty-required-entities"]', requiredEntitiesFromResponse, additionalRequiredEntities) }
  
  // The UI automatically populates the Disqualtifying Entities field with the expected entities,
  // so the disqualifyingEntities parameter allows the caller to specify entities not found in expectedEntities.
  ValidateDisqualifyingEntities(expectedEntities, disqualifyingEntities) { this._ValidateEntities('[data-testid="action-details-disqualifying-entity"]', '[data-testid="action-details-empty-disqualifying-entities"]', expectedEntities, disqualifyingEntities) }
  
  // In order to get the 'validateResponse' parameter right, first run a test with this undefined,
  // then look in the log to see the actual value, then add it to the code.
  ValidateApi(validateApiResponse) {
    cy.Get('@responseDetailsRow')
      .find('[data-testid="action-scorer-api-name"]')
      .parent('div').then(elements => {
        let textContentWithoutNewlines = helpers.TextContentWithoutNewlines(elements[0])
        helpers.ConLog('ValidateApi', textContentWithoutNewlines)
        if (validateApiResponse && validateApiResponse !== textContentWithoutNewlines) {
          throw new Error(`Expecting API response to show up in the grid like this "${validateApiResponse}" --- instead we found "${textContentWithoutNewlines}"`)
        }
      })
  }

  ValidateWaitForResponse(checked) { cy.Get('@responseDetailsRow').find(`[data-icon-name="${checked ? 'CheckMark' : 'Remove'}"][data-testid="action-details-wait"]`) }

  _ValidateEntitiesIsEmpty(selector) { cy.Get('@responseDetailsRow').find(selector) }

  _ValidateEntities(selector, emptySelector, entities1, entities2) {
    if (!entities1 && !entities2) return this._ValidateEntitiesIsEmpty(emptySelector)

    let entities = []
    if (entities1) { entities = entities1 }
    if (entities2) { entities = [...entities, ...entities2] }
    entities = helpers.RemoveDuplicates(entities)

    if (entities.length == 0) return this._ValidateEntitiesIsEmpty(emptySelector)

    cy.Get('@responseDetailsRow').find(selector).as('entitiesList')
    entities.forEach(entity => cy.Get('@entitiesList').contains(entity))
    cy.Get('@entitiesList').should('have.length', entities.length)
  }
}

Row.typeSelectorPairs = [
  {type: 'TEXT', selector: '[data-testid="action-scorer-text-response"]'},
  {type: 'API', selector: '[data-testid="action-scorer-api-name"]'},
  {type: 'END_SESSION', selector: '[data-testid="action-scorer-session-response-user"]'},
]
