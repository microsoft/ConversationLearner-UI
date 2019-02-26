/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const models = require('../support/Models')
const entities = require('../support/Entities')
const actions = require('../support/Actions')
const common = require('../support/Common')

export function Travel()
{
  models.CreateNewModel('z-travel')
  entities.CreateNewEntity({ name: 'departure', resolverType: 'datetimeV2', expectPopup: true })
  entities.CreateNewEntity({ name: 'return', resolverType: 'datetimeV2' })
  actions.CreateNewActionThenVerifyInGrid({ response: 'You are leaving on $departure{enter} and returning on $return{enter}', requiredEntities: ['departure', 'return'] })
  actions.CreateNewActionThenVerifyInGrid({ response: 'When are you planning to travel?', disqualifyingEntities: ['departure', 'return'] })

  // Manually EXPORT this to fixtures folder and name it 'z-travel.cl'
}