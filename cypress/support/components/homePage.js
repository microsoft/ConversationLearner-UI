/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

export function Visit()                   { cy.visit('http://localhost:5050') }
export function NavigateToModelPage(name) { cy.Get('button.root-65').contains(`${name}`).Click() }

// data-testid="model-list-model-name"
// data-testid="model-list-is-editing"
// data-testid="model-list-is-live"
// data-testid="model-list-is-logging-on"
// data-testid="model-list-last-modified-time"
// data-testid="model-list-created-date-time"
// data-testid="model-list-locale"
// data-testid="model-list-delete-button"
// data-testid="model-list-create-new-button"
// data-testid="model-creator-input-name"
// data-testid="model-creator-button-submit"
// data-testid="model-creator-cancel-submit"


export function CreateNewModel(name) 
{
  cy.Get('[data-testid="model-list-create-new-button"]').Click()
  cy.Get('[data-testid="model-creator-input-name"]').type(name)
  cy.Get('[data-testid="model-creator-submit-button"]').Click()
}

export function DeleteModel(name) 
{
  cy.Get('[data-testid="model-list-model-name"]').contains(name)
    .parents('.ms-DetailsRow-fields').contains('[data-testid="model-list-delete-button"]')
    .Click()

  cy.Get('.ms-Dialog-main').contains('Confirm').Click()
}

export function GetModelList()
{
  return new Promise((resolve) =>
  {
    var elements = Cypress.$('[data-testid="model-list-model-name"]').toArray()
    var modelList = new Array();
    elements.forEach(element => 
    {
      var propertyList = ''
      modelList.push(element['innerHTML'])
      resolve(modelList)
    })
  })
}


