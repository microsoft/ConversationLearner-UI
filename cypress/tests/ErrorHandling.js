/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const models = require('../support/Models')
const modelPage = require('../support/components/ModelPage')
const scorerModal = require('../support/components/ScorerModal')
const train = require('../support/Train')
const editDialogModal = require('../support/components/EditDialogModal')
const common = require('../support/Common')

const trainDialogHasErrorsMessage = 'This Train Dialog has errors that must be fixed before it can be used to train your model'
const actionFollowsWaitActionErrorMessage = 'Action follows a Wait Action'
const userInputFollowsNonWaitErrorMessage = 'User Input following a non-Wait Action'

Cypress.TestCase('EditAndBranching', 'Two Consecutive User Input Error Handling', TwoConsecutiveUserInputErrorHandling)
export function TwoConsecutiveUserInputErrorHandling()
{
  models.ImportModel('z-2UserInputs', 'z-disqualifyngEnt.Trained.cl')
  modelPage.NavigateToTrainDialogs()
  cy.WaitForTrainingStatusCompleted()

  modelPage.VerifyNoErrorIconOnPage()

  train.EditTraining('Hey', 'world peace', "Sorry $name, I can't help you get $want")
  editDialogModal.InsertUserInputAfter('Sam', 'InsertedText')
  editDialogModal.VerifyErrorMessage(trainDialogHasErrorsMessage)
  editDialogModal.SelectChatTurn('Sam')
  editDialogModal.VerifyErrorMessage('Two consecutive User Inputs')

  editDialogModal.ClickSaveCloseButton()

  modelPage.VerifyErrorIconForTrainDialogs()
  train.VerifyErrorsFoundInTraining(`${String.fromCharCode(59412)}Hey`, 'world peace', "Sorry $name, I can't help you get $want")

  // - - - Open the same Train Dialog, validate and fix the errors. - - -

  train.EditTraining(`${String.fromCharCode(59412)}Hey`, 'world peace', "Sorry $name, I can't help you get $want")
  editDialogModal.VerifyErrorMessage(trainDialogHasErrorsMessage)
  editDialogModal.SelectChatTurn('Sam')
  editDialogModal.VerifyErrorMessage('Two consecutive User Inputs')
  editDialogModal.SelectChatTurn('InsertedText')
  editDialogModal.ClickDeleteChatTurn()
  editDialogModal.VerifyNoErrorMessage()

  editDialogModal.ClickSaveCloseButton()
  modelPage.VerifyNoErrorIconOnPage()
}

