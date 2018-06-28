/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
const testLog = require('../utils/testlog')

/** Selects the first enabled action */
function selectAnAction() {
    cy.server()
    cy.route('POST', '/app/*/teach/*/scorer').as('postScore')
    cy.get('[data-testid="actionscorer-buttonClickable"]')
        .should("be.visible")
        .then(function (response) {
            testLog.logStep("Select an action")
        })
        .click()
        .wait('@postScore')
}

/** Selects the action that matches the text passed to this function*/
function selectAnActionWithText(action) {
    cy.server()
    cy.route('POST', '/app/*/teach/*/scorer').as('postScore')

    cy.get('.ms-List-page').should("be.visible").within(() => {
        cy.contains(action)
        .parents('[class*="ms-DetailsRow-fields"]')
        .find('.ms-Button-flexContainer')
        .click({ force: true })
      })

     cy.wait('@postScore')
}


export { selectAnAction, selectAnActionWithText }