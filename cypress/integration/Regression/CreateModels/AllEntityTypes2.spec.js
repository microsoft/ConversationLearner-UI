/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../../support/Models'
import * as entities from '../../../support/Entities'
import * as helpers from '../../../support/Helpers'

describe('All Entity Types 2 - CreateModels', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)

  context('Setup', () => {
    it('Should create a model to test against', () => {
      models.CreateNewModel('z-allEntityTypes2')
    })
  })

  // These tests differ from the tests in AllEntityTypes1 by reversing the order of creating the Entities
  // with resolver type and pretrained, along with adding an extra resolver type entity. The purpose is to
  // verify that we don't get the pop-up (after the first of that type) that says...
  //    Note: You must wait for training to complete before the new pre-trained Entity will be detected
  // Also we want to verify all combinations of multivalue and negatable resolver types can be created.
  context('Create Entities', () => {
    entities.pretrainedEntityTypes.forEach(entityType => { 
      it(`Should create two custom trained entities with the '${entityType}' resolver type`, () => {
        entities.CreateNewEntityThenVerifyInGrid({ type: 'Custom Trained', name: `ct-${entityType}1`, resolverType: entityType, multiValued: true, negatable: false, expectPopup: true }) 
        entities.CreateNewEntityThenVerifyInGrid({ type: 'Custom Trained', name: `ct-${entityType}2`, resolverType: entityType, multiValued: false, negatable: true }) 
      })

      it(`Should create the '${entityType}' pretrained entity type`, () => {
        entities.CreateNewEntityThenVerifyInGrid({ type: entityType, multiValued: true}) 
      })
    })

    // Manually EXPORT this to fixtures folder and name it 'z-allEntityTypes'
  })
})