/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
export function verifyPageTitle() {
  cy.get('div[data-testid="train-dialogs-title"]')
    .contains('Train Dialogs')
}

export function createNew() {
  // cy.server()
  // cy.route('POST', '/sdk/app/*/teach**').as('postTeach')
  // cy.route('POST', '/directline/conversations').as('postConv')
  // cy.route('PUT', '/sdk/state/conversationId?**').as('putConv')

  cy.get('[data-testid="button-new-train-dialog"]')
    .click()

  // cy.wait(['@postTeach', '@postConv', '@putConv'])
}
