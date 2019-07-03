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

  context('Create Log Dialogs', () => {
    it('Create 1st Log Dialog', () => {
      logDialogsGrid.CreateNewLogDialogButton()
      logDialogModal.TypeYourMessageValidateResponse('1st Log Dialog', 'Okay')
      logDialogModal.TypeYourMessageValidateResponse("G'day", 'Hello')
      logDialogModal.TypeYourMessageValidateResponse("Goodbye")
      logDialogModal.ClickDoneTestingButton()
      logDialogsGrid.WaitForLogDialoGridUpdateToComplete(1)
      
      logDialogGridContent.push({userInputs: "1st Log Dialog ◾️ G'day ◾️ Goodbye", turnCount: 3})
    })
    
    it('Create 2nd Log Dialog', () => {
      logDialogsGrid.CreateNewLogDialogButton()
      logDialogModal.TypeYourMessageValidateResponse('2nd Log Dialog', 'Okay')
      logDialogModal.TypeYourMessageValidateResponse("Hola", 'Hello')
      logDialogModal.TypeYourMessageValidateResponse("Bye")
      logDialogModal.ClickDoneTestingButton()
      logDialogsGrid.WaitForLogDialoGridUpdateToComplete(2)

      logDialogGridContent.push({userInputs: '2nd Log Dialog ◾️ Hola ◾️ Bye', turnCount: 3})
    })

    it('Create 3rd Log Dialog', () => {
      logDialogsGrid.CreateNewLogDialogButton()
      logDialogModal.TypeYourMessageValidateResponse('3rd Log Dialog', 'Okay')
      logDialogModal.TypeYourMessageValidateResponse("Namaste", 'Hello')
      logDialogModal.TypeYourMessageValidateResponse('Yo', 'Okay')
      logDialogModal.TypeYourMessageValidateResponse("Goodbye")
      logDialogModal.ClickDoneTestingButton()
      logDialogsGrid.WaitForLogDialoGridUpdateToComplete(3)

      logDialogGridContent.push({userInputs: '3rd Log Dialog ◾️ Namaste ◾️ Yo ◾️ Goodbye', turnCount: 4})
    })
  })


  context('Verify Newly Created Log Dialogs', () => {
    it('Should verify the list of Log Dialogs', () => {
      logDialogsGrid.VerifyListOfLogDialogs(logDialogGridContent)
    })
    
    it('Should ', () => {
    })
  })

})