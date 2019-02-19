/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const models = require('../support/Models')
const modelPage = require('../support/components/ModelPage')
const train = require('../support/Train')
const editDialogModal = require('../support/components/EditDialogModal')
const common = require('../support/Common')
const actions = require('../support/Actions')
const scorerModal = require('../support/components/ScorerModal')

const trainDialogHasErrorsMessage = 'This Train Dialog has errors that must be fixed before it can be used to train your model'
const actionFollowsWaitActionErrorMessage = 'Action follows a Wait Action'
const userInputFollowsNonWaitErrorMessage = 'User Input following a non-Wait Action'
const gonnaDeleteAnAction = 'Gonna Delete an Action'

Cypress.TestCase('ErrorHandling', 'Two Consecutive User Input Error Handling', TwoConsecutiveUserInputErrorHandling)
export function TwoConsecutiveUserInputErrorHandling()
{
  models.ImportModel('z-2UserInputs', 'z-disqualifyngEnt.Trained.cl')
  modelPage.NavigateToTrainDialogs()
  cy.WaitForTrainingStatusCompleted()

  modelPage.VerifyNoErrorIconOnPage()

  train.EditTraining('Hey', 'world peace', "Sorry $name, I can't help you get $want")
  editDialogModal.InsertUserInputAfter('Sam', 'InsertedText')
  editDialogModal.VerifyErrorMessage(trainDialogHasErrorsMessage)
  editDialogModal.SelectChatTurnExactMatch('Sam')
  editDialogModal.VerifyErrorMessage('Two consecutive User Inputs')

  editDialogModal.ClickSaveCloseButton()

  modelPage.VerifyErrorIconForTrainDialogs()
  train.VerifyErrorsFoundInTraining(`${String.fromCharCode(59412)}Hey`, 'world peace', "Sorry $name, I can't help you get $want")

  // - - - Open the same Train Dialog, validate and fix the errors. - - -

  train.EditTraining(`${String.fromCharCode(59412)}Hey`, 'world peace', "Sorry $name, I can't help you get $want")
  editDialogModal.VerifyErrorMessage(trainDialogHasErrorsMessage)
  editDialogModal.SelectChatTurnExactMatch('Sam')
  editDialogModal.VerifyErrorMessage('Two consecutive User Inputs')
  editDialogModal.SelectChatTurnExactMatch('InsertedText')
  editDialogModal.ClickDeleteChatTurn()
  editDialogModal.VerifyNoErrorMessage()

  editDialogModal.ClickSaveCloseButton()
  modelPage.VerifyNoErrorIconOnPage()
}

