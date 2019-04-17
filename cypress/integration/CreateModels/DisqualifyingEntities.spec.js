/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../support/Models'
import * as entities from '../../support/Entities'
import * as actions from '../../support/Actions'
import * as common from '../../support/Common'

describe('CreateModels', () => {
  it('Disqualifying Entities', () => {
    models.CreateNewModel('z-disqualifyngEnt')

    entities.CreateNewEntity({ name: 'name' })
    entities.CreateNewEntity({ name: 'want' })
    entities.CreateNewEntity({ name: 'sweets' })

    // NOTE: the {enter} in these strings are necessary to triger the entity detection.
    actions.CreateNewActionThenVerifyInGrid({ response: common.whatsYourName, expectedEntities: ['name'], disqualifyingEntities: ['name'] })
    actions.CreateNewActionThenVerifyInGrid({ response: 'Hey $name{enter}', disqualifyingEntities: ['sweets', 'want'] })
    actions.CreateNewActionThenVerifyInGrid({ response: 'Hey $name{enter}, what do you really want?', expectedEntities: ['want'], disqualifyingEntities: ['sweets', 'want'] })
    actions.CreateNewActionThenVerifyInGrid({ response: "Sorry $name{enter}, I can't help you get $want{enter}" })

    // Manually EXPORT this to fixtures folder and name it 'z-disqualifyngEnt'
  })
})
