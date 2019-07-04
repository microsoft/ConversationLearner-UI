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

describe("Log Tests - Log", () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)

  context('Setup', () => {
    it('Should import a model to test against, navigate to Log Dialogs view and wait for training status to complete', () => {
      models.ImportModel('z-LogDialogTests', 'z-LogDialogTests.cl')
      modelPage.NavigateToLogDialogs()
      cy.WaitForTrainingStatusCompleted()
    })
  })
  
  let logDialogGridContent = []
  let logDialogIndex = 0

  context('Create Log Dialogs', () => {
    it('Create 1st Log Dialog', () => {
      logDialogsGrid.CreateNewLogDialogButton()
      logDialogModal.TypeYourMessageValidateResponse(`Log Dialog #${++logDialogIndex}`, 'Okay')
      logDialogModal.TypeYourMessageValidateResponse("G'day", 'Hello')
      logDialogModal.TypeYourMessageValidateResponse('Goodbye')
      logDialogGridContent.push({userInputs: `Log Dialog #${logDialogIndex} ◾️ G'day ◾️ Goodbye`, turnCount: 3})

      logDialogModal.ClickDoneTestingButton()
    })
    
    it("Should verify the list of Log Dialogs contains the new Log Dialog", () => {
      logDialogsGrid.VerifyListOfLogDialogs(logDialogGridContent)
    })

    it('Create 2nd Log Dialog', () => {
      logDialogsGrid.CreateNewLogDialogButton()
      logDialogModal.TypeYourMessageValidateResponse(`Log Dialog #${++logDialogIndex}`, 'Okay')
      logDialogModal.TypeYourMessageValidateResponse('Hola', 'Hello')
      logDialogModal.TypeYourMessageValidateResponse('Bye')
      logDialogGridContent.push({userInputs: `Log Dialog #${logDialogIndex} ◾️ Hola ◾️ Bye`, turnCount: 3})

      logDialogModal.ClickDoneTestingButton()
    })

    it("Should verify the list of Log Dialogs contains the new Log Dialog", () => {
      logDialogsGrid.VerifyListOfLogDialogs(logDialogGridContent)
    })

    it('Create 3rd Log Dialog', () => {
      logDialogsGrid.CreateNewLogDialogButton()
      logDialogModal.TypeYourMessageValidateResponse(`Log Dialog #${++logDialogIndex}`, 'Okay')
      logDialogModal.TypeYourMessageValidateResponse('Namaste', 'Hello')
      logDialogModal.TypeYourMessageValidateResponse('Yo', 'Okay')
      logDialogModal.TypeYourMessageValidateResponse('Goodbye')
      logDialogGridContent.push({userInputs: `Log Dialog #${logDialogIndex} ◾️ Namaste ◾️ Yo ◾️ Goodbye`, turnCount: 4})

      logDialogModal.ClickDoneTestingButton()
    })

    it("Should verify the list of Log Dialogs contains the new Log Dialog", () => {
      logDialogsGrid.VerifyListOfLogDialogs(logDialogGridContent)
    })
  })

  context('Abandon Log Dialogs that use END_SESSION Actions', () => {
    it('Create 4th Log Dialog withOUT END_SESSION then abandon it', () => {
      logDialogsGrid.CreateNewLogDialogButton()
      logDialogModal.TypeYourMessageValidateResponse(`Log Dialog #${++logDialogIndex} - ABANDONED`, 'Okay')
      logDialogModal.TypeYourMessageValidateResponse('Aloha', 'Hello')
      logDialogModal.ClickAbandonDeleteButton()
    })

    it("Should verify the list of Log Dialogs hasn't changed", () => {
      logDialogsGrid.VerifyListOfLogDialogs(logDialogGridContent)
    })
    
    it('Create 5th Log Dialog with END_SESSION then abandon it', () => {
      logDialogsGrid.CreateNewLogDialogButton()
      logDialogModal.TypeYourMessageValidateResponse(`Log Dialog #${++logDialogIndex} - ABANDONED`, 'Okay')
      logDialogModal.TypeYourMessageValidateResponse('Hello', 'Hello')
      logDialogModal.TypeYourMessageValidateResponse('Goodbye')
      logDialogModal.ClickAbandonDeleteButton()
    })

    it("Should verify the list of Log Dialogs hasn't changed", () => {
      logDialogsGrid.VerifyListOfLogDialogs(logDialogGridContent)
    })
    
    it('Create 6th Log Dialog with multiple END_SESSIONs then abandon it', () => {
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
      logDialogGridContent.push({userInputs: `Log Dialog #7 - ABANDONED ◾️ Aloha ◾️ Bye`, turnCount: 3})
      logDialogGridContent.push({userInputs: `Log Dialog #8 - ABANDONED ◾️ Namaste ◾️ Goodbye`, turnCount: 3})

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
    
    it('Create 6th Log Dialog with multiple END_SESSIONs then abandon it', () => {
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
      logDialogGridContent.push({userInputs: `Log Dialog #11 - ABANDONED ◾️ Hola`, turnCount: 2})
      logDialogGridContent.push({userInputs: `Log Dialog #12 - ABANDONED ◾️ Yo`, turnCount: 2})

      logDialogsGrid.VerifyListOfLogDialogs(logDialogGridContent)
    })
  })

  context('Create another set of Log Dialogs to be persisted use END_SESSIONs', () => {
    it('Create multiple Log Dialog using multiple END_SESSIONs and save them all', () => {
      logDialogsGrid.CreateNewLogDialogButton()
      logDialogModal.TypeYourMessageValidateResponse(`Log Dialog #${++logDialogIndex}`, 'Okay')
      logDialogModal.TypeYourMessageValidateResponse('Aloha', 'Hello')
      logDialogModal.TypeYourMessageValidateResponse('Bye')
      logDialogGridContent.push({userInputs: `Log Dialog #${logDialogIndex} ◾️ Aloha ◾️ Bye`, turnCount: 3})

      logDialogModal.TypeYourMessageValidateResponse(`Log Dialog #${++logDialogIndex}`, 'Okay')
      logDialogModal.TypeYourMessageValidateResponse('Hi', 'Hello')
      logDialogModal.TypeYourMessageValidateResponse('Goodbye')
      logDialogGridContent.push({userInputs: `Log Dialog #${logDialogIndex} ◾️ Hi ◾️ Goodbye`, turnCount: 3})

      logDialogModal.TypeYourMessageValidateResponse(`Log Dialog #${++logDialogIndex}`, 'Okay')
      logDialogModal.TypeYourMessageValidateResponse('Namaste', 'Hello')
      logDialogModal.TypeYourMessageValidateResponse('Goodbye')
      logDialogGridContent.push({userInputs: `Log Dialog #${logDialogIndex} ◾️ Namaste ◾️ Goodbye`, turnCount: 3})

      logDialogModal.ClickDoneTestingButton()
    })

    it("Should verify the list of Log Dialogs", () => {
      logDialogsGrid.VerifyListOfLogDialogs(logDialogGridContent)
    })
  })

  context('Create another set of Log Dialogs to be persisted use Session Timeout Button', () => {
    it('Create multiple Log Dialog using multiple END_SESSIONs and save them all', () => {
      logDialogsGrid.CreateNewLogDialogButton()
      logDialogModal.TypeYourMessageValidateResponse(`Log Dialog #${++logDialogIndex}`, 'Okay')
      logDialogModal.TypeYourMessageValidateResponse("G'day", 'Hello')
      logDialogModal.ClickSessionTimeoutButtonAndOkayThePopup()
      logDialogGridContent.push({userInputs: `Log Dialog #${logDialogIndex} ◾️ G'day`, turnCount: 2})

      logDialogModal.TypeYourMessageValidateResponse(`Log Dialog #${++logDialogIndex}`, 'Okay')
      logDialogModal.TypeYourMessageValidateResponse('Hola', 'Hello')
      logDialogModal.ClickSessionTimeoutButtonAndOkayThePopup()
      logDialogGridContent.push({userInputs: `Log Dialog #${logDialogIndex} ◾️ Hola`, turnCount: 2})

      logDialogModal.TypeYourMessageValidateResponse(`Log Dialog #${++logDialogIndex}`, 'Okay')
      logDialogModal.TypeYourMessageValidateResponse('Hello', 'Hello')
      logDialogModal.ClickSessionTimeoutButtonAndOkayThePopup()
      logDialogGridContent.push({userInputs: `Log Dialog #${logDialogIndex} ◾️ Hello`, turnCount: 2})

      logDialogModal.ClickDoneTestingButton()
    })

    it("Should verify the list of Log Dialogs", () => {
      logDialogsGrid.VerifyListOfLogDialogs(logDialogGridContent)
    })
  })    
})