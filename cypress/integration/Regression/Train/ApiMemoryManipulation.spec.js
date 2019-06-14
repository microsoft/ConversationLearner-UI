/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../../support/Models'
import * as modelPage from '../../../support/components/ModelPage'
import * as scorerModal from '../../../support/components/ScorerModal'
import * as train from '../../../support/Train'
import * as memoryTableComponent from '../../../support/components/MemoryTableComponent'
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

    it('Should invoke API Callbacks to move "anchovies" from "Toppings" to "OutOfStock" memory', () => {
      train.TypeYourMessage('I would like cheese, mushrooms, peppers, sausage, olives, and anchovies on a large pizza')
      train.LabelTextAsEntity('sausage', '+Toppings')
      train.LabelTextAsEntity('olives', '+Toppings')
      train.LabelTextAsEntity('anchovies', '+Toppings')
      train.LabelTextAsEntity('peppers', '+Toppings')
      train.LabelTextAsEntity('mushrooms', '+Toppings')
      train.LabelTextAsEntity('cheese', '+Toppings')
      train.ClickScoreActionsButton()
      memoryTableComponent.VerifyEntityValues('Toppings', ['cheese', 'mushrooms', 'peppers', 'sausage', 'olives'])
      memoryTableComponent.VerifyEntityValues('OutOfStock', ['anchovies'])
      train.SelectApiTextAction('OutOfStock', 'Sorry, we don’t have anchovies')
      // Why don't we see a deleted Entity here? Add a test for it once this bug is fixed...
      // Bug 2171: Inconsistent showing of API deleted entity values
      train.SelectTextAction('You have cheese, mushrooms, peppers, sausage and olives on your pizza.')
      train.SelectTextAction('Would you like anything else?')
    })

    it('Should invoke API Callbacks to move contents of "Toppings" to "LastToppings" and deletes content of "Toppings" Entity', () => {
      train.TypeYourMessage('That will be all for this pizza')
      train.ClickScoreActionsButton()
      train.SelectApiTextAction('FinalizeOrder', 'Your order is on its way')
      memoryTableComponent.VerifyEntityValues('LastToppings', ['cheese', 'mushrooms', 'peppers', 'sausage', 'olives'])
      memoryTableComponent.VerifyDeletedEntityValues('Toppings', ['cheese', 'mushrooms', 'peppers', 'sausage', 'olives'])
    })

    it('Should invoke API Callbacks to move contents of "LastToppings" back into "Toppings" and deletes content of "LastToppings', () => {
      train.TypeYourMessage('I want a second pizza')
      train.ClickScoreActionsButton()
      train.SelectApiCardAction('UseLastToppings', 'API Call:', 'UseLastToppings()')
      memoryTableComponent.VerifyEntityValues('Toppings', ['cheese', 'mushrooms', 'peppers', 'sausage', 'olives'])
      memoryTableComponent.VerifyDeletedEntityValues('LastToppings', ['cheese', 'mushrooms', 'peppers', 'sausage', 'olives'])
      train.SelectTextAction('You have cheese, mushrooms, peppers, sausage and olives on your pizza.')
      train.SelectTextAction('Would you like anything else?')
    })

    it('Should remove one of the toppings and verify the resulting list is correct', () => {
      train.TypeYourMessage('Leave off the sausage')
      train.LabelTextAsEntity('sausage', '-Toppings')
      train.ClickScoreActionsButton()
      memoryTableComponent.VerifyEntityValues('Toppings', ['cheese', 'mushrooms', 'peppers', 'olives'])
      memoryTableComponent.VerifyDisplacedEntityValues('Toppings', ['sausage'])
      train.SelectTextAction('You have cheese, mushrooms, peppers and olives on your pizza.')
      train.SelectTextAction('Would you like anything else?')
    })

    it('Should save the Train Dialog and verify it shows up in the grid', () => {
      train.SaveAsIsVerifyInGrid()
    })
  })
})