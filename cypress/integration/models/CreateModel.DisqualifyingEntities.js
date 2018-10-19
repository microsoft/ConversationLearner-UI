/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const models = require('../../support/Models')
const modelPage = require('../../support/components/ModelPage')
const entities = require('../../support/Entities')
const actions = require('../../support/Actions')
const helpers = require('../../support/helpers')
const memoryTableComponent = require('../../support/components/MemoryTableComponent')
const scorerModal = require('../../support/components/ScorerModal')
const trainDialogPage = require('../../support/components/TrainDialogsPage')
const editDialogModal = require('../../support/components/EditDialogModal')

<<<<<<< HEAD
/// Description: Create a model that can be used for Disqualifying Entities test cases
/// Verifications: Entity Creation, Action Creation, Action Grid View
describe("Create Model for Disqualifying Entities tests", () =>
{
=======
describe("Create Model for Disqualifying Entities tests", () =>
{
  after(() => { cy.VerifyMonitorFinds() })
  
>>>>>>> origin/master
  it("Create Model for Disqualifying Entities tests", () =>
  {
    models.CreateNewModel(`Model-disq-${helpers.ModelNameTime()}`)
    
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

