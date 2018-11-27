/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

export function Visit()                         { cy.visit('http://localhost:5050') }
export function NavigateToModelPage(name)       { cy.Get('button.root-65').ExactMatch(`${name}`).Click() }
export function ClickNewModelButton()           { cy.Get('[data-testid="model-list-create-new-button"]').Click() }
export function ClickImportModelButton()        { cy.Get('[data-testid="model-list-import-model-button"]').Click() }
export function TypeModelName(name)             { cy.Get('[data-testid="model-creator-input-name"]').type(name) }
export function ClickSubmitButton()             { cy.Get('[data-testid="model-creator-submit-button"]').Click() }

export function UploadImportModelFile(name)     { cy.UploadFile(name, `[data-testid=model-creator-import-file-picker] > div > input[type="file"]`)}

export function ClickDeleteModelButton(row)     { cy.Get(`[data-list-index="${row}"] > .ms-FocusZone > .ms-DetailsRow-fields`).find('i[data-icon-name="Delete"]').Click() }
export function ClickConfirmButton()            { return cy.Get('.ms-Dialog-main').contains('Confirm').Click() }

export function GetModelListRowCount() 
{
  return cy.Get('[data-automationid="DetailsList"] > [role="grid"]')
  .then(gridElement => { var rowCount = +gridElement.attr('aria-rowcount') -1; return rowCount })
}

export function DeleteNextTestGeneratedModel(nextPotentialRowToDelete) 
{
  cy.Get('[data-testid="model-list-model-name"]').then(elements =>
  {
    for(var i = nextPotentialRowToDelete; i < elements.length; i++) 
    {
      if(elements[i].innerText.startsWith('z-')) 
      {
        cy.wrap(element[i]).parents('.ms-List-cell[role="presentation"]').then(element =>
        {
          nextPotentialRowToDelete = +element.attr('data-list-index')
          helpers.ConLog(`DeleteNextTestGeneratedModel(${nextPotentialRowToDelete})`, `Delete row ${nextPotentialRowToDelete} with model '${element.innerText}'`)
          cy.wrap(element).find('i[data-icon-name="Delete"]').Click()
          ClickConfirmButton()
          return nextPotentialRowToDelete
        })
      }
    }
    return -1
  })
}

// data-testid="model-list-model-name"
// data-testid="model-list-is-editing"
// data-testid="model-list-is-live"
// data-testid="model-list-is-logging-on"
// data-testid="model-list-last-modified-time"
// data-testid="model-list-created-date-time"
// data-testid="model-list-locale"
// data-testid="model-list-delete-button"
// data-testid="model-list-import-tutorials-button"
// data-testid="model-creator-input-name"
// data-testid="model-creator-button-submit"
// data-testid="model-creator-cancel-submit"
