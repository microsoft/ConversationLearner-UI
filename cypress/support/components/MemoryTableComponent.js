/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

// When an entity is detected/selected that replaces a previous value
// the "displacedValue" parameter will verify it is displayed.
export function VerifyEntityInMemory(entityName, entityValues, displacedValue)
{
  cy.get('[data-testid="entity-memory-name"]').contains(entityName)

  if (!Array.isArray(entityValues)) entityValues = [entityValues]
  for (var i = 0; i < entityValues.length; i++) 
    cy.get('.cl-font--emphasis,[data-testid="entity-memory-value"]').contains(entityValues[i])
  
  if (displacedValue) cy.get('.cl-font--deleted,[data-testid="entity-memory-value"]').contains(displacedValue)
}
