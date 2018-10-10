/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

export function VerifyEntityInMemory(entityName, entityValue, displacedValue)
{
  cy.Get('[data-testid="entity-memory-name"]').contains(entityName)
  cy.Get('.cl-font--emphasis,[data-testid="entity-memory-value"]').contains(entityValue)
  if (displacedValue) cy.Get('.cl-font--deleted,[data-testid="entity-memory-value"]').contains(displacedValue)
}

// Other 'data-testid's in this component:
// data-testid="entity-memory-type"
// data-testid="entity-memory-programatic"
// data-testid="entity-memory-multi-value"
// data-testid="entity-memory-negatable"