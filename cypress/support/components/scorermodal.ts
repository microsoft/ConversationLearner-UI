/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

/** Selects the first enabled action */
function selectAnAction() {
    cy.server()
    cy.on('uncaught:exception', (err, runnable) => {
        return false
    })
    cy.route('POST', '/app/*/teach/*/scorer').as('postScore')
    cy.get('[data-testid="actionscorer-buttonClickable"]').click()
    cy.wait('@postScore')
}

export { selectAnAction }