/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */


/** Create a new entity */
function createNew(entityName: string) {
    cy.get('[data-testid="entities-button-create"]').click()
        .wait(1000);

    // Enter name for entity
    cy.get('[data-testid="entity-creator-input-name"]')
        .type(entityName).wait(1000);
}

export { createNew }
