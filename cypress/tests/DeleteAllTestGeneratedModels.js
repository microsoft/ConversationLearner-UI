/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const homePage = require('../support/components/HomePage')
const helpers = require('../support/Helpers')

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
  var nextPotentialRowToDelete = 0

  function DeleteATestGeneratedModelRow(resolve)
  {
    var thisFuncName = `DeleteATestGeneratedModelRow`
    helpers.ConLog(thisFuncName, `Trying to find a test generated model to delete...`)

    homePage.DeleteNextTestGeneratedModel(nextPotentialRowToDelete).then(nextRow =>
    {
      helpers.Dump(thisFuncName, nextRow)
      if (!nextRow)
      {
        helpers.ConLog(thisFuncName, `DONE - there are no more test generated models to delete`)
        return resolve()
      }
      
      nextPotentialRowToDelete = nextRow
      helpers.ConLog(thisFuncName, `nextRow: ${nextRow} - nextPotentialRowToDelete: ${nextPotentialRowToDelete}`)
      DeleteATestGeneratedModelRow(resolve)
    })
  }
  
  return new Promise((resolve) => { DeleteATestGeneratedModelRow(resolve) })
}
