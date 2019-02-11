/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const helpers = require('../../support/Helpers')

export function VerifyPageTitle() { cy.Get('[data-testid="actions-title"]').contains('Actions').should('be.visible') }
export function ValidateExpectedEntities(entities) { ValidateEntities('[data-testid="action-details-expected-entity"]', '[data-testid="action-details-empty-expected-entities"]', entities) }

// The UI automatically populates the Required Entities field with entities found in the response text,
// so the additionalRequiredEntities parameter allows the caller to specify entities not found in the response text.
export function ValidateRequiredEntities(requiredEntitiesFromResponse, additionalRequiredEntities) { ValidateEntities('[data-testid="action-details-required-entity"]', '[data-testid="action-details-empty-required-entities"]', requiredEntitiesFromResponse, additionalRequiredEntities) }

// The UI automatically populates the Disqualtifying Entities field with the expected entities,
// so the disqualifyingEntities parameter allows the caller to specify entities not found in expectedEntities.
export function ValidateDisqualifyingEntities(expectedEntities, disqualifyingEntities) { ValidateEntities('[data-testid="action-details-disqualifying-entity"]', '[data-testid="action-details-empty-disqualifying-entities"]', expectedEntities, disqualifyingEntities) }

// IMPORTANT: Call this method before calling any of the Validate* methods.
export function GetRowToBeValidated(response) {
  cy.Get('[data-testid="action-scorer-text-response"]')
    .contains(response)
    .parents('div.ms-DetailsRow-fields')
    .as('responseDetailsRow')
}


function ValidateEntitiesIsEmpty(selector) { cy.Get('@responseDetailsRow').find(selector) }

function ValidateEntities(selector, emptySelector, entities1, entities2) {
  if (!entities1 && !entities2) return ValidateEntitiesIsEmpty(emptySelector)

  let entities = []
  if (entities1) {
    if (!Array.isArray(entities1)) entities1 = [entities1]
    entities = entities1
  }
  if (entities2) {
    if (!Array.isArray(entities2)) entities2 = [entities2]
    entities = [...entities, ...entities2]
  }
  entities = helpers.RemoveDuplicates(entities)

  if (entities.length == 0) return ValidateEntitiesIsEmpty(emptySelector)

  cy.Get('@responseDetailsRow').find(selector).as('entitiesList')
  entities.forEach(entity => cy.Get('@entitiesList').contains(entity))
  cy.Get('@entitiesList').should('have.length', entities.length)
}



