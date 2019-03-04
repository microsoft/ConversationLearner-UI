/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../support/Models'
import * as modelPage from '../../support/components/ModelPage'
import * as train from '../../support/Train'
import * as editDialogModal from '../../support/components/EditDialogModal'
import * as common from '../../support/Common'
import * as helpers from '../../support/Helpers'

describe('Wait Non Wait Error Handling', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)
  
  it('Imports a model to test against and verifies no errors on Model page', () => {
    models.ImportModel('z-errWaitNoWait', 'z-waitNoWait.cl')
    modelPage.NavigateToTrainDialogs()
    cy.WaitForTrainingStatusCompleted()

    modelPage.VerifyNoErrorIconOnPage()
  })

  it('Deletes a user turn to create an error, verifies expected (and no other) error messages come up', () => {
    train.EditTraining('Duck', 'Fish', common.fishJustSwim)
    editDialogModal.SelectChatTurnExactMatch(common.whichAnimalWouldYouLike)
    editDialogModal.ClickDeleteChatTurn()
    editDialogModal.VerifyErrorMessage(common.userInputFollowsNonWaitErrorMessage)

    Validations(1)
  })

  it('Inserts an extra Bot response, verifies new error message and other error message remain', () => {
    editDialogModal.InsertBotResponseAfter('Duck', common.whichAnimalWouldYouLike)
    editDialogModal.VerifyErrorMessage(common.trainDialogHasErrorsMessage)

    Validations(2)
  })

  it('Inserts another Bot response, verifies new error message and other error messages remain', () => {
    editDialogModal.InsertBotResponseAfter('Fish', common.whichAnimalWouldYouLike)
    editDialogModal.VerifyErrorMessage(common.trainDialogHasErrorsMessage)

    Validations(3)
  })
  
  it('Saves the Training with Error, verifies Model page and Train Dialog grid shows an error', () => {
    editDialogModal.ClickSaveCloseButton()
    modelPage.VerifyErrorIconForTrainDialogs()
    train.VerifyErrorsFoundInTraining(`Duck`, 'Fish', common.fishJustSwim)
  })

  it('Re-opens the Training and validates all error messages remain', () => {
    train.EditTraining(`Duck`, 'Fish', common.fishJustSwim)
    editDialogModal.VerifyErrorMessage(common.trainDialogHasErrorsMessage)

    Validations(3)
  })

  it('Deletes one of the error causing turns, verifies an error went away & other error remained', () => {
    editDialogModal.SelectChatTurnExactMatch(common.whichAnimalWouldYouLike, 1)
    editDialogModal.ClickDeleteChatTurn()
    editDialogModal.VerifyErrorMessage(common.trainDialogHasErrorsMessage)

    Validations(2)
  })

  it('Deletes another error causing turn, verifies another error went away & still one error remains', () => {
    editDialogModal.SelectChatTurnExactMatch(common.whichAnimalWouldYouLike)
    editDialogModal.ClickDeleteChatTurn()
    editDialogModal.VerifyErrorMessage(common.trainDialogHasErrorsMessage)

    Validations(1)
  })

  it('Re-inserts the original user turn, verifies all errors are gone in dialog and on Model page', () => {
    editDialogModal.SelectChatTurnExactMatch('Fish')
    editDialogModal.VerifyErrorMessage(common.userInputFollowsNonWaitErrorMessage)

    editDialogModal.InsertBotResponseAfter(common.ducksSayQuack, common.whichAnimalWouldYouLike)
    editDialogModal.VerifyNoErrorMessage()

    editDialogModal.ClickSaveCloseButton()
    modelPage.VerifyNoErrorIconOnPage()
  })
})

function Validations(errCount) {
  cy.ConLog(`Validations(${errCount})`, `Start`)
  editDialogModal.SelectChatTurnExactMatch('Duck')
  editDialogModal.VerifyErrorMessage(common.trainDialogHasErrorsMessage)

  if (errCount > 1) {
    editDialogModal.SelectChatTurnExactMatch(common.whichAnimalWouldYouLike)
    editDialogModal.VerifyErrorMessage(common.trainDialogHasErrorsMessage)
  }

  editDialogModal.SelectChatTurnExactMatch(common.ducksSayQuack)
  if (errCount == 1) editDialogModal.VerifyErrorMessage(common.trainDialogHasErrorsMessage)
  else editDialogModal.VerifyErrorMessage(common.actionFollowsWaitActionErrorMessage)

  editDialogModal.SelectChatTurnExactMatch('Fish')
  editDialogModal.VerifyErrorMessage(common.userInputFollowsNonWaitErrorMessage)

  if (errCount > 2) {
    editDialogModal.SelectChatTurnExactMatch(common.whichAnimalWouldYouLike, 1)
    editDialogModal.VerifyErrorMessage(common.trainDialogHasErrorsMessage)
  }

  editDialogModal.SelectChatTurnExactMatch(common.fishJustSwim)
  if (errCount < 3) editDialogModal.VerifyErrorMessage(common.trainDialogHasErrorsMessage)
  else editDialogModal.VerifyErrorMessage(common.actionFollowsWaitActionErrorMessage)

  cy.ConLog(`Validations(${errCount})`, `End`)
}
