import { settings } from 'cluster';

/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

const modelPage = require('../components/ModelPage')
const settings = require('../components/Settings')
const helpers = require('../Helpers')

export function Visit()                         { return cy.visit('http://localhost:5050') }
export function VerifyPageTitle()               { cy.Get('[data-testid="model-list-title"]').contains('Create and manage your Conversation Learner models').should('be.visible') }
export function NavigateToModelPage(name)       { return cy.Get('[data-testid="model-list-model-name"]').ExactMatch(`${name}`).Click() }
export function ClickNewModelButton()           { return cy.Get('[data-testid="model-list-create-new-button"]').Click() }
export function ClickImportModelButton()        { return cy.Get('[data-testid="model-list-import-model-button"]').Click() }
export function TypeModelName(name)             { return cy.Get('[data-testid="model-creator-input-name"]').type(name) }
export function ClickSubmitButton()             { return cy.Get('[data-testid="model-creator-submit-button"]').Click() }

export function UploadImportModelFile(name)     { return cy.UploadFile(name, `[data-testid=model-creator-import-file-picker] > div > input[type="file"]`)}

export function ClickDeleteModelButton(row)     { return cy.Get(`[data-list-index="${row}"] > .ms-FocusZone > .ms-DetailsRow-fields`).find('i[data-icon-name="Delete"]').Click() }
export function ClickConfirmButton()            { return cy.Get('.ms-Dialog-main').contains('Confirm').Click() }

export function GetModelListRowCount() 
{
  return cy.Get('[data-automationid="DetailsList"] > [role="grid"]')
  .then(gridElement => { var rowCount = +gridElement.attr('aria-rowcount') -1; return rowCount })
}

// Returns the index to the next potential row to delete, or undefined to indicate complete.
export function DeleteNextTestGeneratedModel(indexNextPotentialRowToDelete) 
{
  return new Promise((resolve) =>
  {
    cy.Get('[data-testid="model-list-model-name"]').then(elements =>
    {
      for(var i = indexNextPotentialRowToDelete; i < elements.length; i++) 
      {
        var modelName = elements[i].innerText
        if(modelName.startsWith('z-')) 
        {
          NavigateToModelPage(modelName)
          modelPage.NavigateToSettings()
          settings.DeleteModel(modelName)
          VerifyPageTitle() // To Ensure we have landed back on this same model list home page.
          if(elements.length == 0) cy.DoesNotContain('[data-testid="model-list-model-name"]')
          cy.Get('[data-testid="model-list-model-name"]').DoesNotContain(modelName)
          return resolve(i)
        }
      }
      return resolve(undefined)
    })
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
