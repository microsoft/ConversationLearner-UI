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
  homePage.CreateNewModel(name)
  modelPage.VerifyPageTitle(name)
}

export function CreateModel1()
{
  const name = `Model1-${Cypress.moment().format("YY-MMM-DD-HH-mm-ss-SSS")}`
  
  CreateNewModel(name)
  entities.CreateNewEntity({name: "name"})
  actions.CreateNewAction({response: "What's your name?", expectedEntity: "name"})
  actions.CreateNewAction({response: "Hello $name", requiredEntities: "name"})
  return name
}

export function DeleteModel(name)
{
  if (!DoesExist(name)) helpers.ConLog(`DeleteModel(${name})`, `Model by that name does not exist`)
  else
  {
    homePage.DeleteModel(name)
    helpers.ConLog(`DeleteModel(${name})`, `Model Deleted`)
  }
}

export function DoesExist(name)
{
  GetModelList().then((modelList) => {
    return (modelList.indexOf(name) >= 0)
  })
}