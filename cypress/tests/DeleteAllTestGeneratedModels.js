/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const homePage = require('../support/components/HomePage')
const helpers = require('../support/Helpers')

export function DeleteAllTestGeneratedModels() 
{
  homePage.Visit()
  cy.WaitForStableDOM()
  // We must "Enqueue" this function call so that Cypress will have one "Cypress Command" 
  // still running when the DeleteAllRows function exits. If not for this, only one row will
  // get deleted then test execution will stop.
  cy.Enqueue(DeleteAllTestGeneratedModelRows).then(() => { helpers.ConLog(`Delete All Test Generated Models`, `DONE - All test generated models have been Deleted`) })
  cy.reload()
}

function DeleteAllTestGeneratedModelRows() 
{
  var thisFuncName = `DeleteAllTestGeneratedModelRows`
  var modelNameIdList = homePage.GetModelNameIdList()

  modelNameIdList.forEach(modelNameId => 
  {
    if (modelNameId.name.startsWith('z-')) 
    {
      helpers.ConLog(thisFuncName, `Sending Request to Delete Model: ${modelNameId.name}`)
      cy.request(
      { 
        url: `http://localhost:3978/sdk/app/${modelNameId.id}`, 
        method: "DELETE", 
        headers: { 'x-conversationlearner-memory-key': 'x' } 
      }).then(resp => 
      { 
        helpers.ConLog(thisFuncName, `Response Status: ${resp.status} - Model: ${modelNameId.name}`); 
        expect(resp.status).to.eq(200)
      })
    }
  })
}
