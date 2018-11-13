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
  var modelName = models.ImportModel('Model-EnB', 'Model1-mni.cl')
  modelPage.NavigateToTrainDialogs()

  cy.Train_EditTraining('My name is David.', 'My name is Susan.', 'Hello $name')
  editDialogModal.VerifyCloseButtonLabel()
  editDialogModal.VerifyDeleteButtonLabel()

  editDialogModal.SelectAndValidateEachChatTurn()
  
  editDialogModal.BranchChatTurn('My name is Susan.', 'I am Groot')
  editDialogModal.VerifySaveBranchButtonLabel()
  editDialogModal.VerifyAbandonBranchButtonLabel()

  editDialogModal.AbandonBranchChanges()
}