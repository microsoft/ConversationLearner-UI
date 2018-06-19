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
        .then(function (response) {
            testLog.logStep("Select an action")
        })
        .click()
        .wait('@postScore')
}

export { selectAnAction }