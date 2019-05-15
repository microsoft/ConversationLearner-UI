/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../../support/Models'
import * as entities from '../../../support/Entities'
import * as actions from '../../../support/Actions'
import * as helpers from '../../../support/Helpers'

describe('All Entity Types - CreateModels', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)

  context('Setup', () => {
    it('Should create a model to test against', () => {
      models.CreateNewModel('z-allEntityTypes')
    })
  })

  context('Create Entities', () => {
    it('Should create custom trained entities that will be used by the API Callbacks', () => {
      entities.CreateNewEntity({ type: 'Custom Trained', name: '1stArg'})
      entities.CreateNewEntity({ type: 'Custom Trained', name: '2ndArg'})
      entities.CreateNewEntity({ type: 'Custom Trained', name: 'entityError'})
      entities.CreateNewEntity({ type: 'Custom Trained', name: 'logicError'})
      entities.CreateNewEntity({ type: 'Custom Trained', name: 'renderError'})
    })
  })

  context('Create Actions', () => {
    it('Should create Action', () => {
      actions.CreateNewActionThenVerifyInGrid({ type: 'API', response: common.whatsYourName, expectedEntities: ['name'], disqualifyingEntities: ['name'] })
    })

    it('Should create Action', () => {
    })
    it('Should create Action', () => {
    })
    it('Should create Action', () => {
    })
    it('Should create Action', () => {
    })
  })
})