/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

/** Chat: Types a new user's message */
function newUserMessage(trainmessage) {
    cy.on('uncaught:exception', (err, runnable) => {
        return false
    })

    // Submit message to WebChat
    cy.server()
    cy.route('PUT', '/app/*/teach/*/extractor').as('putExtractor')

    cy.get('input[class="wc-shellinput"]').type(trainmessage)
    cy.get('label[class="wc-send"]').click()
    cy.wait('@putExtractor')
}

/** Click on 'Score Action' button */
function proceedToScoreAction() {
    cy.on('uncaught:exception', (err, runnable) => {
        return false
    })
    cy.server()
    cy.route('PUT', '/app/*/teach/*/scorer').as('putScorer')
    cy.get('[data-testid="button-proceedto-scoreactions"]').click()
    cy.wait('@putScorer')
}

/** Finalize the training */
function done() {
    cy.get('[data-testid="teachsession-footer-button-done"]')
        .click()
}

export {newUserMessage, proceedToScoreAction, done};
