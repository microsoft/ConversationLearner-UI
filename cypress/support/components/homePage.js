/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

export function Visit()                   { cy.visit('http://localhost:5050') }
export function NavigateToModelPage(name) { cy.Get('button.root-65').contains(`${name}`).Click() }

export function CreateNewModel(name) 
{
  // Click the button to create app
  cy.Get('[data-testid="apps-list-button-create-new"]')
    .should('be.visible')
    .Click()

  cy.Get('[data-testid="app-create-input-name"]')
    .type(name)

  cy.Get('[data-testid="app-create-button-submit"]')
    .Click()
}

export function DeleteModel(name) 
{
  cy.contains(name)
    .parents('.ms-DetailsRow-fields')
    .find('i[data-icon-name="Delete"]')
    .Click()

  cy.Get('.ms-Dialog-main')
    .contains('Confirm')
    .Click()
}


