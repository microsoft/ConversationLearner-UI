/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

export function VerifyPageTitle()     { cy.Get('div[data-testid="log-dialogs-title"]').contains('Log Dialogs') }
export function CreateNewLogDialog()  { cy.Get('[data-testid="log-dialogs-new-button"]').Click() }

export function TypeYourMessage(expectedActionResponse)
{
  cy.Get('[data-testid="actionscorer-responseText"]').contains(expectedActionResponse)
    .parents('div.ms-DetailsRow-fields').find('[data-testid="actionscorer-buttonClickable"]')
    .Click()

  var expectedUtterance = expectedActionResponse.replace(/'/g, "’")
  cy.Get('[data-testid="web-chat-utterances"]').then(elements => {
    cy.wrap(elements[elements.length - 1]).within(e => {
      cy.get('div.format-markdown > p').should('have.text', expectedUtterance)
    })})
}