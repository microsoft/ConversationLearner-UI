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
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)
  
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

    it('More to do here - waiting for fix for Bug 2136: API Errors not behaving like other errors', () => {
    })

    it('Should save the training and verify it is in the grid', () => {
      train.SaveAsIsVerifyInGrid()
    })
  })

})
