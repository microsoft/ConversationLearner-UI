/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

const modelPage = require('../components/ModelPage')
const settings = require('../components/Settings')
const helpers = require('../Helpers')

export function Visit()                         { return cy.visit('http://localhost:5050'); VerifyPageTitle() }
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
  var thisFuncName = `DeleteNextTestGeneratedModel`
  helpers.ConLog(thisFuncName, `Start`)

  return new Promise((resolve) =>
  {
    helpers.ConLog(thisFuncName, `Promise has been created and returned.`)
    cy.Get('[data-testid="model-list-model-name"]').then(elements =>
    {
      helpers.ConLog(thisFuncName, `Elements remaining in model list: ${elements.length}`)

      for(var i = indexNextPotentialRowToDelete; i < elements.length; i++) 
      {
        var modelName = elements[i].innerText
        if(modelName.startsWith('z-')) 
        {
          helpers.ConLog(thisFuncName, `Found a test model named: "${modelName}"`)

          // NavigateToModelPage(modelName)
          // modelPage.NavigateToSettings()
          // settings.DeleteModel(modelName)
          VerifyPageTitle() // To Ensure we have landed back on this same model list home page.
          // if(elements.length == 0) cy.DoesNotContain('[data-testid="model-list-model-name"]')
          // else cy.DoesNotContain('[data-testid="model-list-model-name"]', modelName)

          helpers.ConLog(thisFuncName, `Done deleting model named: "${modelName}"`)
          cy.Enqueue(() => {helpers.ConLog(thisFuncName, `Enqueued resolve(${i})`); resolve(i)})
          return
        }
      }
      helpers.ConLog(thisFuncName, `No Models Found!`)
      cy.Enqueue(() => {helpers.ConLog(thisFuncName, `Enqueued resolve(undefined)`); resolve(undefined)})
      return
    })
    helpers.ConLog(thisFuncName, `regular time frame completed`)
  })
}

export function GetModelNameIdList()  
{
  var listToReturn = new Array()
  var elements = Cypress.$('[data-testid="model-list-model-name"]')
  for(var i = 0; i < elements.length; i++)
  {
    var modelName = elements[i].innerText
    var modelId = elements[i].getAttribute('data-model-id');
    listToReturn.push({modelName: modelName, modelId: modelId})
    helpers.ConLog('GetModelNameIdList', `modelName: ${modelName} - modelId: ${modelId}`)
  }
  return listToReturn
}