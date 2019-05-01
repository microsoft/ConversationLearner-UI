/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../../support/Models'
import * as entities from '../../../support/Entities'
import * as helpers from '../../../support/Helpers'

// Alternately return true or false.
// Starts out with different value depending on the day of the year.
// Can't do this with simple variables due to the way Javascript Closures works.
class FlipFlop {
  static Get(){
    if (FlipFlop.value === undefined) {
      FlipFlop.value = (Cypress.moment().dayOfYear() % 2 === 0)
    }
    else {
      FlipFlop.value = !FlipFlop.value
    }

    helpers.ConLog('FlipFlop', `value: ${FlipFlop.value}`)
    return FlipFlop.value
  }
}

describe('All Entity Types - CreateModels', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)

  context('Setup', () => {
    it('Should create a model to test against', () => {
      models.CreateNewModel('z-allEntityTypes')
    })
  })

  context('Create Entities', () => {
    it('Should create a custom trained entity', () => {
      entities.CreateNewEntity({ type: 'Custom Trained', name: 'customTrainedEntity'})
    })

    it('Should create a custom trained multivalued entity', () => {
      entities.CreateNewEntity({ type: 'Custom Trained', name: 'multiValuedEntity', multiValued: true })
    })

    it('Should create a custom trained negatable entity', () => {
      entities.CreateNewEntity({ type: 'Custom Trained', name: 'negatableEntity', negatable: true })
    })

    it('Should create a custom trained multivalued and negatable entity', () => {
      entities.CreateNewEntity({ type: 'Custom Trained', name: 'multiValuedNegatableEntity', multiValued: true, negatable: true })
    })

    it('Should create a programmatic entity', () => {
      entities.CreateNewEntity({ type: 'Programmatic', name: 'programmaticEntity'})
    })

    it('Should create a programmatic entity', () => {
      entities.CreateNewEntity({ type: 'Programmatic', name: 'programmaticMultiValuedEntity', multiValued: true})
    })

    // Alternate testing of multiValued and negatable on different days 
    // so that we test these in combination regularly.
    entities.pretrainedEntityTypes.forEach(entityType => { 
      it(`Should create the '${entityType}' pretrained entity type`, () => {
        entities.CreateNewEntity({ type: entityType, multiValued: FlipFlop.Get() }) 
      })

      it(`Should create a custom trained entity with the '${entityType}' resolver type`, () => {
        entities.CreateNewEntity({ type: 'Custom Trained', name: `ct-${entityType}`, resolverType: entityType, multiValued: FlipFlop.Get(), negatable: FlipFlop.Get() }) 
      })
    })

    // Manually EXPORT this to fixtures folder and name it 'z-allEntityTypes'
  })
})