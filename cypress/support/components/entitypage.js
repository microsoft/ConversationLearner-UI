/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

/** Navigate to the Entities page */
function NavigateTo() {
    cy.get('a[href$="/entities"]').click().wait(1000)
}

/** Create a new entity */
function createNew(entityName) {
    cy.get('[data-testid="entities-button-create"]').click()
        .wait(1000);

    // Enter name for entity
    cy.get('[data-testid="entity-creator-input-name"]')
        .type(entityName).wait(1000);
}

export { NavigateTo, createNew }