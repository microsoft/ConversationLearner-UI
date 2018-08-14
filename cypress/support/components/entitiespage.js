/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
export function clickButtonNewEntity() {
    cy.get('[data-testid="entities-button-create"]')
        .click()
        .wait(1000)
}

export function verifyItemInList(name) {
    cy.get('.ms-DetailsRow-cell')
      .should('contain', name)
}