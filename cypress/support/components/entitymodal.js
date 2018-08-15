/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
export function typeEntityName(entityName) {
    cy.get('[data-testid="entity-creator-input-name"]')
        .type(entityName)
        .wait(1000)
}

/** Clicks on Programmatic Only checkbox */
export function clickOnProgrammaticOnly() {
    //cy.get('[data-testid="entitycreator-checkbox-programmaticonly"]')
    cy.get('.cl-modal_body').within(() => {
        cy.get('.ms-Checkbox-text').contains('Programmatic Only')
            .click()
    })
}

/** Clicks on multivalue checkbox */
export function clickOnMultiValue() {
    cy.get('.cl-modal_body').within(() => {
        cy.get('.ms-Checkbox-text').contains('Multi-valued')
            .click()
    })
}

/** Clicks on Negatable checkbox */
export function clickOnNegatable() {
    cy.get('.cl-modal_body').within(() => {
        cy.get('.ms-Checkbox-text').contains('Negatable')
            .click()
    })
}

/** Select the submit button to save the new entity*/
export function clickCreateButton() {
    cy.server()
    cy.route('POST', '/sdk/app/*/entity').as('postEntity')

    cy.get('[data-testid="entity-creator-button-save"]')
        .click()

    cy.wait('@postEntity')
}
