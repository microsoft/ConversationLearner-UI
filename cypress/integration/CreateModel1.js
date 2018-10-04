/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const models = require('../support/Models')
const entities = require('../support/Entities')
const actions = require('../support/Actions')

describe("ExpectedEntities test", () =>
{
  it("Create Model #1", () =>
  {
    models.CreateNewModel("Model1")
    entities.CreateNewEntity("name")
    actions.CreateNewAction({response: "What's your name?", expectedEntity: "name"})
  })
})