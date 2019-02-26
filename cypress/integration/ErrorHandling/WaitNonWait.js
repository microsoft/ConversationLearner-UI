/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const models = require('../../support/Models')
const modelPage = require('../../support/components/ModelPage')
const train = require('../../support/Train')
const editDialogModal = require('../../support/components/EditDialogModal')
const common = require('../../support/Common')

export function WaitNonWait()
{
  models.ImportModel('z-errWaitNoWait', 'z-waitNoWait.cl')
  modelPage.NavigateToTrainDialogs()
  cy.WaitForTrainingStatusCompleted()

  modelPage.VerifyNoErrorIconOnPage()

  train.EditTraining('Duck', 'Fish', common.fishJustSwim)
  editDialogModal.SelectChatTurnExactMatch(common.whichAnimalWouldYouLike)
  editDialogModal.ClickDeleteChatTurn()
  editDialogModal.VerifyErrorMessage(common.userInputFollowsNonWaitErrorMessage)

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
  Validations(1)

  editDialogModal.InsertBotResponseAfter('Duck', common.whichAnimalWouldYouLike)
  editDialogModal.VerifyErrorMessage(common.trainDialogHasErrorsMessage)

  Validations(2)

  editDialogModal.InsertBotResponseAfter('Fish', common.whichAnimalWouldYouLike)
  editDialogModal.VerifyErrorMessage(common.trainDialogHasErrorsMessage)

  Validations(3)

  editDialogModal.ClickSaveCloseButton()

  modelPage.VerifyErrorIconForTrainDialogs()
  train.VerifyErrorsFoundInTraining(`${String.fromCharCode(59412)}Duck`, 'Fish', common.fishJustSwim)

  // - - - Open the same Train Dialog, validate and fix the errors. - - -

  train.EditTraining(`${String.fromCharCode(59412)}Duck`, 'Fish', common.fishJustSwim)
  editDialogModal.VerifyErrorMessage(common.trainDialogHasErrorsMessage)

  Validations(3)

  editDialogModal.SelectChatTurnExactMatch(common.whichAnimalWouldYouLike, 1)
  editDialogModal.ClickDeleteChatTurn()
  editDialogModal.VerifyErrorMessage(common.trainDialogHasErrorsMessage)

  Validations(2)

  editDialogModal.SelectChatTurnExactMatch(common.whichAnimalWouldYouLike)
  editDialogModal.ClickDeleteChatTurn()
  editDialogModal.VerifyErrorMessage(common.trainDialogHasErrorsMessage)

  Validations(1)

  editDialogModal.SelectChatTurnExactMatch('Fish')
  editDialogModal.VerifyErrorMessage(common.userInputFollowsNonWaitErrorMessage)

  editDialogModal.InsertBotResponseAfter(common.ducksSayQuack, common.whichAnimalWouldYouLike)
  editDialogModal.VerifyNoErrorMessage()

  editDialogModal.ClickSaveCloseButton()
  modelPage.VerifyNoErrorIconOnPage()
}
