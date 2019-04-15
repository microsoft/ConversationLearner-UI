/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../support/Models'
import * as modelPage from '../../support/components/ModelPage'
import * as memoryTableComponent from '../../support/components/MemoryTableComponent'
import * as scorerModal from '../../support/components/ScorerModal'
import * as train from '../../support/Train'
import * as common from '../../support/Common'
import * as helpers from '../../support/Helpers'

describe('Date Time Resolver - Train', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)

  const today = Cypress.moment()
  const tomorrow = today.add(1, 'days').format("YYYY-MM-DD")
  const sundayNextWeek = today.add(today.day() == 0 ? 7 : 14 - today.day(), 'days').format("YYYY-MM-DD")
  const botResponse = `You are leaving on ${tomorrow} and returning on ${sundayNextWeek}`

  context('Setup', () => {
    it('Should import a model and wait for training to complete', () => {
      models.ImportModel('z-dateTimeResolvr', 'z-dateTimeResolvr.cl')
      modelPage.NavigateToTrainDialogs()
      cy.WaitForTrainingStatusCompleted()
    })
  })

  context('Train', () => {
    it('Should create a new Train Dialog and type in first user turn', () => {
      train.CreateNewTrainDialog()
      train.TypeYourMessage('Book me a flight.')
    })

    it('Should verify that we have 1 disabled and 1 enabled action to chose from', () => {
      train.ClickScoreActionsButton()
      scorerModal.VerifyContainsDisabledAction('You are leaving on $departure and returning on $return')
      scorerModal.VerifyContainsEnabledAction('When are you planning to travel?')
    })

    it('Should select the enabled action', () => {
      train.SelectAction('When are you planning to travel?')
    })

    it('Should type in the next user turn and label the departure and return dates', () => {
      train.TypeYourMessage('Leaving tomorrow and returning Sunday next week.')
      train.LabelTextAsEntity('tomorrow', 'departure')
      train.LabelTextAsEntity('Sunday next week', 'return')
    })

    it('Should verify that we have the expected entities in memory after clicking Score Actions Button', () => {
      train.ClickScoreActionsButton()
      memoryTableComponent.VerifyEntitiesInMemory('departure', ['tomorrow'])
      memoryTableComponent.VerifyEntitiesInMemory('return', ['Sunday next week'])
    })

    it('Should verify that the that the dates selected are correct and that the disabled and enabled actions are reversed from prior turn', () => {
      scorerModal.VerifyContainsEnabledAction(botResponse)
      scorerModal.VerifyContainsDisabledAction('When are you planning to travel?')
    })

    it('Should select the enabled Bot response, save the Train Dialog, and verifiy the training shows up in the grid', () => {
      train.SelectAction(botResponse, 'You are leaving on $departure and returning on $return')
      train.Save()
    })
  })
})