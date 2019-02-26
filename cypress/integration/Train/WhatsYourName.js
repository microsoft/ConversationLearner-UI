/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const models = require('../../support/Models')
const modelPage = require('../../support/components/ModelPage')
const memoryTableComponent = require('../../support/components/MemoryTableComponent')
const scorerModal = require('../../support/components/ScorerModal')
const train = require('../../support/Train')
const editDialogModal = require('../../support/components/EditDialogModal')
const common = require('../../support/Common')

export function WhatsYourName()
{
  models.ImportModel('z-whatsYourName', 'z-whatsYourName.cl')

  modelPage.NavigateToTrainDialogs()
  cy.WaitForTrainingStatusCompleted()
  train.CreateNewTrainDialog()

  train.TypeYourMessage('Hello')
  editDialogModal.ClickScoreActionsButton()
  scorerModal.VerifyContainsEnabledAction(common.whatsYourName)
  scorerModal.VerifyContainsDisabledAction('Hello $name')
  train.SelectAction(common.whatsYourName)

  train.TypeYourMessage('David')
  editDialogModal.VerifyEntityLabel('David', 'name')
  editDialogModal.ClickScoreActionsButton()
  memoryTableComponent.VerifyEntityInMemory('name', 'David')
  scorerModal.VerifyContainsDisabledAction(common.whatsYourName)
  scorerModal.VerifyContainsEnabledAction('Hello David')
  train.SelectAction('Hello David', 'Hello $name')

  train.Save()

  // Manually EXPORT this to fixtures folder and name it 'z-myNameIs.cl'
}
