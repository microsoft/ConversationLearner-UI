/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
const testLog = require('../utils/testlog')

function typeEntityName(entityName) {
    // Enter name for entity
    cy.get('[data-testid="entity-creator-input-name"]')
        .type(entityName)
        .wait(1000);
}

/** Clicks on Programmatic Only checkbox */
function clickOnProgrammaticOnly() {
    //cy.get('[data-testid="entitycreator-checkbox-programmaticonly"]')
    cy.get('.cl-modal_body').within(() => {
        cy.get('.ms-Checkbox-text').contains('Programmatic Only')
            .click()
    })
}

/** Clicks on multivalue checkbox */
function clickOnMultivalue() {
    cy.get('.cl-modal_body').within(() => {
        cy.get('.ms-Checkbox-text').contains('Multi-valued')
            .click()
    })
}

/** Clicks on Negatable checkbox */
function clickOnNegatable() {
    cy.get('.cl-modal_body').within(() => {
        cy.get('.ms-Checkbox-text').contains('Negatable')
            .click()
    })
}

/** Select the submit button to save the new entity*/
function clickCreateButton() {
    testLog.logStart("Entity Modal: Click Create (save)");
    cy.server()
    cy.route('POST', '/sdk/app/*/entity').as('postEntity')
    cy.get('[data-testid="entity-creator-button-save"]')
        .then(function (response) {
            testLog.logStep("Click create button")
        })
        .click()
        .wait('@postEntity')
    testLog.logEnd();
}

export {
    clickOnMultivalue,
    typeEntityName,
    clickOnProgrammaticOnly,
    clickOnNegatable,
    clickCreateButton
}