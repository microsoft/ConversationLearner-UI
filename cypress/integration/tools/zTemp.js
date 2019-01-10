/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const helpers = require('../../support/Helpers')
const homePage = require('../../support/components/HomePage')
const modelPage = require('../../support/components/ModelPage')
const train = require('../../support/Train')
const trainDialogsGrid = require('../../support/components/TrainDialogsGrid')
const editDialogModal = require('../../support/components/EditDialogModal')

// Description: A temporary workspace for experimental code
describe('zTemp test', () =>
{
  it('zTemp test', () => 
  {
    DeleteAllTestGeneratedModels()
    //homePage.Visit()
    // homePage.NavigateToModelPage("BigTrain")
    // modelPage.NavigateToTrainDialogs()
    // cy.pause()
    // cy.Train_CaptureAllChatMessages()
  })
})

export function DeleteAllTestGeneratedModels()
{
  homePage.Visit()
  
  // We must "Enqueue" this function call so that Cypress will have one "Cypress Command" 
  // still running when the DeleteAllRows function exits. If not for this, only one row will
  // get deleted then test execution will stop.
  cy.Enqueue(DeleteAllTestGeneratedModelRows).then(() => { helpers.ConLog(`Delete All Test Generated Models`, `DONE - All test generated models have been Deleted`) })
}

function DeleteAllTestGeneratedModelRows()
{
  var indexNextPotentialRowToDelete = 0

  function DeleteATestGeneratedModelRow(resolve)
  {
    var thisFuncName = `DeleteATestGeneratedModelRow`
    helpers.ConLog(thisFuncName, `Trying to find a test generated model to delete...`)

    DeleteNextTestGeneratedModel(indexNextPotentialRowToDelete).then(indexNextRow =>
    {
      helpers.ConLog(thisFuncName, `returned from homePage.DeleteNextTestGeneratedModel: ${indexNextRow}`)
      if (!indexNextRow)
      {
        helpers.ConLog(thisFuncName, `DONE - there are no more test generated models to delete`)
        return resolve()
      }
      
      indexNextPotentialRowToDelete = indexNextRow
      helpers.ConLog(thisFuncName, `nextRow: ${indexNextRow} - nextPotentialRowToDelete: ${indexNextPotentialRowToDelete}`)
      DeleteATestGeneratedModelRow(resolve)
    })
  }
  
  return new Promise((resolve) => { DeleteATestGeneratedModelRow(resolve) })
}

// Returns the index to the next potential row to delete, or undefined to indicate complete.
function DeleteNextTestGeneratedModel(indexNextPotentialRowToDelete) 
{
  var thisFuncName = `DeleteNextTestGeneratedModel`
  helpers.ConLog(thisFuncName, `Start`)

  return new Promise((resolve) =>
  {
    helpers.ConLog(thisFuncName, `Promise has been created and returned.`)
    cy.Enqueue(()=> {Get('[data-testid="model-list-model-name"]')}).then(elements =>
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

function GetModelList()
{
  return new Promise((resolve) =>
  {
    setTimeout(()=>
    {

    }, )
  }
}
