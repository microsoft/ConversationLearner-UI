import { func } from 'prop-types';

/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const models = require('../support/Models')
const entities = require('../support/Entities')
const actions = require('../support/Actions')

export function AllEntityTypes()
{
  models.CreateNewModel('Model-aet')

  entities.CreateNewEntity({name: 'multiValuedEntity', multiValued: true})
  entities.CreateNewEntity({name: 'negatableEntity', negatable: true})
  
  entities.entityTypes.forEach(entityType => { entities.CreateNewEntity({name: `my-${entityType}`, type: entityType}) })
}

export function DisqualifyingEntities()
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
}

export function WaitVsNoWaitActions()
{
  models.CreateNewModel('Model-0wait')
  
  // NOTE: the {enter} in these strings are necessary to triger the entity detection.
  actions.CreateNewAction({response: 'Which animal would you like?'})
  actions.CreateNewAction({response: 'Cows say moo!', uncheckWaitForResponse: true})
  actions.CreateNewAction({response: 'Ducks say quack!', uncheckWaitForResponse: true})
}

export function WhatsYourName()
{
  models.CreateNewModel('Model1')
  entities.CreateNewEntity({name: 'name'})
  actions.CreateNewAction({response: "What's your name?", expectedEntities: 'name'})
  
  // NOTE: the {enter} in this call is necessary to triger the entity detection.
  actions.CreateNewAction({response: 'Hello $name{enter}'})
}
