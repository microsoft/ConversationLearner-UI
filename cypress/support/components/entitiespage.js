/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
const testLog = require('../utils/testlog')

/** Create a new entity */
function createNew(entityName) {
    cy.get('[data-testid="entities-button-create"]')
        .then(function (response) {
            testLog.logStep("Create a new Entity")
        })
        .click()
        .wait(1000)


    // Enter name for entity
    cy.get('[data-testid="entity-creator-input-name"]')
        .type(entityName)
        .wait(1000);
}

export { createNew }
