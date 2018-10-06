/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const models = require('../../support/Models')
const entities = require('../../support/Entities')
const actions = require('../../support/Actions')
const helpers = require('../../support/helpers.js')

describe("ExpectedEntities test", () =>
{
  const momentSeconds = Cypress.moment().format("YY-MMM-DD-HH-mm-ss-SSS")
  const modelName = `Model1-${momentSeconds}`
  const customEntity01 = "programmaticonlyentity"
  const customEntity02 = "multivaluedentity"
  const customEntity03 = "negatable-entity"

  it("Create Model #1", () =>
  {
    models.CreateNewModel(modelName)
    entities.CreateNewEntity({name: "name"})

    actions.CreateNewAction({response: "What's your name?", expectedEntity: "name"})
    actions.CreateNewAction({response: "Hello $name", disqualifyingEntities: "name"})
  })
})

