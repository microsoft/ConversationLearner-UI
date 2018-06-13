/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

/** Clicks on multivalue checkbox */
function clickOnMultivalue() {
    cy.get('[data-testid="entity-creator-input-multivalue"]')
        .click()
}

/** Select the submit button to save the new entity*/
function save() {
    cy.on('uncaught:exception', (err, runnable) => {
        return false
    })
    cy.server()
    cy.route('POST', '/app/*/entity').as('postEntity')
    cy.get('[data-testid="entity-creator-button-save"]').click()
    cy.wait('@postEntity')
}

export { clickOnMultivalue, save }