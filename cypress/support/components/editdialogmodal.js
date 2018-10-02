/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
export function typeYourMessage(trainmessage) { cy.Get('input[class="wc-shellinput"]').type(`${trainmessage}{enter}`) }  // data-testid NOT possible
export function clickScoreActions()           { cy.Get('[data-testid="button-proceedto-scoreactions"]').Click() }
export function clickSave()                   { cy.Get('[data-testid="teachsession-footer-button-save"]').Click() }

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

export function verifyDetectedEntity(entityName, entityValue)
{
  cy.Get('[data-testid="button-entity-indicatorName"]').contains(entityName)
  cy.Get('[data-testid="text-entity-value"]').contains(entityValue)
}