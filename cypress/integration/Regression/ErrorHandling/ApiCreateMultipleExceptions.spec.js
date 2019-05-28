/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../../support/Models'
import * as modelPage from '../../../support/components/ModelPage'
import * as train from '../../../support/Train'
import * as trainDialogsGrid from '../../../support/components/TrainDialogsGrid'
import * as common from '../../../support/Common'
import * as actions from '../../../support/Actions'
import * as scorerModal from '../../../support/components/ScorerModal'
import * as helpers from '../../../support/Helpers'

// This test suite is part 1 of 2. The second part is in ApiVerifyMultipleExceptions.
describe('Exception Callback - ErrorHandling', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)
  
  context('Setup', () => {
    it('Should import a model to test against and navigate to Train Dialogs view', () => {
      models.ImportModel('z-ApiMultExceptns', 'z-ApiCallbacks.cl')
      modelPage.NavigateToTrainDialogs()
    })
  })

  context('Train Dialog that will be Discarded by an Error', () => {
    it('Should create a new Train Dialog', () => {
      train.CreateNewTrainDialog()
    })

    it('Should add a user turn to cause an error, dismiss the error and the TD and verify it returns to the TD grid pane view', () => {
      train.TypeYourMessage('This is an entityError')
      train.LabelTextAsEntity('entityError', 'entityError')
      train.ClickScoreActionsButton()
      train.VerifyErrorPopup("Error in Bot's EntityDetectionCallback:  An intentional error was invoked in the EntityDetectionCallback function.")
      train.ClickConfirmCancelOkButton()
      trainDialogsGrid.VerifyPageTitle()
    })
  })

  context('Train Dialog that will be Saved', () => {
    it('Should create a new Train Dialog', () => {
      train.CreateNewTrainDialog()
    })

    it('Should add a user turn, to be used later to cause an error, and verify it is in the chat pane', () => {
      train.TypeYourMessage('This can be an entityError')
      train.ClickScoreActionsButton()
      train.SelectApiTextAction('ExceptionAPI', 'ExceptionAPI: Hello with no exception')
    })

    it('Should add a logicError turn and verify it renders a card with an error message in the chat pane', () => {
      train.TypeYourMessage('This is a logicError')
      train.LabelTextAsEntity('logicError', '+logicError')
      train.ClickScoreActionsButton()
      train.SelectApiCardAction('ExceptionAPI', 'Exception hit in Bot’s API Callback: ‘ExceptionAPI’', 'Error: ExceptionAPI: Logic Error')
    })

    it('Should add a turn to remove the logicError and verify it renders a NON-error message', () => {
      train.TypeYourMessage('Remove the logicError')
      train.LabelTextAsEntity('logicError', '-logicError')
      train.ClickScoreActionsButton()
      train.SelectApiTextAction('ExceptionAPI', 'ExceptionAPI: Hello with no exception')
    })

    it('Should add a renderError turn and verify it renders a card with an error message in the chat pane', () => {
      train.TypeYourMessage('This will produce a renderError')
      train.LabelTextAsEntity('renderError', '+renderError')
      train.ClickScoreActionsButton()
      train.SelectApiCardAction('ExceptionAPI', 'Exception hit in Bot’s API Callback: ‘ExceptionAPI’', 'Error: ExceptionAPI: Render Error')
    })

    it('Should add a logicError turn again and verify the error message is for the logicError, not the renderError', () => {
      train.TypeYourMessage('This is a logicError')
      train.LabelTextAsEntity('logicError', '+logicError', false)
      train.ClickScoreActionsButton()
      train.SelectApiCardAction('ExceptionAPI', 'Exception hit in Bot’s API Callback: ‘ExceptionAPI’', 'Error: ExceptionAPI: Logic Error')
    })

    it('Should add a turn to remove the logicError and verify it renders the error message for renderError once again', () => {
      train.TypeYourMessage('Remove the logicError')
      train.LabelTextAsEntity('logicError', '-logicError', false)
      train.ClickScoreActionsButton()
      train.SelectApiCardAction('ExceptionAPI', 'Exception hit in Bot’s API Callback: ‘ExceptionAPI’', 'Error: ExceptionAPI: Render Error')
    })

    it('Should add a turn to remove the renderError and verify it renders a NON-error message', () => {
      train.TypeYourMessage('Clear out the renderError')
      train.LabelTextAsEntity('renderError', '-renderError')
      train.ClickScoreActionsButton()
      train.SelectApiTextAction('ExceptionAPI', 'ExceptionAPI: Hello with no exception')
    })

    it('Should add a user turn, to be used later to cause an error, and verify it is in the chat pane', () => {
      train.TypeYourMessage('An entityError shall go here as well')
      train.ClickScoreActionsButton()
      train.SelectApiTextAction('ExceptionAPI', 'ExceptionAPI: Hello with no exception')
    })

    it('More to do here - waiting for fix for Bug 2136: API Errors not behaving like other errors', () => {
    })

    it('Should save the training and verify it is in the grid', () => {
      train.SaveAsIsVerifyInGrid()
    })
  })
  
  // Manually EXPORT this to fixtures folder and name it 'z-ApiMultExceptns.cl'
})
