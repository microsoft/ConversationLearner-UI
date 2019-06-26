/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../../support/Models'
import * as entities from '../../../support/Entities'
import * as actions from '../../../support/Actions'
import * as common from '../../../support/Common'
import * as helpers from '../../../support/Helpers'

describe('Disqualifying Entities - CreateModels', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)

  context('Setup', () => {
    it('Should create a model to test against', () => {
      models.CreateNewModel('z-disqualifyngEnt')
    })
  })

  context('Create Entities', () => {
    it('Should create 3 simple custom trained entities', () => {
      entities.CreateNewEntityThenVerifyInGrid({ name: 'name' })
      entities.CreateNewEntityThenVerifyInGrid({ name: 'want' })
      entities.CreateNewEntityThenVerifyInGrid({ name: 'sweets' })
    })

    context('Create Actions', () => {
      // NOTE: the {enter} in these strings are necessary to triger the entity detection.
      it('Should create an Action with an expected entity and a disqualifying entity', () => {
        actions.CreateNewActionThenVerifyInGrid({ responseNameData: common.whatsYourName, expectedEntity: 'name', disqualifyingEntities: ['name'] })
      })

      it('Should create an Action with 2 disqualifying entities', () => {
        actions.CreateNewActionThenVerifyInGrid({ responseNameData: 'Hey $name{enter}', disqualifyingEntities: ['sweets', 'want'] })
      })

      it('Should create an Action with an expected entity and 2 disqualifying entities', () => {
        actions.CreateNewActionThenVerifyInGrid({ responseNameData: 'Hey $name{enter}, what do you really want?', expectedEntity: 'want', disqualifyingEntities: ['sweets', 'want'] })
      })

      it('Should create an Action with 2 implicitly required entities', () => {
        actions.CreateNewActionThenVerifyInGrid({ responseNameData: "Sorry $name{enter}, I can't help you get $want{enter}" })
      })
    })
  })
  // Manually EXPORT this to fixtures folder and name it 'z-disqualifyngEnt'
})
