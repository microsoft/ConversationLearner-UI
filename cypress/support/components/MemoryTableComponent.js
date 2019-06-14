/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

export function VerifyEntityValues(entityName, entityValues) { _VerifyEntitiesInMemory(entityName, false, entityValues) }
export function VerifyDisplacedEntityValues(entityName, entityValues) { _VerifyEntitiesInMemory(entityName, false, entityValues, true) }
export function VerifyDeletedEntityValues(entityName, entityValues) { _VerifyEntitiesInMemory(entityName, false, entityValues) }

function _VerifyEntitiesInMemory(entityName, deleted, entityValues, displaced) {
  let entityNameFont = '.cl-font--emphasis'
  if (deleted) {
    entityNameFont = '.cl-font--deleted'  
  }

  let entityValueFont = '.cl-font--emphasis'
  if(deleted || displaced) {
    entityValueFont = '.cl-font--deleted'
  }

  cy.Get(`${entityNameFont},[data-testid="entity-memory-name"]`)
    .ExactMatch(entityName)
    .parents('div.ms-DetailsRow-fields')
    .find(`${entityValueFont},[data-testid="entity-memory-value"]`).then(elements => {
      entityValues.forEach(entityValue => {
        cy.wrap(elements).contains(entityValue)
      })
    })
}

// export function VerifyNoDisplacedEntityInMemory(displacedValue) {
//   cy.DoesNotContain('.cl-font--deleted,[data-testid="entity-memory-value"]', displacedValue)
// }

