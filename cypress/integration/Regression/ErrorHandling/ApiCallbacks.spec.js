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

describe('API Callbacks - ErrorHandling', () => {
  afterEach(() => helpers.SkipRemainingTestsOfSuiteIfFailed())
  
  context('Setup', () => {
    it('Should import a model to test against and navigate to Train Dialogs view', () => {
      models.ImportModel('z-ApiCallbackErrs', 'z-ApiCallbacks.cl')
      modelPage.NavigateToTrainDialogs()
    })
  })

  context('Train Dialog', () => {
    it('Should create a new Train Dialog', () => {
      train.CreateNewTrainDialog()
    })

    it('Should invoke "BadCard" API Callback and verify it is in the chat pane', () => {
      train.TypeYourMessage('BadCard')
      train.ClickScoreActionsButton()
      train.SelectApiCardAction('BadCard', 'Malformed API Callback ‘BadCard’', 'Return value in Render function must be a string or BotBuilder Activity')
    })

    it('Should invoke "Malformed" API Callback and verify it is in the chat pane', () => {
      train.TypeYourMessage('Malformed')
      train.ClickScoreActionsButton()
      train.SelectApiCardAction('Malformed', 'Malformed API Callback: ‘Malformed’', 'Logic portion of callback returns a value, but no Render portion defined')
    })

    it('More to do here - waiting for fix for Bug 2136: API Errors not behaving like other errors', () => {
    })

    it('Should save the training and verify it is in the grid', () => {
      train.SaveAsIsVerifyInGrid()
    })
  })

  context('Edit the Train Dialog to Verify the Errors Persisted', () => {
    it('Should edit the Train Dialog that was persisted', () => {
      train.EditTraining('BadCard', 'Malformed', 'Malformed')

      // Bug 2137: Render Error appears to be lost when editing an existing Train Dialog
      // When this bug is fixed remove these comments and the line below.
      train.ClickReplayButton()
    })

    it('Should verify that all Bot responses persisted correctly', () => {
      train.VerifyCardChatMessage('Malformed API Callback ‘BadCard’', 'Return value in Render function must be a string or BotBuilder Activity', 1)
      train.VerifyCardChatMessage('Malformed API Callback: ‘Malformed’', 'Logic portion of callback returns a value, but no Render portion defined', 3)
    })
    
    it('Should abandon the edit', () => {
      train.AbandonDialog()
    })

    it('More to do here - waiting for fix for Bug 2136: API Errors not behaving like other errors', () => {
    })
  })
})
