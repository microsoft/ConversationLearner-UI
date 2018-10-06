/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

const homePage = require('../support/components/HomePage')
const modelPage = require('../support/components/ModelPage')
const helpers = require('../support/helpers.js')

export function CreateNewModel(name)
{
  homePage.Visit()
  homePage.CreateNewModel(name)
  modelPage.VerifyPageTitle(name)
}

export function CreateModel1()
{
  models.CreateNewModel(modelName)
  entities.CreateNewEntity({name: "name"})
  actions.CreateNewAction({response: "What's your name?", expectedEntity: "name"})
  actions.CreateNewAction({response: "Hello $name", disqualifyingEntities: "name"})
  return modelName
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