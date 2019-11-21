/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../../support/Models'
import * as modelPage from '../../../support/components/ModelPage'
import * as chatPanel from '../../../support/components/ChatPanel'
import * as trainDialogsGrid from '../../../support/components/TrainDialogsGrid'
import * as train from '../../../support/Train'
import * as helpers from '../../../support/Helpers'

// This test case was created to reproduce bug 2027 and prevent its regression once it is fixed.
// It was originally thought to be related to an END_SESSION Action, but it was shown to reproduce
// on a TEXT Action as well.
describe('Auto Score End Session Action - End Session', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)
  
  context('Setup', () => {
    it('Should import a model and wait for training to complete', () => {
      models.ImportModel('z-EndSession', 'z-EndSession.cl')
      modelPage.NavigateToTrainDialogs()
      cy.WaitForTrainingStatusCompleted()
    })
  })

  context('New Train Dialog', () => {
    it('Should create a new Train Dialog with an End Session Action in it', () => {
      trainDialogsGrid.TdGrid.CreateNewTrainDialog()

      train.TypeYourMessage('Hi')
      train.ClickScoreActionsButton()
      train.SelectTextAction('Hello')

      train.TypeYourMessage('Bye')
      train.ClickScoreActionsButton()
      // NOTICE that we intentionally do not select an action
    })

    it('Should save the training', () => {
      train.SaveAsIs()
    })
  })

  context('Edit Train Dialog', () => {
    it('Should be able to edit the training that we just saved', () => {
      cy.WaitForTrainingStatusCompleted()
      trainDialogsGrid.TdGrid.EditTrainingByChatInputs('Hi', 'Bye', '')
    })

    it('Should score actions for an automaticly selected Bot response', () => {
      train.ClickScoreActionsButton()
    })

    it('Should verify the automaticly selected Bot response is according to the training.', () => {
      // Bug 2027: Auto Scored Action Selection should select EndSession action if model has been trained for that.
      // Remove this comment and the following line when this bug is fixed...uncomment the next line.
      chatPanel.VerifyChatTurnIsAnExactMatch('Hello', 4, 3)
      //chatPanel.VerifyChatTurnIsAnExactMatch('EndSession: Goodbye', 4, 3)
    })

    it('Should abandon our changes', () => {
      train.ClickAbandonDeleteButton()
      train.ClickConfirmAbandonButton()
    })
  })
})

