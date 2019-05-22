/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../../support/Models'
import * as modelPage from '../../../support/components/ModelPage'
import * as memoryTableComponent from '../../../support/components/MemoryTableComponent'
import * as scorerModal from '../../../support/components/ScorerModal'
import * as train from '../../../support/Train'
import * as common from '../../../support/Common'
import * as helpers from '../../../support/Helpers'

// This "Expected Entity Labeling" test scenario is Part 1 and
// the "Learned Entity Labeling" test scenario is Part 2 in that 
// it continues from where this test case left off by using the
// model created by this test scenario.
describe('API Callbacks - Train', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)

  context('Setup', () => {
    it('Should import a model to test against and navigate to Train Dialogs view', () => {
      models.ImportModel('z-ApiCallbacks', 'z-ApiCallbacks.cl')
      modelPage.NavigateToTrainDialogs()
      cy.WaitForTrainingStatusCompleted()
    })
  })

  context('Train Dialog', () => {
    it('Should create a new Train Dialog', () => {
      train.CreateNewTrainDialog()
    })

    it('Should invoke "LogicWithNoArgs" API Callback and verify it is in the chat pane', () => {
      train.TypeYourMessage('LogicWithNoArgs')
      train.ClickScoreActionsButton()
      train.SelectApiCardAction('LogicWithNoArgs', 'API Call:', 'LogicWithNoArgs()')
    })

    it('Should invoke "LogicWithArgs" API Callback and verify it is in the chat pane', () => {
      train.TypeYourMessage('LogicWithArgs ThingOne and ThingTwo')
      train.LabelTextAsEntity('ThingOne', '1stArg')
      train.LabelTextAsEntity('ThingTwo', '2ndArg')
      train.ClickScoreActionsButton()
      train.SelectApiCardAction('LogicWithArgs', 'API Call:', 'LogicWithArgs(ThingOne,ThingTwo)')
    })

    it('Should invoke "RenderTheArgs" API Callback and verify it is in the chat pane', () => {
      train.TypeYourMessage('RenderTheArgs')
      train.ClickScoreActionsButton()
      train.SelectApiTextAction('RenderTheArgs', 'The Logic Args: ‘ThingOne’, ‘ThingTwo’, ‘333’, ‘4444’, ‘five’, ‘six’, ‘seven’The Render Args: ‘ThingOne’, ‘ThingTwo’, ‘three’, ‘four’, ‘55555’, ‘666666’, ‘7777777’')
    })

    it('Should invoke "TextCard" API Callback and verify it is in the chat pane', () => {
      train.TypeYourMessage('TextCard')
      train.ClickScoreActionsButton()
      train.SelectApiCardAction('TextCard', 'Greetings', 'Have a great day!')
    })

    it('Should save the training and verify it is in the grid', () => {
      train.SaveAsIsVerifyInGrid()
    })
  })
})