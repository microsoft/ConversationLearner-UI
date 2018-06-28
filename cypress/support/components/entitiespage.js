/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
const testLog = require('../utils/testlog')

/** Create a new entity */
function clickButtonNewEntity() {
    testLog.logStart("Entities Page: Click Create New")
    cy.get('.cl-page').within(() => {

        cy.get('[data-testid="entities-button-create"]')
            .then(function (response) {
                testLog.logStep("Create a new Entity")
            })
            .click()
    })
    testLog.logEnd();
}
export {
    clickButtonNewEntity
}