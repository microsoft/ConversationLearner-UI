/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../../support/Models'
import * as modelPage from '../../../support/components/ModelPage'
import * as chatPanel from '../../../support/components/ChatPanel'
import * as trainDialogsGrid from '../../../support/components/TrainDialogsGrid'
import * as train from '../../../support/Train'
import * as entityDetectionPanel from '../../../support/components/EntityDetectionPanel'
import * as logDialogsGrid from '../../../support/components/LogDialogsGrid'
import * as logDialogModal from '../../../support/components/LogDialogModal'
import * as helpers from '../../../support/Helpers'

describe("Save Edit Delete - Log", () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)

  let logDialogGridContent = []
  let logDialogIndex = 0

  context('Setup', () => {
    it('Should import a model to test against, navigate to Log Dialogs view and wait for training status to complete', () => {
      models.ImportModel('z-LogSaveEditDel', 'z-LogDialogTests.cl')
      modelPage.NavigateToLogDialogs()
      cy.WaitForTrainingStatusCompleted()
    })

    it("Should verify the list of Log Dialogs starts out empty", () => {
      logDialogsGrid.VerifyListOfLogDialogs(logDialogGridContent)
    })
  })
  
  context('Single Session Log Dialogs', () => {
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
  })

  context('Multi-Session Log Dialogs using END_SESSION', () => {
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

    // Bug 2395: New Log Dialogs that began after prior one was terminated by EndSession Actions do not show up in grid until user presses Refresh button
    // Verify that this bug still occurs
    // Once fixed, comment out this code and uncomment the next block
    it("Verify bug 2395 reproduces by verifying the list of Log Dialogs, refreshing, and then reverifying list again", () => {
      const buggyLogDialogGridContent = logDialogGridContent.slice(0,3)
      logDialogsGrid.VerifyListOfLogDialogs(buggyLogDialogGridContent)
      logDialogsGrid.ClickRefreshButton()
      logDialogsGrid.VerifyListOfLogDialogs(logDialogGridContent)
    })

    // Bug 2395: New Log Dialogs that began after prior one was terminated by EndSession Actions do not show up in grid until user presses Refresh button
    // Once the bug is fixed uncomment this block of code and comment out the block above.
    // it("Verify bug 2395 is fixed by verifying the list of Log Dialogs", () => {
    //   logDialogsGrid.VerifyListOfLogDialogs(logDialogGridContent)
    // })
  })

  context('Multi-Session Log Dialogs using "Session Timeout" Button', () => {
    it('Create multiple Log Dialog using multiple Session Timeouts and save them all', () => {
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

    // Bug 2395: New Log Dialogs that began after prior one was terminated by EndSession Actions do not show up in grid until user presses Refresh button
    // Verify that this bug still occurs
    // Once fixed, comment out this code and uncomment the next block
    it("Verify bug 2395 reproduces by verifying the list of Log Dialogs, refreshing, and then reverifying list again", () => {
      const buggyLogDialogGridContent = logDialogGridContent.slice(0,6)
      logDialogsGrid.VerifyListOfLogDialogs(buggyLogDialogGridContent)
      logDialogsGrid.ClickRefreshButton()
      logDialogsGrid.VerifyListOfLogDialogs(logDialogGridContent)
    })

    // Bug 2395: New Log Dialogs that began after prior one was terminated by EndSession Actions do not show up in grid until user presses Refresh button
    // Once the bug is fixed uncomment this block of code and comment out the block above.
    // it("Verify bug 2395 is fixed by verifying the list of Log Dialogs", () => {
    //   logDialogsGrid.VerifyListOfLogDialogs(logDialogGridContent)
    // })
  })

  context('Edit', () => {
    it('Edit Log Dialog to delete it', () => {
      logDialogsGrid.Edit("Log Dialog #1 ◾️ G'day ◾️ Goodbye")
      train.ClickAbandonDeleteButton()
      train.ClickConfirmDeleteLogDialogButton()
      logDialogGridContent.shift()
    })

    it("Should verify the Log Dialog was removed from the list of Log Dialogs", () => {
      logDialogsGrid.VerifyListOfLogDialogs(logDialogGridContent)
    })
    
    it('Edit Log Dialog to Add alternate input', () => {
      logDialogsGrid.Edit('Log Dialog #2 ◾️ Hola ◾️ Bye')
      chatPanel.SelectChatTurnExactMatch("Hola")
      entityDetectionPanel.TypeAlternativeInput('Howdy')
      train.ClickSubmitChangesButton()
      train.ClickSaveCloseButton()
      train.MergeSaveAsIs()
      logDialogGridContent.shift()
    })

    it("Should verify the Log Dialog was removed from the list of Log Dialogs", () => {
      logDialogsGrid.VerifyListOfLogDialogs(logDialogGridContent)
    })

    it("Should verify the Log Dialog was added to the list of Train Dialogs", () => {
      modelPage.NavigateToTrainDialogs()    
      trainDialogsGrid.VerifyListOfTrainDialogs([
        {firstInput: 'Log Dialog #2', lastInput: 'Bye', lastResponse: 'Goodbye'},
        {firstInput: 'Yo', lastInput: 'Bye', lastResponse: 'Goodbye'},
        {firstInput: '1st Log Dialog', lastInput: 'Goodbye', lastResponse: 'Goodbye'},
        {firstInput: 'Hi', lastInput: 'Bye', lastResponse: 'Goodbye'},
        {firstInput: 'Hi', lastInput: 'Bye', lastResponse: 'Goodbye'},
      ])
    })
  })
})