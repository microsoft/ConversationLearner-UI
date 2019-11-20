/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../../support/Models'
import * as modelPage from '../../../support/components/ModelPage'
import * as trainDialogsGrid from '../../../support/components/TrainDialogsGrid'
import * as chatPanel from '../../../support/components/ChatPanel'
import * as train from '../../../support/Train'
import * as helpers from '../../../support/Helpers'

describe('Bug 2119 Repro', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)
  
  let chatMessages

  context('Setup', () => {
    it('Should import a model to test against and navigate to Train Dialogs view', () => {
      models.ImportModel('z-bug2119Repro', 'z-doubleUserTurns.cl')
      modelPage.NavigateToTrainDialogs()
    })
  })

  context('Attempt to Reproduce Bug 2119', () => {
    it('Edit Train Dialog', () => {
      trainDialogsGrid.TdGrid.EditTrainingByChatInputs('User utterance #1', 'User utterance #2', 'The only response')
    })

    it('Get all of the existing chat messages', () => {
      cy.WaitForStableDOM().then(() => {
        chatMessages = chatPanel.GetAllChatMessages()
      })      
    })

    it('Add an additional user and Bot turn', () => {
      train.TypeYourMessage('User utterance #3')
      train.ClickScoreActionsButton()
      train.SelectTextAction('The only response')
    })

    // Bug 2119: User turn with error is automagically deleted when a new user turn is added
    // Once this bug is fixed comment out this block of code.
    it('Verify that Bug 2119 reproduced', () => {
      // Adjust our array of chatMessages to what the bug produces.
      chatMessages.splice(chatMessages.indexOf('User utterance #1'), 1)
    })

    it('Verify that chat messages are what we expect', () => {
      chatMessages.push('User utterance #3')
      chatMessages.push('The only response')

      chatPanel.VerifyAllChatMessages(chatMessages)
    })

    it('Save the changes', () => {
      train.SaveAsIs()
    })
  })

  context('Use 2 Instances of Double User Turns in an Attempt to Reproduce Bug 2119', () => {
    it('Edit Train Dialog', () => {
      trainDialogsGrid.TdGrid.EditTrainingByChatInputs('User utterance #1', 'User utterance #5', 'The only response')
    })

    it('Get all of the existing chat messages', () => {
      cy.WaitForStableDOM().then(() => {
        chatMessages = chatPanel.GetAllChatMessages()
      })      
    })

    it('Add an additional user and Bot turn', () => {
      train.TypeYourMessage('User utterance #6')
      train.ClickScoreActionsButton()
      train.SelectTextAction('The only response')
    })

    // Bug 2119: User turn with error is automagically deleted when a new user turn is added
    // Once this bug is fixed comment out this block of code.
    it('Verify that Bug 2119 reproduced', () => {
      // Adjust our array of chatMessages to what the bug produces.
      chatMessages.splice(chatMessages.indexOf('User utterance #4'), 1)
      chatMessages.splice(chatMessages.indexOf('User utterance #2'), 1)
    })

    it('Verify that chat messages are what we expect', () => {
      chatMessages.push('User utterance #6')
      chatMessages.push('The only response')

      chatPanel.VerifyAllChatMessages(chatMessages)
    })

    it('Save the changes', () => {
      train.SaveAsIs()
    })
  })
})
