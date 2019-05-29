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

// This test suite is part 1 of 2. The second part is in ApiCreateMultipleExceptions.
describe('API Verify Multiple Exceptions - ErrorHandling', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)
  
  context('Setup', () => {
    it('Should import a model to test against and navigate to Train Dialogs view', () => {
      models.ImportModel('z-ApiMultExceptns', 'z-ApiMultExceptns.cl')
      modelPage.NavigateToTrainDialogs()
    })
  })

  context('Edit the Train Dialog to Verify the Errors Persisted', () => {
    it('Should edit the Train Dialog that was persisted', () => {
      train.EditTraining('This can be an entityError', 'An entityError shall go here as well', 'ExceptionAPI')

      // Bug 2137: Render Error appears to be lost when editing an existing Train Dialog
      // When this bug is fixed remove these comments and the line below.
      train.ClickReplayButton()
    })

    // Bug 2142: TEST BLOCKER - API Callback error rendering is different between original TD rendering and when editing a Train Dialog
    // Once this bug is fixed the calls to "VerifyCardChatMessage" will fail due to the first parameter needing to be changed.
    it('Should verify that all Bot responses persisted correctly', () => {
      train.VerifyTextChatMessage('ExceptionAPI: Hello with no exception', 1)
      train.VerifyCardChatMessage('Exception hit in Bot’s API Callback:ExceptionAPI', 'Error: ExceptionAPI: Logic Error', 3)
      train.VerifyTextChatMessage('ExceptionAPI: Hello with no exception', 5)
      train.VerifyCardChatMessage('Exception hit in Bot’s API Callback: ‘ExceptionAPI’', 'Error: ExceptionAPI: Render Error', 7)
      train.VerifyCardChatMessage('Exception hit in Bot’s API Callback:ExceptionAPI', 'Error: ExceptionAPI: Logic Error', 9)
      train.VerifyCardChatMessage('Exception hit in Bot’s API Callback: ‘ExceptionAPI’', 'Error: ExceptionAPI: Render Error', 11)
      train.VerifyTextChatMessage('ExceptionAPI: Hello with no exception', 13)
      train.VerifyTextChatMessage('ExceptionAPI: Hello with no exception', 15)
    })

    it('More to do here - waiting for fix for Bug 2136: API Errors not behaving like other errors', () => {
    })
  })
})
