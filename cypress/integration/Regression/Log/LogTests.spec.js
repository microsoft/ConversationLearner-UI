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

  context('Create Log Dialogs', () => {
    it('1st Log Dialog', () => {
      logDialogsGrid.CreateNewLogDialogButton()
      logDialogModal.TypeYourMessageValidateResponse('1st Log Dialog', 'Okay')
      logDialogModal.TypeYourMessageValidateResponse("G'day", 'Hello')
      logDialogModal.TypeYourMessageValidateResponse("Goodbye")
      logDialogModal.ClickDoneTestingButton()
    })
    
    it('Should ', () => {
    })
  })

  context('Verify Existing Log Dialogs', () => {
    it('Should verify the list of Log Dialogs', () => {
      logDialogsGrid.VerifyListOfLogDialogs([
        {userInputs: "1st Log Dialog ◾️ G'day ◾️ Goodbye", turnCount: 3},
        // {userInputs: 'Yo ◾️ 2nd Log Dialog ◾️ Bye', turnCount: 3},
        // {userInputs: 'Hi Yo ◾️ 3rd Log Dialog ◾️ Yo Hi ◾️ Goodbye', turnCount: 4},
      ])
    })
    
    it('Should ', () => {
    })
  })

})