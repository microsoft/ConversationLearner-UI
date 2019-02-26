/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const models = require('../support/Models')
const modelPage = require('../support/components/ModelPage')
const entities = require('../support/Entities')
const actions = require('../support/Actions')
const editDialogModal = require('../support/components/EditDialogModal')
const train = require('../support/Train')
const memoryTableComponent = require('../support/components/MemoryTableComponent')
const common = require('../support/Common')

export function TagAndFrog()
{
  // models.ImportModel('z-tagAndFrog', 'z-tagAndFrog.cl')
  models.CreateNewModel('z-tagAndFrog')
  entities.CreateNewEntity({ name: 'multi', multiValued: true })
  actions.CreateNewActionThenVerifyInGrid({ response: "Hello" })
  actions.CreateNewActionThenVerifyInGrid({ response: "Hi" })

  modelPage.NavigateToTrainDialogs()
  cy.WaitForTrainingStatusCompleted()
  train.CreateNewTrainDialog()

  // ------------------------------------------------------------------------
  // This block of code should be removed once we determine and fix the cause
  // of: Bug 1901-Automatic Entity Labeling Is NOT Consistent
  // ------------------------------------------------------------------------

  train.TypeYourMessage('This is Tag.')
  editDialogModal.LabelTextAsEntity('Tag', 'multi')
  editDialogModal.ClickScoreActionsButton()
  train.SelectAction('Hello')

  train.Save()

  cy.WaitForTrainingStatusCompleted()
  train.CreateNewTrainDialog()

  // ------------------------------------------------------------------------

  train.TypeYourMessage('This is Tag.')
  editDialogModal.LabelTextAsEntity('Tag', 'multi', false)
  editDialogModal.ClickScoreActionsButton()
  // TODO: Verify that the entity was labeled and now in memory.
  train.SelectAction('Hello')
  cy.WaitForTrainingStatusCompleted()

  train.TypeYourMessage('This is Frog and Tag.')
  memoryTableComponent.VerifyEntityInMemory('multi', 'Tag')
  editDialogModal.VerifyEntityLabel('Tag', 'multi')
  editDialogModal.LabelTextAsEntity('Frog', 'multi')
  editDialogModal.ClickScoreActionsButton()
  train.SelectAction('Hi')
  cy.WaitForTrainingStatusCompleted()

  train.TypeYourMessage('This is Tag and Frog.')
  memoryTableComponent.VerifyEntityInMemory('multi', ['Tag', 'Frog'])
  editDialogModal.VerifyEntityLabel('Tag', 'multi')
  editDialogModal.VerifyEntityLabel('Frog', 'multi', 1)
  editDialogModal.ClickScoreActionsButton()
  train.SelectAction('Hi')

  train.Save()

  // Manually EXPORT this to fixtures folder and name it 'z-tagAndFrog.cl'
}
