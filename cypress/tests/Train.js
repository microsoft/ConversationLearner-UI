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

export function DisqualifyingEntities() {
  models.ImportModel('z-disqualifyngEnt', 'z-disqualifyngEnt.cl')

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
  editDialogModal.VerifyEntityLabel('Sam', 'name')
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
  // Manually EXPORT this to fixtures folder and name it 'z-disqualifyngEnt.Trained.cl'
}

export function WaitVsNoWaitActions() {
  models.ImportModel('z-waitNoWait', 'z-waitNoWait.cl')

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

export function WhatsYourName() {
  models.ImportModel('z-whatsYourName', 'z-whatsYourName.cl')

  modelPage.NavigateToTrainDialogs()
  cy.WaitForTrainingStatusCompleted()
  train.CreateNewTrainDialog()

  train.TypeYourMessage('Hello')
  editDialogModal.ClickScoreActionsButton()
  scorerModal.VerifyContainsEnabledAction("What's your name?")
  scorerModal.VerifyContainsDisabledAction('Hello $name')
  train.SelectAction("What's your name?")

  train.TypeYourMessage('David')
  editDialogModal.VerifyEntityLabel('David', 'name')
  editDialogModal.ClickScoreActionsButton()
  memoryTableComponent.VerifyEntityInMemory('name', 'David')
  scorerModal.VerifyContainsDisabledAction("What's your name?")
  scorerModal.VerifyContainsEnabledAction('Hello David')
  train.SelectAction('Hello David', 'Hello $name')

  train.Save()

  // Manually EXPORT this to fixtures folder and name it 'z-myNameIs.cl'
}

export function MyNameIs() {
  models.ImportModel('z-myNameIs', 'z-myNameIs.cl')
  modelPage.NavigateToTrainDialogs()
  cy.WaitForTrainingStatusCompleted()

  train.CreateNewTrainDialog()

  train.TypeYourMessage('My name is David.')
  editDialogModal.VerifyEntityLabel('David', 'name')
  editDialogModal.ClickScoreActionsButton()
  memoryTableComponent.VerifyEntityInMemory('name', 'David')
  scorerModal.VerifyContainsDisabledAction("What's your name?")
  scorerModal.VerifyContainsEnabledAction('Hello David')
  train.SelectAction('Hello David', 'Hello $name')

  cy.WaitForTrainingStatusCompleted()

  train.TypeYourMessage('My name is Susan.')
  editDialogModal.VerifyEntityLabel('Susan', 'name')
  editDialogModal.ClickScoreActionsButton()
  memoryTableComponent.VerifyEntityInMemory('name', 'Susan', 'David')
  scorerModal.VerifyContainsDisabledAction("What's your name?")
  scorerModal.VerifyContainsEnabledAction('Hello Susan')
  train.SelectAction('Hello Susan', 'Hello $name')

  train.Save()

  // Manually EXPORT this to fixtures folder and name it 'z-nameTrained.cl'
}

export function TagAndFrog() {
  // TODO: Need to add another test case or expand this one so that tagging something
  //       that was NOT tagged in another instance causes the UI to complain.
  var textEntityPairs = [{ text: 'Tag', entity: 'multi' }, { text: 'Frog', entity: 'multi' }]

  models.ImportModel('z-tagAndFrog', 'z-tagAndFrog.cl')
  modelPage.NavigateToTrainDialogs()

  cy.WaitForTrainingStatusCompleted()
  train.CreateNewTrainDialog()

  train.TypeYourMessage('This is Tag.')
  editDialogModal.RemoveEntityLabel('Tag', 'multi')
  editDialogModal.ClickScoreActionsButton()
  editDialogModal.VerifyEntityLabeledDifferentPopupAndClose({ text: 'Tag', entity: 'multi' })
  editDialogModal.ClickScoreActionsButton()
  editDialogModal.VerifyEntityLabeledDifferentPopupAndAccept({ text: 'Tag', entity: 'multi' })
  train.SelectAction('Hello')

  train.TypeYourMessage('This is Frog and Tag.')
  editDialogModal.RemoveEntityLabel('Frog', 'multi')
  editDialogModal.ClickScoreActionsButton()
  editDialogModal.VerifyEntityLabeledDifferentPopupAndClose(textEntityPairs)
  editDialogModal.ClickScoreActionsButton()
  editDialogModal.VerifyEntityLabeledDifferentPopupAndAccept(textEntityPairs)
  train.SelectAction('Hi')

  train.TypeYourMessage('This is Tag and Frog.')
  editDialogModal.RemoveEntityLabel('Tag', 'multi')
  editDialogModal.RemoveEntityLabel('Frog', 'multi')
  editDialogModal.ClickScoreActionsButton()
  editDialogModal.VerifyEntityLabeledDifferentPopupAndClose(textEntityPairs)
  editDialogModal.ClickScoreActionsButton()
  editDialogModal.VerifyEntityLabeledDifferentPopupAndAccept(textEntityPairs)
  train.SelectAction('Hi')

  train.AbandonDialog()

  cy.WaitForTrainingStatusCompleted()
  train.CreateNewTrainDialog()

  train.TypeYourMessage('This is Tag.')
  editDialogModal.TypeAlternativeInput('This is Frog and Tag.')
  editDialogModal.TypeAlternativeInput('This is Tag and Frog.')

  editDialogModal.VerifyEntityLabelWithinSpecificInput(textEntityPairs[0], 0)
  editDialogModal.VerifyEntityLabelWithinSpecificInput(textEntityPairs, 1)
  editDialogModal.VerifyEntityLabelWithinSpecificInput(textEntityPairs, 2)

  editDialogModal.RemoveEntityLabel('Tag', 'multi', 1)
  editDialogModal.RemoveEntityLabel('Frog', 'multi', 2)

  editDialogModal.ClickScoreActionsButton()
  editDialogModal.VerifyEntityLabeledDifferentPopupAndClose(textEntityPairs)
  editDialogModal.ClickScoreActionsButton()
  editDialogModal.VerifyEntityLabeledDifferentPopupAndAccept(textEntityPairs)

  editDialogModal.VerifyEntityLabeledDifferentPopupAndClose(textEntityPairs)
  editDialogModal.ClickScoreActionsButton()
  editDialogModal.VerifyEntityLabeledDifferentPopupAndAccept(textEntityPairs)
  train.SelectAction('Hi')

  train.Save()

  // Manually EXPORT this to fixtures folder and name it 'z-tagAndFrog2.cl'
}

export function BookMeAFlight() {
  models.ImportModel('z-BookMeAFlight', 'z-travel.cl')
  modelPage.NavigateToTrainDialogs()
  cy.WaitForTrainingStatusCompleted()

  train.CreateNewTrainDialog()

  train.TypeYourMessage('Book me a flight.')
  editDialogModal.ClickScoreActionsButton()
  scorerModal.VerifyContainsDisabledAction('You are leaving on $departure and returning on $return')
  scorerModal.VerifyContainsEnabledAction('When are you planning to travel?')
  train.SelectAction('When are you planning to travel?')

  var today = Cypress.moment()
  var tomorrow = today.add(1, 'days').format("YYYY-MM-DD")
  var sundayNextWeek = today.add(today.day() == 0 ? 7 : 14 - today.day(), 'days').format("YYYY-MM-DD")
  train.TypeYourMessage('Leaving tomorrow and returning Sunday next week.')
  editDialogModal.LabelTextAsEntity('tomorrow', 'departure')
  editDialogModal.LabelTextAsEntity('Sunday next week', 'return')
  editDialogModal.ClickScoreActionsButton()
  memoryTableComponent.VerifyEntityInMemory('departure', 'tomorrow')
  memoryTableComponent.VerifyEntityInMemory('return', 'Sunday next week')
  scorerModal.VerifyContainsDisabledAction('When are you planning to travel?')
  var botResponse = `You are leaving on ${tomorrow} and returning on ${sundayNextWeek}`
  scorerModal.VerifyContainsEnabledAction(botResponse)
  train.SelectAction(botResponse, 'You are leaving on $departure and returning on $return')

  train.Save()
}

export function AddOneLastEndSessionAction() {
  models.ImportModel('z-sydney-flight', 'z-sydney-flight.cl')
  modelPage.NavigateToTrainDialogs()
  cy.WaitForTrainingStatusCompleted()
  train.EditTraining('fly to sydney', 'coach', "enjoy your trip. you are booked on Qantas")
  cy.RunAndExpectDomChange(() => { editDialogModal.ClickScoreActionsButton() /* Cypress.$('[data-testid="score-actions-button"]')[0].click() */ })
  editDialogModal.SelectChatTurn('enjoy your trip. you are booked on Qantas', 1)
  train.SelectAction('0')
}
