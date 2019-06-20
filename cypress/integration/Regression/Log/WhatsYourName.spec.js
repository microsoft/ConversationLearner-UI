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

describe("What's Your Name - Log", () => {
  afterEach(() => helpers.SkipRemainingTestsOfSuiteIfFailed())

  context('Setup', () => {
    it('Should import a model to test against, navigate to Log Dialogs view and wait for training status to complete', () => {
      models.ImportModel('z-logMyName', 'z-learnedEntLabel.cl')
      modelPage.NavigateToLogDialogs()
      cy.WaitForTrainingStatusCompleted()
    })
  })

  context('Log Dialog', () => {
    it('Should create a new log dialog', () => {
      logDialogsGrid.CreateNewLogDialogButton()
    })
    
    it('Should say "Hello" and receive simple Bot response', () => {
      logDialogModal.TypeYourMessageValidateResponse('Hello', common.whatsYourName)
    })

    it(`Should say, "My name is Martha" and receive Bot response, "Hello Martha"`, () => {
      logDialogModal.TypeYourMessageValidateResponse('My name is Martha', 'Hello Martha')
    })
    
    it('Should complete the log dialog', () => {
      logDialogModal.ClickDoneTestingButton()
    })
  })
})