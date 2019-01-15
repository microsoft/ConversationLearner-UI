/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const models = require('../support/Models')
const modelPage = require('../support/components/ModelPage')
const scorerModal = require('../support/components/ScorerModal')
const train = require('../support/Train')
const editDialogModal = require('../support/components/EditDialogModal')

const trainDialogHasErrorsMessage = 'This Train Dialog has errors that must be fixed before it can be used to train your model'

export function VerifyEditTrainingControlsAndLabels()
{
  var modelName = models.ImportModel('z-editContols', 'z-nameTrained.cl')
  modelPage.NavigateToTrainDialogs()

  train.EditTraining('My name is David.', 'My name is Susan.', 'Hello $name')
  train.CaptureOriginalChatMessages()

  editDialogModal.VerifyCloseButtonLabel()
  editDialogModal.VerifyDeleteButtonLabel()

  editDialogModal.VerifyThereAreNoChatEditControls('My name is David.', 'Hello Susan')
  train.SelectAndVerifyEachChatTurn()
  
  train.BranchChatTurn('My name is Susan.', 'I am Groot')
  editDialogModal.VerifySaveBranchButtonLabel()
  editDialogModal.VerifyAbandonBranchButtonLabel()

  editDialogModal.VerifyThereAreNoChatEditControls('I am Groot', 'Hello David')
  editDialogModal.AbandonBranchChanges()

  train.EditTraining('My name is David.', 'My name is Susan.', 'Hello $name')
  train.VerifyOriginalChatMessages()
}

export function Branching()
{
  var modelName = models.ImportModel('z-branching', 'z-nameTrained.cl')
  modelPage.NavigateToTrainDialogs()
  cy.WaitForTrainingStatusCompleted()
  
  train.EditTraining('My name is David.', 'My name is Susan.', 'Hello $name')
  train.CaptureOriginalChatMessages()
  
  train.BranchChatTurn('My name is Susan.', 'My name is Joseph.')
  cy.wait(5000)
  editDialogModal.ClickScoreActionsButton('Hello $name')
  scorerModal.VerifyChatMessage('Hello Joseph')
  train.CaptureEditedChatMessages()
  cy.wait(30000)
  train.Save()
  
  train.EditTraining('My name is David.', 'My name is Susan.', 'Hello $name')
  train.VerifyOriginalChatMessages()
  editDialogModal.ClickSaveCloseButton()

  train.EditTraining('My name is David.', 'My name is Joseph.', 'Hello $name')
  train.VerifyEditedChatMessages()
  editDialogModal.ClickSaveCloseButton()
}

export function TagAndFrog()
{
  var textEntityPairs = [{text: 'Tag', entity: 'multi'}, {text: 'Frog', entity: 'multi'}]

  models.ImportModel('z-tagAndFrog2', 'z-tagAndFrog2.cl')
  modelPage.NavigateToTrainDialogs()
  cy.WaitForTrainingStatusCompleted()

  train.EditTraining('This is Tag.', 'This is Tag.', 'Hi')
  editDialogModal.SelectChatTurn('This is Tag.')

  editDialogModal.VerifyEntityLabelWithinSpecificInput(textEntityPairs[0], 0)
  editDialogModal.VerifyEntityLabelWithinSpecificInput(textEntityPairs, 1)
  editDialogModal.VerifyEntityLabelWithinSpecificInput(textEntityPairs, 2)

  editDialogModal.RemoveEntityLabel('Tag', 'multi', 1)
  editDialogModal.RemoveEntityLabel('Frog', 'multi', 2)

  editDialogModal.ClickSubmitChangesButton()
  editDialogModal.VerifyEntityLabeledDifferentPopupAndClose(textEntityPairs)
  editDialogModal.ClickSubmitChangesButton()
  editDialogModal.VerifyEntityLabeledDifferentPopupAndAccept(textEntityPairs)

  editDialogModal.VerifyEntityLabeledDifferentPopupAndClose(textEntityPairs)
  editDialogModal.ClickSubmitChangesButton()
  editDialogModal.VerifyEntityLabeledDifferentPopupAndAccept(textEntityPairs)

  train.AbandonDialog()
}

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

