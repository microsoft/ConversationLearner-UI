/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

const testLog = require('../utils/testlog')

/** Chat: Types a new user's message */
function typeYourMessage(trainmessage) {
    // Submit message to WebChat
    cy.server()
    cy.route('PUT', '/app/*/teach/*/extractor').as('putExtractor')
    cy.get('input[class="wc-shellinput"]').type(trainmessage)
    cy.get('label[class="wc-send"]')
        .then(function (response) {
            testLog.logStep("type new user message")
        })
        .click()
        .wait('@putExtractor');

}

/** Click on 'Score Action' button */
function clickScoreActions() {
    cy.server()
    cy.route('PUT', '/app/*/teach/*/scorer').as('putScorer')
    cy.get('[data-testid="button-proceedto-scoreactions"]')
        .then(function (response) {
            testLog.logStep("proceed to score actions")
        })
        .click()
        .wait('@putScorer');
}

/** Finalize the training by clicking the Click done Teaching button*/
function clickDoneTeaching() {
    cy.get('[data-testid="teachsession-footer-button-done"]')
        .then(function (response) {
            testLog.logStep("Click Done Teaching button")
        })
        .click();
}

export { typeYourMessage, clickScoreActions, clickDoneTeaching };