Cypress.TestCase('EditAndBranching', 'Wait Non Wait Error Handling', WaitNonWaitErrorHandling)
export function WaitNonWaitErrorHandling()
{
  models.ImportModel('z-errWaitNoWait', 'z-waitNoWait.cl')
  modelPage.NavigateToTrainDialogs()
  cy.WaitForTrainingStatusCompleted()

  modelPage.VerifyNoErrorIconOnPage()

  train.EditTraining('Duck', 'Fish', common.fishJustSwim)
  editDialogModal.SelectChatTurn(common.whichAnimalWouldYouLike)
  editDialogModal.ClickDeleteChatTurn()
  editDialogModal.VerifyErrorMessage(userInputFollowsNonWaitErrorMessage)

  function Validations(errCount) {
    cy.ConLog(`Validations(${errCount})`, `Start`)
    editDialogModal.SelectChatTurn('Duck')
    editDialogModal.VerifyErrorMessage(trainDialogHasErrorsMessage)

    if (errCount > 1) {
      editDialogModal.SelectChatTurn(common.whichAnimalWouldYouLike)
      editDialogModal.VerifyErrorMessage(trainDialogHasErrorsMessage)
    }

    editDialogModal.SelectChatTurn(common.ducksSayQuack)
    if (errCount == 1) editDialogModal.VerifyErrorMessage(trainDialogHasErrorsMessage)
    else editDialogModal.VerifyErrorMessage(actionFollowsWaitActionErrorMessage)

    editDialogModal.SelectChatTurn('Fish')
    editDialogModal.VerifyErrorMessage(userInputFollowsNonWaitErrorMessage)

    if (errCount > 2) {
      editDialogModal.SelectChatTurn(common.whichAnimalWouldYouLike, 1)
      editDialogModal.VerifyErrorMessage(trainDialogHasErrorsMessage)
    }

    editDialogModal.SelectChatTurn(common.fishJustSwim)
    if (errCount < 3) editDialogModal.VerifyErrorMessage(trainDialogHasErrorsMessage)
    else editDialogModal.VerifyErrorMessage(actionFollowsWaitActionErrorMessage)

    cy.ConLog(`Validations(${errCount})`, `End`)
  }
  Validations(1)

  editDialogModal.InsertBotResponseAfter('Duck', common.whichAnimalWouldYouLike)
  editDialogModal.VerifyErrorMessage(trainDialogHasErrorsMessage)

  Validations(2)

  editDialogModal.InsertBotResponseAfter('Fish', common.whichAnimalWouldYouLike)
  editDialogModal.VerifyErrorMessage(trainDialogHasErrorsMessage)

  Validations(3)

  editDialogModal.ClickSaveCloseButton()

  modelPage.VerifyErrorIconForTrainDialogs()
  train.VerifyErrorsFoundInTraining(`${String.fromCharCode(59412)}Duck`, 'Fish', common.fishJustSwim)

  // - - - Open the same Train Dialog, validate and fix the errors. - - -

  train.EditTraining(`${String.fromCharCode(59412)}Duck`, 'Fish', common.fishJustSwim)
  editDialogModal.VerifyErrorMessage(trainDialogHasErrorsMessage)

  Validations(3)

  editDialogModal.SelectChatTurn(common.whichAnimalWouldYouLike, 1)
  editDialogModal.ClickDeleteChatTurn()
  editDialogModal.VerifyErrorMessage(trainDialogHasErrorsMessage)

  Validations(2)

  editDialogModal.SelectChatTurn(common.whichAnimalWouldYouLike)
  editDialogModal.ClickDeleteChatTurn()
  editDialogModal.VerifyErrorMessage(trainDialogHasErrorsMessage)

  Validations(1)

  editDialogModal.SelectChatTurn('Fish')
  editDialogModal.VerifyErrorMessage(userInputFollowsNonWaitErrorMessage)

  editDialogModal.InsertBotResponseAfter(common.ducksSayQuack, common.whichAnimalWouldYouLike)
  editDialogModal.VerifyNoErrorMessage()

  editDialogModal.ClickSaveCloseButton()
  modelPage.VerifyNoErrorIconOnPage()
}

Cypress.TestCase('EditAndBranching', 'Action Unavailable Error Handling', ActionUnavailableErrorHandling)
export function ActionUnavailableErrorHandling()
{
  models.ImportModel('z-actionUnavail', 'z-whatsYourName.cl')
  modelPage.NavigateToTrainDialogs()
  cy.WaitForTrainingStatusCompleted()

  modelPage.VerifyNoErrorIconOnPage()

  train.CreateNewTrainDialog()

  train.TypeYourMessage('Joe')
  editDialogModal.LabelTextAsEntity('Joe', 'name')
  editDialogModal.ClickScoreActionsButton()
  train.SelectAction('Hello Joe')

  editDialogModal.RemoveEntityLabel('Joe', 'name')
  editDialogModal.ClickSubmitChangesButton()
  
  train.Save()


  train.EditTraining('Hey', 'world peace', "Sorry $name, I can't help you get $want")
  editDialogModal.InsertUserInputAfter('Sam', 'InsertedText')
  editDialogModal.VerifyErrorMessage(trainDialogHasErrorsMessage)
  editDialogModal.SelectChatTurn('Sam')
  editDialogModal.VerifyErrorMessage('Two consecutive User Inputs')

  editDialogModal.ClickSaveCloseButton()

  modelPage.VerifyErrorIconForTrainDialogs()
  train.VerifyErrorsFoundInTraining(`${String.fromCharCode(59412)}Hey`, 'world peace', "Sorry $name, I can't help you get $want")

  // - - - Open the same Train Dialog, validate and fix the errors. - - -

  train.EditTraining(`${String.fromCharCode(59412)}Hey`, 'world peace', "Sorry $name, I can't help you get $want")
  editDialogModal.VerifyErrorMessage(trainDialogHasErrorsMessage)
  editDialogModal.SelectChatTurn('Sam')
  editDialogModal.VerifyErrorMessage('Two consecutive User Inputs')
  editDialogModal.SelectChatTurn('InsertedText')
  editDialogModal.ClickDeleteChatTurn()
  editDialogModal.VerifyNoErrorMessage()

  editDialogModal.ClickSaveCloseButton()
  modelPage.VerifyNoErrorIconOnPage()
}
