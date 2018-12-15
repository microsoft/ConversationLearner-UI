/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

const homePage = require('./components/HomePage')
const modelPage = require('./components/ModelPage')

// The test defined prefix can be up to 17 characters.
// The dash and time suffix takes 13 characters. 
// 30 characters is the maximum model name.
export function CreateNewModel(modelNamePrefix)
{
  const name = `${modelNamePrefix}-${ModelNameTime()}`

  homePage.Visit()
  homePage.ClickNewModelButton()
  homePage.TypeModelName(name)
  homePage.ClickSubmitButton()
  modelPage.VerifyModelName(name)

  return name
}

export function ImportModel(modelNamePrefix, fileName)
{
  return new Promise((resolve) => 
  { 
    // Maximum Name Length is 30 Characters
    const name = `${modelNamePrefix}-${ModelNameTime()}`

    homePage.Visit()
    homePage.ClickImportModelButton()
    homePage.TypeModelName(name)
    homePage.UploadImportModelFile(fileName)
    homePage.ClickSubmitButton()
    
    cy.WaitForStableDOM().then(() => { resolve(name) })
  })
}

// Get a unique time to use as a suffix for the model name.
var lastModelNameTime
function ModelNameTime() 
{ 
  var modelNameMoment = Cypress.moment()
  var modelNameTime = modelNameMoment.format("MMMDD-HHmmss")
  if (lastModelNameTime && modelNameTime == lastModelNameTime)
  {
    modelNameMoment = modelNameMoment.add(1, 'seconds')
    modelNameTime = modelNameMoment.format("MMMDD-HHmmss")
  }
  
  lastModelNameTime = modelNameTime
  return modelNameTime
}

