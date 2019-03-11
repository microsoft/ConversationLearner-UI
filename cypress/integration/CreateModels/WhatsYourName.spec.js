/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../support/Models'
import * as entities from '../../support/Entities'
import * as actions from '../../support/Actions'
import * as common from '../../support/Common'

describe('CreateModels', () => {
  it("What's Your Name", () => {
    models.CreateNewModel('z-whatsYourName')
    entities.CreateNewEntity({ name: 'name' })
    actions.CreateNewActionThenVerifyInGrid({ response: common.whatsYourName, expectedEntities: 'name' })

    // NOTE: the {enter} in this call is necessary to triger the entity detection.
    actions.CreateNewActionThenVerifyInGrid({ response: 'Hello $name{enter}' })

    // Manually EXPORT this to fixtures folder and name it 'z-whatsYourName.cl'
  })
})
