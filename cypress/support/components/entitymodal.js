/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
export function typeEntityName(entityName) { cy.get('[data-testid="entity-creator-input-name"]').type(entityName) } 

export function clickProgrammaticOnlyCheckbox() {
    //cy.get('[data-testid="entitycreator-checkbox-programmaticonly"]')
    cy.get('.cl-modal_body').within(() => {
        cy.get('.ms-Checkbox-text').contains('Programmatic Only')
            .click()
    })
}

export function clickMultiValueCheckbox() {
    cy.get('.cl-modal_body').within(() => {
        cy.get('.ms-Checkbox-text').contains('Multi-valued')
            .click()
    })
}

export function clickNegatableCheckbox() {
    cy.get('.cl-modal_body').within(() => {
        cy.get('.ms-Checkbox-text').contains('Negatable')
            .click()
    })
}

export function clickCreateButton() { cy.get('[data-testid="entity-creator-button-save"]').click() }
