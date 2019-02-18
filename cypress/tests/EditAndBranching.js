/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const models = require('../support/Models')
const modelPage = require('../support/components/ModelPage')
const scorerModal = require('../support/components/ScorerModal')
const train = require('../support/Train')
const editDialogModal = require('../support/components/EditDialogModal')

Cypress.TestCase('EditAndBranching', 'Verify Edit Training Controls And Labels', VerifyEditTrainingControlsAndLabels)
export function VerifyEditTrainingControlsAndLabels()
{
  models.ImportModel('z-editContols', 'z-nameTrained.cl')
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

Cypress.TestCase('EditAndBranching', 'Branching', Branching)
export function Branching()
{
  models.ImportModel('z-branching', 'z-nameTrained.cl')
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

Cypress.TestCase('EditAndBranching', 'Tag And Frog', TagAndFrog)
export function TagAndFrog()
{
  let textEntityPairs = [{text: 'Tag', entity: 'multi'}, {text: 'Frog', entity: 'multi'}]

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

Cypress.TestCase('EditAndBranching', 'Add End Session Action', AddEndSessionAction)
export function AddEndSessionAction() {
  models.ImportModel('z-sydneyFlight', 'z-sydneyFlight.cl')

  modelPage.NavigateToTrainDialogs()

  cy.WaitForTrainingStatusCompleted()

  train.EditTraining('fly to sydney', 'coach', "enjoy your trip. you are booked on Qantas")
  editDialogModal.ClickScoreActionsButton()
  editDialogModal.SelectChatTurn('enjoy your trip. you are booked on Qantas', 1)
  train.SelectEndSessionAction('0')

  editDialogModal.VerifyScoreActionsButtonIsMissing()
  editDialogModal.VerifyTypeYourMessageIsMissing()
  editDialogModal.ClickSaveCloseButton()
}

