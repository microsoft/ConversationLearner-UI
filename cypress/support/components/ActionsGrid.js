/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

export function VerifyPageTitle()                       { cy.Get('[data-testid="actions-title"]').contains('Actions') }

// IMPORTANT: Call this method before calling any of the Validate* methods.
export function GetRowToBeValidated(response)
{
  cy.Get('[data-testid="action-scorer-text-response"]')
    .contains(response)
    .parents('div.ms-DetailsRow-fields')
    .as('responseDetailsRow')
}

export function ValidateRequiredEntitiesIsEmpty()       { ValidateEntitiesIsEmpty('[data-testid="action-details-empty-required-entities"]') }
export function ValidateDisqualifyingEntitiesIsEmpty()  { ValidateEntitiesIsEmpty('[data-testid="action-details-empty-disqualifying-entities"]') }
export function ValidateExpectedEntitiesIsEmpty()       { ValidateEntitiesIsEmpty('[data-testid="action-details-empty-expected-entities"]') }
export function ValidateRequiredEntities(entities)      { ValidateEntities('[data-testid="action-details-required-entity"]', entities)}
export function ValidateExpectedEntities(entities)      { ValidateEntities('[data-testid="action-details-expected-entity"]', entities)}

// This is a special case since the UI automatically adds Expected Entities to the Disqualifying Entities list
export function ValidateDisqualifyingEntities(expectedEntities, disqualifyingEntities)
{ 
  if(!Array.isArray(expectedEntities)) expectedEntities = [expectedEntities]
  if(!Array.isArray(disqualifyingEntities)) disqualifyingEntities = [disqualifyingEntities]
  var entities = expectedEntities.concat(disqualifyingEntities)
  ValidateEntities('[data-testid="action-details-disqualifying-entity"]', entities)
}

function ValidateEntitiesIsEmpty(selector)              { cy.Get('@responseDetailsRow').find(selector) }

function ValidateEntities(selector, entities) 
{ 
  if(!Array.isArray(entities)) entities = [entities]
  cy.Get('@responseDetailsRow').find(selector).as('entitiesList')
  entities.forEach(entity => { cy.Get('@entitiesList').contains(entity) })
  cy.Get('@entitiesList').should('have.length', entities.length)
}



