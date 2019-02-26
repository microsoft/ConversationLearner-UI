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

export function BookMeAFlight()
{
  models.ImportModel('z-BookMeAFlight', 'z-travel.cl')
  modelPage.NavigateToTrainDialogs()
  cy.WaitForTrainingStatusCompleted()

  train.CreateNewTrainDialog()

  train.TypeYourMessage('Book me a flight.')
  editDialogModal.ClickScoreActionsButton()
  scorerModal.VerifyContainsDisabledAction('You are leaving on $departure and returning on $return')
  scorerModal.VerifyContainsEnabledAction('When are you planning to travel?')
  train.SelectAction('When are you planning to travel?')

  let today = Cypress.moment()
  let tomorrow = today.add(1, 'days').format("YYYY-MM-DD")
  let sundayNextWeek = today.add(today.day() == 0 ? 7 : 14 - today.day(), 'days').format("YYYY-MM-DD")
  train.TypeYourMessage('Leaving tomorrow and returning Sunday next week.')
  editDialogModal.LabelTextAsEntity('tomorrow', 'departure')
  editDialogModal.LabelTextAsEntity('Sunday next week', 'return')
  editDialogModal.ClickScoreActionsButton()
  memoryTableComponent.VerifyEntityInMemory('departure', 'tomorrow')
  memoryTableComponent.VerifyEntityInMemory('return', 'Sunday next week')
  scorerModal.VerifyContainsDisabledAction('When are you planning to travel?')
  let botResponse = `You are leaving on ${tomorrow} and returning on ${sundayNextWeek}`
  scorerModal.VerifyContainsEnabledAction(botResponse)
  train.SelectAction(botResponse, 'You are leaving on $departure and returning on $return')

  train.Save()
}