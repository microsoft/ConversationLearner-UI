/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../../support/Models'
import * as entities from '../../../support/Entities'
import * as actions from '../../../support/Actions'
import * as common from '../../../support/Common'
import * as helpers from '../../../support/Helpers'

describe("What's Your Name - CreateModels", () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)

  context('Setup', () => {
    it('Should create a model to test against', () => {
      models.CreateNewModel('z-whatsYourName')
    })
  })

  context('Entity and Actions', () => {
    it('Should create a simple text Entity called "name"', () => {
      entities.CreateNewEntity({ name: 'name' })
    })

    it('Should create a simple Action that expectes the "name" Entity as a user response', () => {
      actions.CreateNewActionThenVerifyInGrid({ response: common.whatsYourName, expectedEntities: ['name'] })
    })

    it('Should create another simple Action that says, "Hello $name"', () => {
      // NOTE: the {enter} in this call is necessary to triger the entity detection.
      actions.CreateNewActionThenVerifyInGrid({ response: 'Hello $name{enter}' })
    })
  })
  // Manually EXPORT this to fixtures folder and name it 'z-whatsYourName.cl'
})
