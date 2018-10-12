/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

const helpers = require('./helpers.js')
const homePage = require('./components/HomePage')
const modelPage = require('./components/ModelPage')
const entities = require('./Entities')
const actions = require('./Actions')

export function CreateNewModel(name)
{
  homePage.Visit()
  homePage.ClickNewModelButton()
  homePage.TypeModelName(name)
  homePage.ClickSubmitButton()
  modelPage.VerifyPageTitle(name)
}

export function ImportModel(modelNamePrefix, fileName)
{
  // Maximum Name Length is 30 Characters
  const name = `${modelNamePrefix}-${helpers.ModelNameTime()}`

  homePage.Visit()
  homePage.ClickImportModelButton()

  homePage.TypeModelName(name)
  homePage.UploadImportModelFile(fileName)
  homePage.ClickSubmitButton()

  return name
}


// Old code that is likely to be removed or remodeled in the future ------------------------

export function DeleteModel(name)
{
  if (!DoesExist(name)) helpers.ConLog(`DeleteModel(${name})`, `Model by that name does not exist`)
  else
  {
    homePageDeleteModel(name)
    helpers.ConLog(`DeleteModel(${name})`, `Model Deleted`)
  }
}

export function DoesExist(name)
{
  GetModelList().then((modelList) => {
    return (modelList.indexOf(name) >= 0)
  })
}

export function homePageDeleteModel(name) 
{
  cy.Get('[data-testid="model-list-model-name"]').contains(name)
    .parents('.ms-DetailsRow-fields').contains('[data-testid="model-list-delete-button"]')
    .Click()

  cy.Get('.ms-Dialog-main').contains('Confirm').Click()
}

export function GetModelList()
{
  return new Promise((resolve) =>
  {
    var elements = Cypress.$('[data-testid="model-list-model-name"]').toArray()
    var modelList = new Array();
    elements.forEach(element => 
    {
      var propertyList = ''
      modelList.push(element['innerHTML'])
      resolve(modelList)
    })
  })
}


