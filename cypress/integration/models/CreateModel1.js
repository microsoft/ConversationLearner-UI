/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const models = require('../../support/Models')
const entities = require('../../support/Entities')
const actions = require('../../support/Actions')
const helpers = require('../../support/helpers')

/// Description: Create a model that can be used for simple name based training test cases
/// Verifications: Entity Creation, Action Creation, Action Grid View
describe("Create Model #1 test", () =>
{
  it("Create Model #1", () =>
  {
    models.CreateNewModel(`Model1-${helpers.ModelNameTime()}`)
    entities.CreateNewEntity({name: 'name'})
    actions.CreateNewAction({response: "What's your name?", expectedEntity: 'name'})
    
    // NOTE: the {enter} in this call is necessary to triger the entity detection.
    actions.CreateNewAction({response: 'Hello $name{enter}'})
  })
})

