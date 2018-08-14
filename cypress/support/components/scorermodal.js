/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
export function selectAnAction() {
    cy.server()
    cy.route('POST', '/sdk/app/*/teach/*/scorer').as('postScore')
    cy.get('[data-testid="actionscorer-buttonClickable"]')
        .should("be.visible")
        .click()
        .wait('@postScore')
        .wait(500)
}

export function selectAnActionWithText(action) {
    cy.wait(3000)
    cy.server()
    cy.route('POST', '/sdk/app/*/teach/*/scorer').as('postScore')

    cy.get('.ms-List-page').should("be.visible").within(() => {
        cy.contains(action)
            .parents('[class*="ms-DetailsRow-fields"]')
            .find('.ms-Button-flexContainer')
            .click()
    })
    cy.wait('@postScore')
}
