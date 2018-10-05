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
  cy.Get('[data-testid="model-create-input-name"]').type(name)
  cy.Get('[data-testid="model-create-submit-button"]').Click()
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
  return new Promise(() =>
  {
    Cypress.$('[data-testid="model-list-model-name"]').then((elements) => 
    {
      elements.array.forEach(element => 
      {
        var propertyList = ''
        for(var property in element) propertyList += `${(propertyList.length == 0 ? '' : ', ')}${property}: ${element[property]}`
        console.log(propertyList)

        //console.log(element.val())
      })
    })
  })
}


