import { ConLog } from "../helpers";

/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
export function typeYourMessage(trainMessage) {
  // cy.server()
  // cy.route('PUT', '/sdk/app/*/teach/*/extractor').as('putExtractor')
  // cy.route('GET', '/sdk/app/*/trainingstatus').as('getAppTrainingStatus')
  
  //200 http://localhost:3978/directline/conversations/227ade76-1972-4a75-8f37-1dca9ac81c8e/activities
  //204 http://localhost:3978/sdk/app/96e774ee-83aa-41de-ba61-a694f04afffa/teach/20ee398e-3b5d-486e-bc27-6a0edbb48020/extractor
  //202 http://localhost:3978/directline/conversations/227ade76-1972-4a75-8f37-1dca9ac81c8e/activities
  //200 http://localhost:3978/sdk/app/96e774ee-83aa-41de-ba61-a694f04afffa/teach/20ee398e-3b5d-486e-bc27-6a0edbb48020/extractor


  cy.get('input[class="wc-shellinput"]')
    .type(`${trainMessage}{enter}`)

  // cy.ConLog(`typeYourMessage(${trainMessage})`,  `WAIT for @putExtractor`)
  //   .wait('@putExtractor')
  //   .wait(500) // TODO: Replace this with WaitForStableDom
}

export function highlightWord(word) {
  cy.get('span[class="cl-token-node"]')
    .trigger('keydown')
    .click(10, 10)
    .wait(1000)

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
  // cy.server()
  // cy.route('PUT', '/sdk/app/*/teach/*/scorer').as('putScorer')

  cy.get('[data-testid="button-proceedto-scoreactions"]')
    .click()

  // cy.wait(1000) // TODO: Replace this with WaitForStableDom
  //   .wait('@putScorer')
}

/** Finalize the training by clicking the Click done Teaching button*/
export function clickDoneTeaching() {
  cy.get('[data-testid="teachsession-footer-button-done"]')
    .click()
    .wait(1000)
}
