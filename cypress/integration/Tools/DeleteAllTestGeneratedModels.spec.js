/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as homePage from '../../support/components/HomePage'
import * as helpers from '../../support/Helpers'

describe('Tools', () => {
  it('Delete All Test Generated Models', () => {
    homePage.Visit()
    // We must "Enqueue" this function call so that Cypress will have one "Cypress Command" 
    // still running when the DeleteAllRows function exits. If not for this, only one row will
    // get deleted then test execution will stop.
    cy.Enqueue(DeleteAllTestGeneratedModelRows).then(() => { helpers.ConLog(`Delete All Test Generated Models`, `DONE - All test generated models have been Deleted`) })
    cy.reload()
  })
})

function DeleteAllTestGeneratedModelRows() 
{
  const funcName = `DeleteAllTestGeneratedModelRows`
  
  cy.WaitForStableDOM()
  cy.Enqueue(() => { return homePage.GetModelNameIdList() } ).then(modelNameIdList => {
    let thereCouldBeMoreModelsToDelete = false
    modelNameIdList.forEach(modelNameId => 
    {
      if (modelNameId.name.startsWith('z-')) 
      {
        thereCouldBeMoreModelsToDelete = true
        helpers.ConLog(funcName, `Sending Request to Delete Model: ${modelNameId.name}`)
        cy.request(
        { 
          url: `http://localhost:3978/sdk/app/${modelNameId.id}`, 
          method: "DELETE", 
          headers: { 'x-conversationlearner-memory-key': 'x' } 
        }).then(response => 
        { 
          helpers.ConLog(funcName, `Response Status: ${response.status} - Model: ${modelNameId.name}`) 
          expect(response.status).to.eq(200)
        })
      }
    })
    
    cy.reload()
    if (thereCouldBeMoreModelsToDelete) {
      DeleteAllTestGeneratedModelRows()
    }
  })
}
