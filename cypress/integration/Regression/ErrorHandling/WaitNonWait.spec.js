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

describe('Wait Non Wait Error Handling', () => {
  afterEach(() => helpers.SkipRemainingTestsOfSuiteIfFailed())
  
  it('Imports a model to test against and verifies no errors on Model page', () => {
    models.ImportModel('z-errWaitNoWait', 'z-waitNoWait.cl')
    modelPage.NavigateToTrainDialogs()
    cy.WaitForTrainingStatusCompleted()

    modelPage.VerifyNoIncidentTriangleOnPage()
  })
  
  context('Create Errors', () => {
    it('Deletes a user turn to create an error, verifies expected (and no other) error messages come up', () => {
      train.EditTraining('Duck', 'Fish', common.fishJustSwim)
      train.SelectChatTurnExactMatch(common.whichAnimalWouldYouLike)
      train.ClickDeleteChatTurn()
      train.VerifyErrorMessage(common.userInputFollowsNonWaitErrorMessage)

      Validations(1)
    })

    it('Inserts an extra Bot response, verifies new error message and other error message remain', () => {
      train.InsertBotResponseAfter('Duck', common.whichAnimalWouldYouLike)
      train.VerifyErrorMessage(common.trainDialogHasErrorsMessage)

      Validations(2)
    })

    it('Inserts another Bot response, verifies new error message and other error messages remain', () => {
      train.InsertBotResponseAfter('Fish', common.whichAnimalWouldYouLike)
      train.VerifyErrorMessage(common.trainDialogHasErrorsMessage)

      Validations(3)
    })
  })

  context(`SaveAsIsVerifyInGrid & Validate Training Errors`, () => {
    it('Saves the Training with Errors, verifies Model page and Train Dialog grid shows an error', () => {
      train.ClickSaveCloseButton()
      modelPage.VerifyIncidentTriangleForTrainDialogs()
      trainDialogsGrid.VerifyIncidentTriangleFoundInTrainDialogsGrid(`Duck`, 'Fish', common.fishJustSwim)
    })

    it('Re-opens the Training and validates all error messages remain', () => {
      train.EditTraining(`Duck`, 'Fish', common.fishJustSwim)
      train.VerifyErrorMessage(common.trainDialogHasErrorsMessage)

      Validations(3)
    })
  })

  context('Correct the Errors', () => {
    it('Deletes one of the error causing turns, verifies an error went away & other error remained', () => {
      train.SelectChatTurnExactMatch(common.whichAnimalWouldYouLike, 1)
      train.ClickDeleteChatTurn()
      train.VerifyErrorMessage(common.trainDialogHasErrorsMessage)

      Validations(2)
    })

    it('Deletes another error causing turn, verifies another error went away & still one error remains', () => {
      train.SelectChatTurnExactMatch(common.whichAnimalWouldYouLike)
      train.ClickDeleteChatTurn()
      train.VerifyErrorMessage(common.trainDialogHasErrorsMessage)

      Validations(1)
    })

    it('Re-inserts the original user turn, verifies all errors are gone in dialog and on Model page', () => {
      train.SelectChatTurnExactMatch('Fish')
      train.VerifyErrorMessage(common.userInputFollowsNonWaitErrorMessage)

      train.InsertBotResponseAfter(common.ducksSayQuack, common.whichAnimalWouldYouLike)
      train.VerifyNoErrorMessage()

      train.ClickSaveCloseButton()
      modelPage.VerifyNoIncidentTriangleOnPage()
    })
  })
})

function Validations(errCount) {
  cy.ConLog(`Validations(${errCount})`, `Start`)
  train.SelectChatTurnExactMatch('Duck')
  train.VerifyErrorMessage(common.trainDialogHasErrorsMessage)

  if (errCount > 1) {
    train.SelectChatTurnExactMatch(common.whichAnimalWouldYouLike)
    train.VerifyErrorMessage(common.trainDialogHasErrorsMessage)
  }

  train.SelectChatTurnExactMatch(common.ducksSayQuack)
  if (errCount == 1) train.VerifyErrorMessage(common.trainDialogHasErrorsMessage)
  else train.VerifyErrorMessage(common.actionFollowsWaitActionErrorMessage)

  train.SelectChatTurnExactMatch('Fish')
  train.VerifyErrorMessage(common.userInputFollowsNonWaitErrorMessage)

  if (errCount > 2) {
    train.SelectChatTurnExactMatch(common.whichAnimalWouldYouLike, 1)
    train.VerifyErrorMessage(common.trainDialogHasErrorsMessage)
  }

  train.SelectChatTurnExactMatch(common.fishJustSwim)
  if (errCount < 3) train.VerifyErrorMessage(common.trainDialogHasErrorsMessage)
  else train.VerifyErrorMessage(common.actionFollowsWaitActionErrorMessage)

  cy.ConLog(`Validations(${errCount})`, `End`)
}
