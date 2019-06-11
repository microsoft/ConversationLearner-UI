/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../../support/Models'
import * as modelPage from '../../../support/components/ModelPage'
import * as scorerModal from '../../../support/components/ScorerModal'
import * as train from '../../../support/Train'
import * as helpers from '../../../support/Helpers'

describe('API Memory Manipulation - Train', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)

  context('Setup', () => {
    it('Should import a model to test against', () => {
      models.ImportModel('z-ApiMemManip', 'z-ApiMemoryManipulation.cl')
    })
  })

  context('Train', () => {
    it('Should create a new Train Dialog', () => {
      modelPage.NavigateToTrainDialogs()
      train.CreateNewTrainDialog()
    })

    it('Should provide a round of turns that invokes API Callbacks to move "anchovies" from "Toppings" to "OutOfStock" memory', () => {
      train.TypeYourMessage('I would like cheese, mushrooms, peppers, sausage, olives, and anchovies on a large pizza')
      train.LabelTextAsEntity('sausage', 'Toppings')
      train.LabelTextAsEntity('olives', 'Toppings')
      train.LabelTextAsEntity('anchovies', 'Toppings')
      train.LabelTextAsEntity('peppers', 'Toppings')
      train.LabelTextAsEntity('mushrooms', 'Toppings')
      train.LabelTextAsEntity('cheese', 'Toppings')
      train.ClickScoreActionsButton()
      train.SelectApiCardAction('OutOfStock')
      train.SelectApiCardAction('You have cheese, mushrooms, peppers, sausage and olives on your pizza.')
      train.SelectApiCardAction('Would you like anything else?')
    })

    it('Should ', () => {
      train.TypeYourMessage('No thanks')
      train.ClickScoreActionsButton()
      train.SelectApiTextAction('FinalizeOrder')
    })

    it('Should ', () => {
    })

    it('Should ', () => {
    })

    it('Should ', () => {
    })

  })
})