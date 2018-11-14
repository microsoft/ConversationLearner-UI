/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const models = require('../support/Models')
const modelPage = require('../support/components/ModelPage')
const memoryTableComponent = require('../support/components/MemoryTableComponent')
const scorerModal = require('../support/components/ScorerModal')
const train = require('../support/Train')
const trainDialogsGrid = require('../support/components/TrainDialogsGrid')
const editDialogModal = require('../support/components/EditDialogModal')

export function VerifyEditTrainingControlsAndLabels()
{
  var modelName = models.ImportModel('Model-EdCon', 'Model1-mni.cl')
  modelPage.NavigateToTrainDialogs()

  train.EditTraining('My name is David.', 'My name is Susan.', 'Hello $name')
  train.CaptureAllChatMessages()

  editDialogModal.VerifyCloseButtonLabel()
  editDialogModal.VerifyDeleteButtonLabel()

  editDialogModal.VerifyThereAreNoChatEditControls('My name is David.', 'Hello Susan')
  editDialogModal.SelectAndVerifyEachChatTurn()
  
  editDialogModal.BranchChatTurn('My name is Susan.', 'I am Groot')
  editDialogModal.VerifySaveBranchButtonLabel()
  editDialogModal.VerifyAbandonBranchButtonLabel()

  editDialogModal.AbandonBranchChanges()

  train.EditTraining('My name is David.', 'My name is Susan.', 'Hello $name')
  train.VerifyAllChatMessagesSameAsCaptured()
}

export function Branching()
{
  var modelName = models.ImportModel('Model-Branch', 'Model1-mni.cl')
  modelPage.NavigateToTrainDialogs()
  cy.WaitForTrainingStatusCompleted()
  
  train.EditTraining('My name is David.', 'My name is Susan.', 'Hello $name')
  
  editDialogModal.BranchChatTurn('My name is Susan.', 'My name is Joseph.')
  editDialogModal.ClickScoreActionsButton()
  memoryTableComponent.VerifyEntityInMemory('name', 'Joseph')

  editDialogModal.VerifyCloseButtonLabel()
  editDialogModal.VerifyDeleteButtonLabel()

  editDialogModal.VerifyThereAreNoChatEditControls('My name is David.', 'Hello Susan')
  editDialogModal.SelectAndVerifyEachChatTurn()
  
  editDialogModal.BranchChatTurn('My name is Susan.', 'I am Groot')
  editDialogModal.VerifySaveBranchButtonLabel()
  editDialogModal.VerifyAbandonBranchButtonLabel()

  editDialogModal.AbandonBranchChanges()

  train.EditTraining('My name is David.', 'My name is Susan.', 'Hello $name')
  train.VerifyAllChatMessagesSameAsCaptured()
}
