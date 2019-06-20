/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../../support/Models'
import * as modelPage from '../../../support/components/ModelPage'
import * as train from '../../../support/Train'
import * as trainDialogsGrid from '../../../support/components/TrainDialogsGrid'
import * as common from '../../../support/Common'
import * as helpers from '../../../support/Helpers'

describe('Two Consecutive User Inputs - ErrorHandling', () => {
  afterEach(() => helpers.SkipRemainingTestsOfSuiteIfFailed())

  context('Setup', () => {
    it('Should import a model and wait for training to complete', () => {
      models.ImportModel('z-2UserInputs', 'z-disqualifyngEnt.Trained.cl')
      modelPage.NavigateToTrainDialogs()
      cy.WaitForTrainingStatusCompleted()
    })
  })

  context('Edit Train Dialog - Create Errors', () => {
    it('Verify there are no Incident Triangles on the page', () => {
      modelPage.VerifyNoIncidentTriangleOnPage()
    })

    it('Should create an error and verify the general error message shows up', () => {
      train.EditTraining('Hey', 'world peace', "Sorry $name, I can't help you get $want")
      train.InsertUserInputAfter('Sam', 'InsertedText')
      train.VerifyErrorMessage(common.trainDialogHasErrorsMessage)
    })

    it('Should select the chat turn containing the error and validate the specific error message', () => {
      train.SelectChatTurnExactMatch('Sam')
      train.VerifyErrorMessage('Two consecutive User Inputs')
    })

    it('Should save the Train Dialog and verify the errors show up in the grid', () => {
      train.ClickSaveCloseButton()
      modelPage.VerifyIncidentTriangleForTrainDialogs()
      trainDialogsGrid.VerifyIncidentTriangleFoundInTrainDialogsGrid(`Hey`, 'world peace', "Sorry $name, I can't help you get $want")
    })
  })

  context('Edit Train Dialog - Re-Verify the Errors and Fix Them', () => {
    it('Should edit the Train Dialog and verify the errors still exist', () => {
      train.EditTraining(`Hey`, 'world peace', "Sorry $name, I can't help you get $want")
      train.VerifyErrorMessage(common.trainDialogHasErrorsMessage)
      train.SelectChatTurnExactMatch('Sam')
      train.VerifyErrorMessage('Two consecutive User Inputs')
    })

    it('Should fix the error and verify that all error messages are gone', () => {
      train.SelectChatTurnExactMatch('InsertedText')
      train.ClickDeleteChatTurn()
      train.VerifyNoErrorMessage()
    })

    it('Should save the Train Dialog and verify that all error messages are gone from the grid', () => {
      train.ClickSaveCloseButton()
      modelPage.VerifyNoIncidentTriangleOnPage()
    })
  })
})