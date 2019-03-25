/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../support/Models'
import * as modelPage from '../../support/components/ModelPage'
import * as memoryTableComponent from '../../support/components/MemoryTableComponent'
import * as scorerModal from '../../support/components/ScorerModal'
import * as train from '../../support/Train'
import * as editDialogModal from '../../support/components/EditDialogModal'
import * as common from '../../support/Common'

describe('Train', () => {
  it('Book Me A Flight', () => {
    models.ImportModel('z-BookMeAFlight', 'z-travel.cl')
    modelPage.NavigateToTrainDialogs()
    cy.WaitForTrainingStatusCompleted()

    train.CreateNewTrainDialog()

    train.TypeYourMessage('Book me a flight.')
    editDialogModal.ClickScoreActionsButton()
    scorerModal.VerifyContainsDisabledAction('You are leaving on $departure and returning on $return')
    scorerModal.VerifyContainsEnabledAction('When are you planning to travel?')
    train.SelectAction('When are you planning to travel?')

    const today = Cypress.moment()
    const tomorrow = today.add(1, 'days').format("YYYY-MM-DD")
    const sundayNextWeek = today.add(today.day() == 0 ? 7 : 14 - today.day(), 'days').format("YYYY-MM-DD")
    train.TypeYourMessage('Leaving tomorrow and returning Sunday next week.')
    editDialogModal.LabelTextAsEntity('tomorrow', 'departure')
    editDialogModal.LabelTextAsEntity('Sunday next week', 'return')
    editDialogModal.ClickScoreActionsButton()
    memoryTableComponent.VerifyEntitiesInMemory('departure', ['tomorrow'])
    memoryTableComponent.VerifyEntitiesInMemory('return', ['Sunday next week'])
    scorerModal.VerifyContainsDisabledAction('When are you planning to travel?')
    const botResponse = `You are leaving on ${tomorrow} and returning on ${sundayNextWeek}`
    scorerModal.VerifyContainsEnabledAction(botResponse)
    train.SelectAction(botResponse, 'You are leaving on $departure and returning on $return')

    train.Save()
  })
})