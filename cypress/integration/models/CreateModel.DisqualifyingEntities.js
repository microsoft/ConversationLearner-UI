/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const models = require('../../support/Models')
const entities = require('../../support/Entities')
const actions = require('../../support/Actions')

/// Description: Create a model that can be used for Disqualifying Entities test cases
/// Verifications: Entity Creation, Action Creation, Action Grid View
describe("Create Model for Disqualifying Entities Tests", () =>
{
  it("Create Model for Disqualifying Entities Tests", () =>
  {
    models.CreateNewModel('Model-disq')
    
    entities.CreateNewEntity({name: 'name'})
    entities.CreateNewEntity({name: 'want'})
    entities.CreateNewEntity({name: 'sweets'})

    // NOTE: the {enter} in these strings are necessary to triger the entity detection.
    actions.CreateNewAction({response: "What's your name?", expectedEntities: 'name', disqualifyingEntities: 'name'})
    actions.CreateNewAction({response: 'Hey $name{enter}', disqualifyingEntities: ['sweets', 'want']})
    actions.CreateNewAction({response: 'Hey $name{enter}, what do you really want?', expectedEntities: 'want', disqualifyingEntities: ['sweets', 'want']})
    actions.CreateNewAction({response: "Sorry $name{enter}, I can't help you get $want{enter}"})
  })
})

