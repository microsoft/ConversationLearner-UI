/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../../support/Models'
import * as entities from '../../../support/Entities'
import * as helpers from '../../../support/Helpers'

describe('All Entity Types 1 - CreateModels', () => {
  afterEach(() => helpers.SkipRemainingTestsOfSuiteIfFailed())

  context('Setup', () => {
    it('Should create a model to test against', () => {
      models.CreateNewModel('z-allEntityTypes1')
    })
  })

  context('Create Entities', () => {
    it('Should create a custom trained entity', () => {
      entities.CreateNewEntityThenVerifyInGrid({ type: 'Custom Trained', name: 'customTrainedEntity'})
    })

    it('Should create a custom trained multivalued entity', () => {
      entities.CreateNewEntityThenVerifyInGrid({ type: 'Custom Trained', name: 'multiValuedEntity', multiValued: true })
    })

    it('Should create a custom trained negatable entity', () => {
      entities.CreateNewEntityThenVerifyInGrid({ type: 'Custom Trained', name: 'negatableEntity', negatable: true })
    })

    it('Should create a custom trained multivalued and negatable entity', () => {
      entities.CreateNewEntityThenVerifyInGrid({ type: 'Custom Trained', name: 'multiValuedNegatableEntity', multiValued: true, negatable: true })
    })

    it('Should create a programmatic entity', () => {
      entities.CreateNewEntityThenVerifyInGrid({ type: 'Programmatic', name: 'programmaticEntity'})
    })

    it('Should create a programmatic entity', () => {
      entities.CreateNewEntityThenVerifyInGrid({ type: 'Programmatic', name: 'programmaticMultiValuedEntity', multiValued: true})
    })

    entities.pretrainedEntityTypes.forEach(entityType => { 
      it(`Should create the '${entityType}' pretrained entity type`, () => {
        entities.CreateNewEntityThenVerifyInGrid({ type: entityType, multiValued: false, expectPopup: true }) 
      })

      it(`Should create a custom trained entity with the '${entityType}' resolver type`, () => {
        entities.CreateNewEntityThenVerifyInGrid({ type: 'Custom Trained', name: `ct-${entityType}`, resolverType: entityType, multiValued: false, negatable: false }) 
      })
    })

    // Manually EXPORT this to fixtures folder and name it 'z-allEntityTypes1'
  })
})