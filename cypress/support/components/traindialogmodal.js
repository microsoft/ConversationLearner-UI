/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
export function typeYourMessage(trainmessage) {
  cy.server()
  cy.route('PUT', '/sdk/app/*/teach/*/extractor').as('putExtractor')
  cy.route('GET', '/sdk/app/*/trainingstatus').as('getAppTrainingStatus')
  cy.get('input[class="wc-shellinput"]')
    .type(`${trainmessage}{enter}`)
  cy.wait('@putExtractor')
    .wait(500)
}

export function highlightWord(word) {
  cy.get('span[class="cl-token-node"]')
    .trigger('keydown')
    .click(10, 10)
    .wait(1000);
  cy.get('.custom-toolbar.custom-toolbar--visible')
    .invoke('show')
    .wait()
}

export function verifyTokenNodeExists() {
  cy.get('.cl-token-node')
    .should('exists')
}

/** Click on 'Score Action' button */
export function clickScoreActions() {
  cy.server()
  cy.route('PUT', '/sdk/app/*/teach/*/scorer').as('putScorer')
  cy.get('[data-testid="button-proceedto-scoreactions"]')
    .click()
    .wait(1000)
    .wait('@putScorer')
}

/** Finalize the training by clicking the Click done Teaching button*/
export function clickDoneTeaching() {
  cy.get('[data-testid="teachsession-footer-button-done"]')
    .click()
    .wait(1000)
}
