/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
const testLog = require('../utils/testlog')

/** Clicks on multivalue checkbox */
function clickOnMultivalue() {
    cy.get('[data-testid="entity-creator-input-multivalue"]')
        .click()
}

/** Select the submit button to save the new entity*/
function save() {
    cy.server()
    cy.route('POST', '/app/*/entity').as('postEntity')
    cy.get('[data-testid="entity-creator-button-save"]')
    .then(function (response) {
        testLog.printStep("Click create button")
    })
    .click()
    .wait('@postEntity')
}

export { clickOnMultivalue, save }