Cypress.TestCase('ErrorHandling', 'Wait Non Wait Error Handling', WaitNonWaitErrorHandling)
export function WaitNonWaitErrorHandling()
{
  models.ImportModel('z-errWaitNoWait', 'z-waitNoWait.cl')
  modelPage.NavigateToTrainDialogs()
  cy.WaitForTrainingStatusCompleted()

  modelPage.VerifyNoErrorIconOnPage()

  train.EditTraining('Duck', 'Fish', common.fishJustSwim)
  editDialogModal.SelectChatTurnExactMatch(common.whichAnimalWouldYouLike)
  editDialogModal.ClickDeleteChatTurn()
  editDialogModal.VerifyErrorMessage(userInputFollowsNonWaitErrorMessage)

  function Validations(errCount) {
    cy.ConLog(`Validations(${errCount})`, `Start`)
    editDialogModal.SelectChatTurnExactMatch('Duck')
    editDialogModal.VerifyErrorMessage(trainDialogHasErrorsMessage)

    if (errCount > 1) {
      editDialogModal.SelectChatTurnExactMatch(common.whichAnimalWouldYouLike)
      editDialogModal.VerifyErrorMessage(trainDialogHasErrorsMessage)
    }

    editDialogModal.SelectChatTurnExactMatch(common.ducksSayQuack)
    if (errCount == 1) editDialogModal.VerifyErrorMessage(trainDialogHasErrorsMessage)
    else editDialogModal.VerifyErrorMessage(actionFollowsWaitActionErrorMessage)

    editDialogModal.SelectChatTurnExactMatch('Fish')
    editDialogModal.VerifyErrorMessage(userInputFollowsNonWaitErrorMessage)

    if (errCount > 2) {
      editDialogModal.SelectChatTurnExactMatch(common.whichAnimalWouldYouLike, 1)
      editDialogModal.VerifyErrorMessage(trainDialogHasErrorsMessage)
    }

    editDialogModal.SelectChatTurnExactMatch(common.fishJustSwim)
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

  editDialogModal.SelectChatTurnExactMatch(common.whichAnimalWouldYouLike, 1)
  editDialogModal.ClickDeleteChatTurn()
  editDialogModal.VerifyErrorMessage(trainDialogHasErrorsMessage)

  Validations(2)

  editDialogModal.SelectChatTurnExactMatch(common.whichAnimalWouldYouLike)
  editDialogModal.ClickDeleteChatTurn()
  editDialogModal.VerifyErrorMessage(trainDialogHasErrorsMessage)

  Validations(1)

  editDialogModal.SelectChatTurnExactMatch('Fish')
  editDialogModal.VerifyErrorMessage(userInputFollowsNonWaitErrorMessage)

  editDialogModal.InsertBotResponseAfter(common.ducksSayQuack, common.whichAnimalWouldYouLike)
  editDialogModal.VerifyNoErrorMessage()

  editDialogModal.ClickSaveCloseButton()
  modelPage.VerifyNoErrorIconOnPage()
}

Cypress.TestCase('ErrorHandling', 'Action Unavailable', ActionUnavailable)
export function ActionUnavailable()
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

  editDialogModal.SelectChatTurnExactMatch('Joe')
  editDialogModal.RemoveEntityLabel('Joe', 'name')
  editDialogModal.ClickSubmitChangesButton()
  editDialogModal.VerifyErrorMessage(trainDialogHasErrorsMessage)

  editDialogModal.SelectChatTurnStartsWith('Hello')
  editDialogModal.VerifyErrorMessage('Action is unavailable')

  editDialogModal.ClickSaveCloseButton()
  modelPage.VerifyErrorIconForTrainDialogs()
  train.VerifyErrorsFoundInTraining(`${String.fromCharCode(59412)}Joe`, 'Joe', "Hello $name")

  train.EditTraining(`${String.fromCharCode(59412)}Joe`, 'Joe', "Hello $name")
  editDialogModal.VerifyErrorMessage(trainDialogHasErrorsMessage)

  editDialogModal.SelectChatTurnStartsWith('Hello')
  editDialogModal.VerifyErrorMessage('Action is unavailable')

  editDialogModal.SelectChatTurnExactMatch('Joe')
  editDialogModal.LabelTextAsEntity('Joe', 'name')
  editDialogModal.ClickSubmitChangesButton()

  editDialogModal.VerifyNoErrorMessage()

  editDialogModal.ClickSaveCloseButton()
  modelPage.VerifyNoErrorIconOnPage()
}

Cypress.TestCase('ErrorHandling', 'Missing Action', MissingAction)
export function MissingAction()
{
  models.ImportModel('z-missingAction', 'z-whatsYourName.cl')
  modelPage.NavigateToTrainDialogs()
  cy.WaitForTrainingStatusCompleted()

  modelPage.VerifyNoErrorIconOnPage()

  train.CreateNewTrainDialog()

  train.TypeYourMessage(gonnaDeleteAnAction)
  editDialogModal.ClickScoreActionsButton()
  train.SelectAction(common.whatsYourName)
  
  train.Save()

  modelPage.NavigateToActions()
  actions.DeleteAction(common.whatsYourName)
  modelPage.NavigateToTrainDialogs()

  modelPage.VerifyErrorIconForTrainDialogs()
  train.VerifyErrorsFoundInTraining(`${String.fromCharCode(59412)}${gonnaDeleteAnAction}`, gonnaDeleteAnAction, common.whatsYourName)

  train.EditTraining(`${String.fromCharCode(59412)}${gonnaDeleteAnAction}`, gonnaDeleteAnAction, common.whatsYourName)

  editDialogModal.VerifyErrorMessage(trainDialogHasErrorsMessage)

  editDialogModal.SelectChatTurnStartsWith('ERROR: Can’t find Action Id')
  editDialogModal.VerifyErrorMessage('Action does not exist')
  scorerModal.VerifyMissingActionNotice()

  scorerModal.ClickAddActionButton()
  actions.CreateNewAction({ response: common.whatsYourName, expectedEntities: 'name' })

  editDialogModal.VerifyNoErrorMessage()

  editDialogModal.ClickSaveCloseButton()
  modelPage.VerifyNoErrorIconOnPage()
}
