/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
export function verifyPageTitle() {
  cy.get('div[data-testid="logdialogs-title"]')
    .contains('Log Dialogs')
}

export function createNew() {
  cy.server()
  cy.route('PUT', '/sdk/state/conversationId?**').as('putConv')

  cy.get('[data-testid="logdialogs-button-create"]')
    .click()

  cy.wait('@putConv')
    .wait(1000)
}
