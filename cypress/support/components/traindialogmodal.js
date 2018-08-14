/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

const testLog = require('../utils/testlog')

/** Chat: Types a new user's message */
function typeYourMessage(trainmessage) {
  testLog.logStart("Submit message to WebChat");
  cy.server()
  cy.route('PUT', '/sdk/app/*/teach/*/extractor').as('putExtractor')
  cy.get('input[class="wc-shellinput"]').type(trainmessage)
  cy.get('label[class="wc-send"]')
    .then(function (response) {
      testLog.logStep("type new user message")
    })
    .click()
    .wait('@putExtractor');
  testLog.logEnd();
}

function highlightWord(word) {
  cy.get('span[class="cl-token-node"]')
    .trigger('keydown')
    .click(10, 10)
    .wait(1000);
  cy.get('.custom-toolbar.custom-toolbar--visible')
    .invoke('show')
    .wait();
}

function verifyTokenNodeExists() {
  cy.get('.cl-token-node')
    .should('exists');
}

/** Click on 'Score Action' button */
function clickScoreActions() {
  testLog.logStart("Click on Score Actions");
  cy.server()
  cy.route('PUT', '/sdk/app/*/teach/*/scorer').as('putScorer')
  cy.get('[data-testid="button-proceedto-scoreactions"]')
    .then(function (response) {
      testLog.logStep("proceed to score actions")
    })
    .click()
    .wait('@putScorer');
  testLog.logEnd();
}

/** Finalize the training by clicking the Click done Teaching button*/
function clickDoneTeaching() {
  cy.get('[data-testid="teachsession-footer-button-done"]')
    .then(function (response) {
      testLog.logStep("Click Done Teaching button")
    })
    .click();
}

export {
  typeYourMessage,
  clickScoreActions,
  clickDoneTeaching,
  highlightWord,
  verifyTokenNodeExists
};