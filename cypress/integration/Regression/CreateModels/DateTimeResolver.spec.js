/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../../support/Models'
import * as entities from '../../../support/Entities'
import * as actions from '../../../support/Actions'
import * as common from '../../../support/Common'
import * as helpers from '../../../support/Helpers'

describe('Date Time Resolver - CreateModels', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)

  context('Setup', () => {
    it('Should create a model to test against', () => {
      models.CreateNewModel('z-dateTimeResolvr')
    })
  })

  context('Entities and Actions', () => {
    it('Create 2 datetimeV2 resolver type Entities', () => {
      entities.CreateNewEntityThenVerifyInGrid({ name: 'departure', resolverType: 'datetimeV2', expectPopup: true })
      entities.CreateNewEntityThenVerifyInGrid({ name: 'return', resolverType: 'datetimeV2' })
    })

    it('Should create an Action that requires both of our datetimeV2 Entities', () => {
      actions.CreateNewActionThenVerifyInGrid({ responseNameData: 'You are leaving on $departure{enter} and returning on $return{enter}', requiredEntities: ['departure', 'return'] })
    })
    
    it('Should create an Action that is disqualified by both of our datetimeV2 Entities', () => {
      actions.CreateNewActionThenVerifyInGrid({ responseNameData: 'When are you planning to travel?', disqualifyingEntities: ['departure', 'return'] })
    })
    // Manually EXPORT this to fixtures folder and name it 'z-dateTimeResolvr.cl'
  })
})