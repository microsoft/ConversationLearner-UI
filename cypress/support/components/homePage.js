/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

 export function visit()                        { cy.visit('http://localhost:5050') }
 export function navigateToModelPage(modelName) { cy.Get('button.root-65').contains(`${modelName}`).Click() }

 export function createNewModel(modelName) 
 {
  // Click the button to create app
  cy.Get('[data-testid="apps-list-button-create-new"]')
    .should('be.visible')
    .Click()

  cy.Get('[data-testid="app-create-input-name"]')
    .type(modelName)

  cy.Get('[data-testid="app-create-button-submit"]')
    .Click()
}

export function deleteModel(modelName) 
{
  cy.contains(modelName)
    .parents('.ms-DetailsRow-fields')
    .find('i[data-icon-name="Delete"]')
    .Click()

  cy.Get('.ms-Dialog-main')
    .contains('Confirm')
    .Click()
}


