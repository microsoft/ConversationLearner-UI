/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const models = require('../../support/Models')
const entities = require('../../support/Entities')
const actions = require('../../support/Actions')

describe("ExpectedEntities test", () =>
{
  it("Create Model #1", () =>
  {
    cy.visit('http://localhost:5050').wait(5000).then(() => {
    GetModelList().then((modelList) => {
    modelList.forEach((modelName) => {console.log(`*** Model Name: ${modelName}`)})
    })
    })
    // models.CreateNewModel("Model1")
    // entities.CreateNewEntity("name")
    // actions.CreateNewAction({response: "What's your name?", expectedEntity: "name"})
  })
})

function GetModelList()
{
  return new Promise((resolve) =>
  {
    var elements = Cypress.$('[data-testid="model-list-model-name"]').toArray()
    var modelList = new Array();
    elements.forEach(element => 
    {
      var propertyList = ''
      for(var property in element) modelList.push(element['innerHTML'])
      resolve(modelList)
    })
  })
}

