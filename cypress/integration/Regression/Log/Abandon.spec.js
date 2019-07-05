/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../../support/Models'
import * as modelPage from '../../../support/components/ModelPage'
import * as logDialogsGrid from '../../../support/components/LogDialogsGrid'
import * as logDialogModal from '../../../support/components/LogDialogModal'
import * as common from '../../../support/Common'
import * as helpers from '../../../support/Helpers'

describe("Abandon - Log", () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)

  let logDialogGridContent = []
  let logDialogIndex = 0

  context('Setup', () => {
    it('Should import a model to test against, navigate to Log Dialogs view and wait for training status to complete', () => {
      models.ImportModel('z-LogDialogAbandn', 'z-LogDialogTests.cl')
      modelPage.NavigateToLogDialogs()
      cy.WaitForTrainingStatusCompleted()
    })

    it("Should verify the list of Log Dialogs starts out empty", () => {
      logDialogsGrid.VerifyListOfLogDialogs(logDialogGridContent)
    })
  })
  
  context('Abandon a Log Dialog', () => {
    it('Create Log Dialog without END_SESSION then abandon it', () => {
      logDialogsGrid.CreateNewLogDialogButton()
      logDialogModal.TypeYourMessageValidateResponse(`Log Dialog #${++logDialogIndex} - ABANDONED`, 'Okay')
      logDialogModal.TypeYourMessageValidateResponse('Aloha', 'Hello')
      logDialogModal.ClickAbandonDeleteButton()
    })

    it("Should verify the list of Log Dialogs hasn't changed", () => {
      logDialogsGrid.VerifyListOfLogDialogs(logDialogGridContent)
    })
  })

  context('Abandon Log Dialogs - use END_SESSION Actions', () => {
    it('Create Log Dialog with END_SESSION then abandon it', () => {
      logDialogsGrid.CreateNewLogDialogButton()
      logDialogModal.TypeYourMessageValidateResponse(`Log Dialog #${++logDialogIndex} - ABANDONED`, 'Okay')
      logDialogModal.TypeYourMessageValidateResponse('Hello', 'Hello')
      logDialogModal.TypeYourMessageValidateResponse('Goodbye')
      logDialogModal.ClickAbandonDeleteButton()
    })

    it("Should verify the list of Log Dialogs hasn't changed", () => {
      logDialogsGrid.VerifyListOfLogDialogs(logDialogGridContent)
    })
    
    it('Create Log Dialog with multiple END_SESSIONs then abandon it', () => {
      logDialogsGrid.CreateNewLogDialogButton()
      logDialogModal.TypeYourMessageValidateResponse(`Log Dialog #${++logDialogIndex} - ABANDONED`, 'Okay')
      logDialogModal.TypeYourMessageValidateResponse('Hi', 'Hello')
      logDialogModal.TypeYourMessageValidateResponse('Goodbye')

      logDialogModal.TypeYourMessageValidateResponse(`Log Dialog #${++logDialogIndex} - ABANDONED`, 'Okay')
      logDialogModal.TypeYourMessageValidateResponse('Aloha', 'Hello')
      logDialogModal.TypeYourMessageValidateResponse('Bye')

      logDialogModal.TypeYourMessageValidateResponse(`Log Dialog #${++logDialogIndex} - ABANDONED`, 'Okay')
      logDialogModal.TypeYourMessageValidateResponse('Namaste', 'Hello')
      logDialogModal.TypeYourMessageValidateResponse('Goodbye')

      logDialogModal.ClickAbandonDeleteButton()
    })

    it("Should verify the list of Log Dialogs hasn't changed", () => {
      logDialogsGrid.VerifyListOfLogDialogs(logDialogGridContent)
    })

    it("Should use the Refresh button and re-verify the list of Log Dialogs hasn't changed", () => {
      logDialogsGrid.ClickRefreshButton()
      
      // Bug 2111: Abandoning Log Dialog with multiple End Sessions followed by the same except saving it resurrects an abandoned Log Dialog Session
      // Remove this block of code once this bug is fixed.
      logDialogGridContent.push({userInputs: `Log Dialog #4 - ABANDONED ◾️ Aloha ◾️ Bye`, turnCount: 3})
      logDialogGridContent.push({userInputs: `Log Dialog #5 - ABANDONED ◾️ Namaste ◾️ Goodbye`, turnCount: 3})

      logDialogsGrid.VerifyListOfLogDialogs(logDialogGridContent)
    })
  })

  context('Abandon Log Dialogs that use the "Session Timeout" button', () => {
    it('Create a Log Dialog, use the "Session Timeout" button, then abandon it', () => {
      logDialogsGrid.CreateNewLogDialogButton()
      logDialogModal.TypeYourMessageValidateResponse(`Log Dialog #${++logDialogIndex} - ABANDONED`, 'Okay')
      logDialogModal.TypeYourMessageValidateResponse('Hi', 'Hello')
      logDialogModal.ClickSessionTimeoutButtonAndOkayThePopup()
      logDialogModal.ClickAbandonDeleteButton()
    })

    it("Should verify the list of Log Dialogs hasn't changed", () => {
      logDialogsGrid.VerifyListOfLogDialogs(logDialogGridContent)
    })
    
    it('Create Log Dialog with multiple "Session Timeouts" then abandon it', () => {
      logDialogsGrid.CreateNewLogDialogButton()
      logDialogModal.TypeYourMessageValidateResponse(`Log Dialog #${++logDialogIndex} - ABANDONED`, 'Okay')
      logDialogModal.TypeYourMessageValidateResponse('Hello', 'Hello')
      logDialogModal.ClickSessionTimeoutButtonAndOkayThePopup()

      logDialogModal.TypeYourMessageValidateResponse(`Log Dialog #${++logDialogIndex} - ABANDONED`, 'Okay')
      logDialogModal.TypeYourMessageValidateResponse('Hola', 'Hello')
      logDialogModal.ClickSessionTimeoutButtonAndOkayThePopup()

      logDialogModal.TypeYourMessageValidateResponse(`Log Dialog #${++logDialogIndex} - ABANDONED`, 'Okay')
      logDialogModal.TypeYourMessageValidateResponse('Yo', 'Okay')
      logDialogModal.ClickSessionTimeoutButtonAndOkayThePopup()

      logDialogModal.ClickAbandonDeleteButton()
    })

    it("Should verify the list of Log Dialogs hasn't changed", () => {
      logDialogsGrid.VerifyListOfLogDialogs(logDialogGridContent)
    })

    it("Should use the Refresh button and re-verify the list of Log Dialogs hasn't changed", () => {
      logDialogsGrid.ClickRefreshButton()
      
      // Bug 2111: Abandoning Log Dialog with multiple End Sessions followed by the same except saving it resurrects an abandoned Log Dialog Session
      // Remove this block of code once this bug is fixed.
      logDialogGridContent.push({userInputs: `Log Dialog #8 - ABANDONED ◾️ Hola`, turnCount: 2})
      logDialogGridContent.push({userInputs: `Log Dialog #9 - ABANDONED ◾️ Yo`, turnCount: 2})

      logDialogsGrid.VerifyListOfLogDialogs(logDialogGridContent)
    })
  })

  context('Save a Log Dialog to confirm prior Abandons have no affect on it', () => {
    it('Create a Log Dialog and save it', () => {
      logDialogsGrid.CreateNewLogDialogButton()
      logDialogModal.TypeYourMessageValidateResponse(`Log Dialog #${++logDialogIndex}`, 'Okay')
      logDialogModal.TypeYourMessageValidateResponse('Hi', 'Hello')
      logDialogGridContent.push({userInputs: `Log Dialog #${logDialogIndex} ◾️ Hi`, turnCount: 2})

      logDialogModal.ClickDoneTestingButton()
    })

    it("Should verify the list of Log Dialogs has the one we saved", () => {
      logDialogsGrid.VerifyListOfLogDialogs(logDialogGridContent)
    })
  })    
})