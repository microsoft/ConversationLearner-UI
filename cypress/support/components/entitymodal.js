/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

export function TypeEntityName(entityName) { cy.Get('[data-testid="entity-creator-input-name"]').type(entityName) } 
export function ClickCreateButton() { cy.Get('[data-testid="entity-creator-button-save"]').Click() }

export function ClickProgrammaticOnlyCheckbox() {
    //cy.Get('[data-testid="entitycreator-checkbox-programmaticonly"]')
    cy.Get('.cl-modal_body').within(() => {
        cy.Get('.ms-Checkbox-text').contains('Programmatic Only')
            .Click()
    })
}

export function ClickMultiValueCheckbox() {
    cy.Get('.cl-modal_body').within(() => {
        cy.Get('.ms-Checkbox-text').contains('Multi-valued')
            .Click()
    })
}

export function ClickNegatableCheckbox() {
    cy.Get('.cl-modal_body').within(() => {
        cy.Get('.ms-Checkbox-text').contains('Negatable')
            .Click()
    })
}

