/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const homePage = require('../../support/components/HomePage')
const helpers = require('../../support/Helpers')

describe('Tools', () => { it('Delete All Models', DeleteAllTestModels) })

export function DeleteAllTestModels()
{
  homePage.Visit()

  // We must "Enqueue" this function call so that Cypress will have one "Cypress Command" 
  // still running when the DeleteAllRows function exits. If not for this, only one row will
  // get deleted then test execution will stop.
  cy.Enqueue(DeleteAllTestRows).then(() => { helpers.ConLog(`Delete All Test Generated Models`, `DONE - All test generated models have been Deleted`) })
}

function DeleteAllTestRows()
{
  var nextPotentialRowToDelete = 0

  function DeleteATestRow(resolve)
  {
    var thisFuncName = `DeleteATestRow`
    helpers.ConLog(thisFuncName, `Trying to find a test generated model to delete...`)

    homePage.DeleteNextTestGeneratedModel(nextPotentialRowToDelete).then(nextRow =>
    {
      helpers.Dump(thisFuncName, nextRow)
      if (!nextRow)
      {
        helpers.ConLog(thisFuncName, `DONE - there are no more test generated models to delete`)
        resolve()
        return
      }
      
      nextPotentialRowToDelete = nextRow
      helpers.ConLog(thisFuncName, `nextRow: ${nextRow} - nextPotentialRowToDelete: ${nextPotentialRowToDelete}`)
      DeleteATestRow(resolve)
    })
  }
  
  return new Promise((resolve) => { DeleteATestRow(resolve) })
}
