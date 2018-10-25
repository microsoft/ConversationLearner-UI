/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const models = require('../support/Models')
const modelPage = require('../support/components/ModelPage')
const memoryTableComponent = require('../support/components/MemoryTableComponent')
const scorerModal = require('../support/components/ScorerModal')
const trainDialogsGrid = require('../support/components/TrainDialogsGrid')
const editDialogModal = require('../support/components/EditDialogModal')

export function DisqualifyingEntities()
{
  var modelName = models.ImportModel('Model-disq', 'Model-disq.cl')
  
  modelPage.NavigateToTrainDialogs()
  cy.WaitForTrainingStatusCompleted()

  trainDialogsGrid.CreateNewTrainDialog()

  editDialogModal.TypeYourMessage('Hey')
  editDialogModal.ClickScoreActionsButton()
  scorerModal.VerifyContainsEnabledAction("What's your name?")
  scorerModal.VerifyContainsDisabledAction('Hey $name')
  scorerModal.VerifyContainsDisabledAction('Hey $name, what do you really want?')
  scorerModal.VerifyContainsDisabledAction("Sorry $name, I can't help you get $want")
  scorerModal.ClickAction("What's your name?")

  editDialogModal.TypeYourMessage('Sam')
  editDialogModal.VerifyDetectedEntity('name', 'Sam')
  editDialogModal.ClickScoreActionsButton()
  memoryTableComponent.VerifyEntityInMemory('name', 'Sam')
  scorerModal.VerifyContainsDisabledAction("What's your name?")
  scorerModal.VerifyContainsEnabledAction('Hey Sam')
  scorerModal.VerifyContainsEnabledAction('Hey Sam, what do you really want?')
  scorerModal.VerifyContainsDisabledAction("Sorry Sam, I can't help you get $want")
  scorerModal.ClickAction('Hey Sam')

  editDialogModal.TypeYourMessage('Hey')
  editDialogModal.ClickScoreActionsButton()
  memoryTableComponent.VerifyEntityInMemory('name', 'Sam')
  scorerModal.VerifyContainsDisabledAction("What's your name?")
  scorerModal.VerifyContainsEnabledAction('Hey Sam')
  scorerModal.VerifyContainsEnabledAction('Hey Sam, what do you really want?')
  scorerModal.VerifyContainsDisabledAction("Sorry Sam, I can't help you get $want")
  scorerModal.ClickAction('Hey Sam, what do you really want?')

  editDialogModal.TypeYourMessage('world peace')
  editDialogModal.ClickScoreActionsButton()
  memoryTableComponent.VerifyEntityInMemory('name', 'Sam')
  memoryTableComponent.VerifyEntityInMemory('want', 'world peace')
  scorerModal.VerifyContainsDisabledAction("What's your name?")
  scorerModal.VerifyContainsDisabledAction('Hey Sam')
  scorerModal.VerifyContainsDisabledAction('Hey Sam, what do you really want?')
  scorerModal.VerifyContainsEnabledAction("Sorry Sam, I can't help you get world peace")
  scorerModal.ClickAction("Sorry Sam, I can't help you get world peace")

  editDialogModal.ClickSaveButton()
}

export function WaitVsNoWaitActions()
{
  var modelName = models.ImportModel('Model-0wait', 'Model-0wait.cl')
  
  modelPage.NavigateToTrainDialogs()
  cy.WaitForTrainingStatusCompleted()

  trainDialogsGrid.CreateNewTrainDialog()

  editDialogModal.TypeYourMessage('Hello')
  editDialogModal.ClickScoreActionsButton()
  scorerModal.VerifyContainsEnabledAction('Which animal would you like?')
  scorerModal.VerifyContainsEnabledAction('Cows say moo!')
  scorerModal.VerifyContainsEnabledAction('Ducks say quack!')
  scorerModal.ClickAction('Which animal would you like?')

  editDialogModal.TypeYourMessage('Cow')
  editDialogModal.ClickScoreActionsButton()
  scorerModal.VerifyContainsEnabledAction('Which animal would you like?')
  scorerModal.VerifyContainsEnabledAction('Cows say moo!')
  scorerModal.VerifyContainsEnabledAction('Ducks say quack!')
  scorerModal.ClickAction('Cows say moo!')
  
  scorerModal.ClickAction('Which animal would you like?')

  editDialogModal.TypeYourMessage('Duck')
  editDialogModal.ClickScoreActionsButton()
  scorerModal.VerifyContainsEnabledAction('Which animal would you like?')
  scorerModal.VerifyContainsEnabledAction('Cows say moo!')
  scorerModal.VerifyContainsEnabledAction('Ducks say quack!')
  scorerModal.ClickAction('Ducks say quack!')

  scorerModal.ClickAction('Which animal would you like?')

  editDialogModal.ClickSaveButton()
}

export function WhatsYourName1()
{
  var modelName = models.ImportModel('Model1-wyn', 'Model1.cl')

  modelPage.NavigateToTrainDialogs()
  cy.WaitForTrainingStatusCompleted()
  
  trainDialogsGrid.CreateNewTrainDialog()

  editDialogModal.TypeYourMessage('Hello')
  editDialogModal.ClickScoreActionsButton()
  scorerModal.VerifyContainsEnabledAction("What's your name?")
  scorerModal.VerifyContainsDisabledAction('Hello $name')
  scorerModal.ClickAction("What's your name?")

  editDialogModal.TypeYourMessage('David')
  editDialogModal.VerifyDetectedEntity('name', 'David')
  editDialogModal.ClickScoreActionsButton()
  memoryTableComponent.VerifyEntityInMemory('name', 'David')
  scorerModal.VerifyContainsDisabledAction("What's your name?")
  scorerModal.VerifyContainsEnabledAction('Hello David')
  scorerModal.ClickAction('Hello David')

  editDialogModal.ClickSaveButton()
}

export function WhatsYourName2()
{
  var modelName = models.ImportModel('Model1-mni', 'Model1-wyn.cl')
  modelPage.NavigateToTrainDialogs()
  cy.WaitForTrainingStatusCompleted()

  trainDialogsGrid.CreateNewTrainDialog()

  editDialogModal.TypeYourMessage('My name is David.') // TODO: Add edge cases; 'david', with & without 'period'
  editDialogModal.VerifyDetectedEntity('name', 'David')
  editDialogModal.ClickScoreActionsButton()
  memoryTableComponent.VerifyEntityInMemory('name', 'David')
  scorerModal.VerifyContainsDisabledAction("What's your name?")
  scorerModal.VerifyContainsEnabledAction('Hello David')
  scorerModal.ClickAction('Hello David')

  // Wait for the training to complete.
  // At the time this was added, there is no UI elements to let us know it is complete.
  cy.wait(20000)

  editDialogModal.TypeYourMessage('My name is Susan.')
  editDialogModal.VerifyDetectedEntity('name', 'Susan')
  editDialogModal.ClickScoreActionsButton()
  memoryTableComponent.VerifyEntityInMemory('name', 'Susan', 'David')
  scorerModal.VerifyContainsDisabledAction("What's your name?")
  scorerModal.VerifyContainsEnabledAction('Hello Susan')
  scorerModal.ClickAction('Hello Susan')

  editDialogModal.ClickSaveButton()
}

