/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

const homePage = require('./components/HomePage')
const modelPage = require('./components/ModelPage')

// The prefix can be up to 14 characters, the time takes up 16 characters, 30 is the maximum.
export function CreateNewModel(modelNamePrefix)
{
  // Maximum Name Length is 30 Characters
  const name = `${modelNamePrefix}-${ModelNameTime()}`

  homePage.Visit()
  homePage.ClickNewModelButton()
  homePage.TypeModelName(name)
  homePage.ClickSubmitButton()
  modelPage.VerifyModelName(name)
}

export function ImportModel(modelNamePrefix, fileName)
{
  // Maximum Name Length is 30 Characters
  const name = `${modelNamePrefix}-${ModelNameTime()}`

  homePage.Visit()
  homePage.ClickImportModelButton()

  homePage.TypeModelName(name)
  homePage.UploadImportModelFile(fileName)
  homePage.ClickSubmitButton()

  return name
}

function ModelNameTime() { return Cypress.moment().format("MMMDD-HHmmss-SSS") }

