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

export function DisqualifyingEntities()
{
  var modelName = models.ImportModel('z-disqualEnt', 'z-disqualEnt.cl')
  
  modelPage.NavigateToTrainDialogs()
  cy.WaitForTrainingStatusCompleted()

  train.CreateNewTrainDialog()

  train.TypeYourMessage('Hey')
  editDialogModal.ClickScoreActionsButton()
  scorerModal.VerifyContainsEnabledAction("What's your name?")
  scorerModal.VerifyContainsDisabledAction('Hey $name')
  scorerModal.VerifyContainsDisabledAction('Hey $name, what do you really want?')
  scorerModal.VerifyContainsDisabledAction("Sorry $name, I can't help you get $want")
  train.SelectAction("What's your name?")

  train.TypeYourMessage('Sam')
  editDialogModal.VerifyDetectedEntity('name', 'Sam')
  editDialogModal.ClickScoreActionsButton()
  memoryTableComponent.VerifyEntityInMemory('name', 'Sam')
  scorerModal.VerifyContainsDisabledAction("What's your name?")
  scorerModal.VerifyContainsEnabledAction('Hey Sam')
  scorerModal.VerifyContainsEnabledAction('Hey Sam, what do you really want?')
  scorerModal.VerifyContainsDisabledAction("Sorry Sam, I can't help you get $want")
  train.SelectAction('Hey Sam', 'Hey $name')

  train.TypeYourMessage('Hey')
  editDialogModal.ClickScoreActionsButton()
  memoryTableComponent.VerifyEntityInMemory('name', 'Sam')
  scorerModal.VerifyContainsDisabledAction("What's your name?")
  scorerModal.VerifyContainsEnabledAction('Hey Sam')
  scorerModal.VerifyContainsEnabledAction('Hey Sam, what do you really want?')
  scorerModal.VerifyContainsDisabledAction("Sorry Sam, I can't help you get $want")
  train.SelectAction('Hey Sam, what do you really want?', 'Hey $name, what do you really want?')

  train.TypeYourMessage('world peace')
  editDialogModal.ClickScoreActionsButton()
  memoryTableComponent.VerifyEntityInMemory('name', 'Sam')
  memoryTableComponent.VerifyEntityInMemory('want', 'world peace')
  scorerModal.VerifyContainsDisabledAction("What's your name?")
  scorerModal.VerifyContainsDisabledAction('Hey Sam')
  scorerModal.VerifyContainsDisabledAction('Hey Sam, what do you really want?')
  scorerModal.VerifyContainsEnabledAction("Sorry Sam, I can't help you get world peace")
  train.SelectAction("Sorry Sam, I can't help you get world peace", "Sorry $name, I can't help you get $want")

  train.Save()
}

export function WaitVsNoWaitActions()
{
  var modelName = models.ImportModel('z-waitNoWait', 'z-waitNoWait.cl')
  
  modelPage.NavigateToTrainDialogs()
  cy.WaitForTrainingStatusCompleted()

  train.CreateNewTrainDialog()

  train.TypeYourMessage('Hello')
  editDialogModal.ClickScoreActionsButton()
  scorerModal.VerifyContainsEnabledAction('Which animal would you like?')
  scorerModal.VerifyContainsEnabledAction('Cows say moo!')
  scorerModal.VerifyContainsEnabledAction('Ducks say quack!')
  train.SelectAction('Which animal would you like?')

  train.TypeYourMessage('Cow')
  editDialogModal.ClickScoreActionsButton()
  scorerModal.VerifyContainsEnabledAction('Which animal would you like?')
  scorerModal.VerifyContainsEnabledAction('Cows say moo!')
  scorerModal.VerifyContainsEnabledAction('Ducks say quack!')
  train.SelectAction('Cows say moo!')
  
  train.SelectAction('Which animal would you like?')

  train.TypeYourMessage('Duck')
  editDialogModal.ClickScoreActionsButton()
  scorerModal.VerifyContainsEnabledAction('Which animal would you like?')
  scorerModal.VerifyContainsEnabledAction('Cows say moo!')
  scorerModal.VerifyContainsEnabledAction('Ducks say quack!')
  train.SelectAction('Ducks say quack!')

  train.SelectAction('Which animal would you like?')

  train.Save()
}

export function WhatsYourName1()
{
  var modelName = models.ImportModel('z-whatsYorName', 'z-whatsYorName.cl')

  modelPage.NavigateToTrainDialogs()
  cy.WaitForTrainingStatusCompleted()
  train.CreateNewTrainDialog()

  train.TypeYourMessage('Hello')
  editDialogModal.ClickScoreActionsButton()
  scorerModal.VerifyContainsEnabledAction("What's your name?")
  scorerModal.VerifyContainsDisabledAction('Hello $name')
  train.SelectAction("What's your name?")

  train.TypeYourMessage('David')
  editDialogModal.VerifyDetectedEntity('name', 'David')
  editDialogModal.ClickScoreActionsButton()
  memoryTableComponent.VerifyEntityInMemory('name', 'David')
  scorerModal.VerifyContainsDisabledAction("What's your name?")
  scorerModal.VerifyContainsEnabledAction('Hello David')
  train.SelectAction('Hello David', 'Hello $name')

  train.Save()

  // Manually EXPORT this to fixtures folder and name it 'z-myNameIs.cl'
}

export function WhatsYourName2()
{
  var modelName = models.ImportModel('z-myNameIs', 'z-myNameIs.cl')
  modelPage.NavigateToTrainDialogs()
  cy.WaitForTrainingStatusCompleted()

  train.CreateNewTrainDialog()

  train.TypeYourMessage('My name is David.') // TODO: Add edge cases; 'david', with & without 'period'
  editDialogModal.VerifyDetectedEntity('name', 'David')
  editDialogModal.ClickScoreActionsButton()
  memoryTableComponent.VerifyEntityInMemory('name', 'David')
  scorerModal.VerifyContainsDisabledAction("What's your name?")
  scorerModal.VerifyContainsEnabledAction('Hello David')
  train.SelectAction('Hello David', 'Hello $name')

  cy.WaitForTrainingStatusCompleted()

  train.TypeYourMessage('My name is Susan.')
  editDialogModal.VerifyDetectedEntity('name', 'Susan')
  editDialogModal.ClickScoreActionsButton()
  memoryTableComponent.VerifyEntityInMemory('name', 'Susan', 'David')
  scorerModal.VerifyContainsDisabledAction("What's your name?")
  scorerModal.VerifyContainsEnabledAction('Hello Susan')
  train.SelectAction('Hello Susan', 'Hello $name')

  train.Save()

  // Manually EXPORT this to fixtures folder and name it 'z-nameTrained.cl'
}

