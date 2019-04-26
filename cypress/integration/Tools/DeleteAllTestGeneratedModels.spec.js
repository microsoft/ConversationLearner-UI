/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as homePage from '../../support/components/HomePage'
import * as helpers from '../../support/Helpers'

describe('Delete All Test Generated Models - Tools', () => {
  it('test', () => {
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

  // To override the 'localhost:3978' default, add an environment variable named 'CYPRESS_BOT_DOMAIN_PORT'.
  // Cypress removes the 'CYPRESS_' part of that variable name, which is why you see it missing below.
  // See https://docs.cypress.io/guides/guides/environment-variables.html#Option-3-CYPRESS for more info.
  let botDomainAndPort = Cypress.env('BOT_DOMAIN_PORT')
  const deleteRequestUrlRoot = `http://${botDomainAndPort ? botDomainAndPort : 'localhost:3978'}/sdk/app/`
    
  cy.WaitForStableDOM()
  cy.Enqueue(() => { return homePage.GetModelNameIdList() } ).then(modelNameIdList => {
    let thereCouldBeMoreModelsToDelete = false
    modelNameIdList.forEach(modelNameId => 
    {
      if (ModelShouldBeDeleted(modelNameId.name))
      {
        thereCouldBeMoreModelsToDelete = true
        helpers.ConLog(funcName, `Sending Request to Delete Model: ${modelNameId.name}`)
        cy.request(
        { 
          url: deleteRequestUrlRoot + modelNameId.id,
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

function ModelShouldBeDeleted(modelName) {
  if (!modelName.startsWith('z-')) {
    // This is NOT a Test created model since it does NOT start with 'z-'
    return false
  }

const funcName = `ModelShouldBeDeleted(${modelName})`
helpers.ConLog(funcName, 'Starts with "z-"')

  // Test created Model names end with a suffix like this...  "-0425-135703x"
  // The moment format for the suffix is...                   "-MMDD-HHmmss*" where '*' is the Build Key
  const suffixFormat = '-MMDD-HHmmss*'
  const suffixLength = suffixFormat.length

  const modelNameSuffix = modelName.substring(modelName.length - suffixLength)
  if (modelNameSuffix[0] != '-') {
    // Something is wrong with the format of this model name, 
    // so to be safe we will not delete it.
    return false
  }

helpers.ConLog(funcName, 'Suffix starts with "-"')

  if (modelNameSuffix[suffixLength - 1] == helpers.GetBuildKey()) {
    // The Build Key in the model matches the Build Key of this test 
    // run so we can safely delete a model we created.
    return true
  }

helpers.ConLog(funcName, 'Key is from another build')

  // This model was created by some other test run, so we need to verify
  // that the model is too old to still be in use. 5 minutes old is adequate
  // at this point in time, however, if any test case takes more than 4 minutes
  // then we should increase this time.
  const modelCreatedTime = Cypress.moment(modelNameSuffix, suffixFormat)
  let momentModelIsTooOldToSave = Cypress.moment().subtract(5, 'm')

helpers.ConLog(funcName, `Model is old enough to delete: ${modelCreatedTime.isBefore(momentModelIsTooOldToSave)}`)

  return modelCreatedTime.isBefore(momentModelIsTooOldToSave)
}