export function WaitNonWaitErrorHandling()
{
  models.ImportModel('z-errWaitNoWait', 'z-waitNoWait.cl')
  modelPage.NavigateToTrainDialogs()
  cy.WaitForTrainingStatusCompleted()
  
  modelPage.VerifyNoErrorIconOnPage()

  train.EditTraining('Duck', 'Fish', "Fish just swim.")
  editDialogModal.SelectChatTurn('Which animal would you like?')
  editDialogModal.ClickDeleteChatTurn()
  editDialogModal.VerifyErrorMessage('User Input following a non-Wait Action')

  function Validations(errCount)
  {
    cy.ConLog(`Validations(${errCount})`, `Start`)
    editDialogModal.SelectChatTurn('Duck')
    editDialogModal.VerifyErrorMessage(trainDialogHasErrorsMessage)

    if (errCount > 1)
    {
      editDialogModal.SelectChatTurn('Which animal would you like?')
      editDialogModal.VerifyErrorMessage(trainDialogHasErrorsMessage)
    }

    editDialogModal.SelectChatTurn('Ducks say quack!')
    if (errCount == 1) editDialogModal.VerifyErrorMessage(trainDialogHasErrorsMessage)
    else editDialogModal.VerifyErrorMessage('Action follows a Wait Action')

    editDialogModal.SelectChatTurn('Fish')
    editDialogModal.VerifyErrorMessage('User Input following a non-Wait Action')

    if (errCount > 1)
    {
      editDialogModal.SelectChatTurn('Which animal would you like?', 1)
      editDialogModal.VerifyErrorMessage(trainDialogHasErrorsMessage)
    }

    editDialogModal.SelectChatTurn('Fish just swim.')
    if (errCount < 3) editDialogModal.VerifyErrorMessage(trainDialogHasErrorsMessage)
    else editDialogModal.VerifyErrorMessage('Action follows a Wait Action')

    cy.ConLog(`Validations(${errCount})`, `End`)
  }
  Validations(1)

  editDialogModal.InsertBotResponseAfter('Duck') //, 'Which animal would you like?')
  editDialogModal.VerifyErrorMessage(trainDialogHasErrorsMessage)
  
  Validations(2)

  editDialogModal.InsertBotResponseAfter('Fish') //, 'Which animal would you like?')
  editDialogModal.VerifyErrorMessage(trainDialogHasErrorsMessage)

  Validations(3)

  editDialogModal.ClickSaveCloseButton()

  modelPage.VerifyErrorIconForTrainDialogs()
  train.VerifyErrorsFoundInTraining(`${String.fromCharCode(59412)}Duck`, 'Fish', "Fish just swim.")

  // - - - Open the same Train Dialog, validate and fix the errors. - - -

  train.EditTraining(`${String.fromCharCode(59412)}Duck`, 'Fish', "Fish just swim.")
  editDialogModal.VerifyErrorMessage(trainDialogHasErrorsMessage)

  Validations(3)

  editDialogModal.SelectChatTurn('Which animal would you like?', 1)
  editDialogModal.ClickDeleteChatTurn()
  editDialogModal.VerifyErrorMessage(trainDialogHasErrorsMessage)

  Validations(2)

  editDialogModal.SelectChatTurn('Which animal would you like?')
  editDialogModal.ClickDeleteChatTurn()
  editDialogModal.VerifyErrorMessage(trainDialogHasErrorsMessage)

  Validations(1)

  editDialogModal.SelectChatTurn('Fish')
  editDialogModal.VerifyErrorMessage('User Input following a non-Wait Action')

  editDialogModal.InsertBotResponseAfter('Ducks say quack!', 'Which animal would you like?')
  editDialogModal.VerifyNoErrorMessage()

  editDialogModal.ClickSaveCloseButton()
  modelPage.VerifyNoErrorIconOnPage()
}

