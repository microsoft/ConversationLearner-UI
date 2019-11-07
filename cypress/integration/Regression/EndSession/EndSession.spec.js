/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../../support/Models'
import * as modelPage from '../../../support/components/ModelPage'
import * as chatPanel from '../../../support/components/ChatPanel'
import * as trainDialogsGrid from '../../../support/components/TrainDialogsGrid'
import * as train from '../../../support/Train'
import * as scorerModal from '../../../support/components/ScorerModal'
import * as helpers from '../../../support/Helpers'

describe('End Session', () => {
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
      train.SelectEndSessionAction('Goodbye')
    })

    it('Should verify that the user has no way to add another turn after the EndSession turn', () => {
      train.VerifyScoreActionsButtonIsMissing()
      train.VerifyTypeYourMessageIsMissing()
    })

    it('End Session Score Action should be disabled for 1st Bot turn', () => {
      chatPanel.SelectChatTurnExactMatch('Hello')
      scorerModal.VerifyContainsDisabledEndSessionAction('Goodbye')
    })

    it('End Session Score Action button should be labeled "Selected" for last Bot turn', () => {
      chatPanel.SelectChatTurnExactMatch('EndSession: Goodbye')
      scorerModal.VerifyContainsSelectedEndSessionAction('Goodbye')
    })

    it('End Session chat turn should only contain a delete turn button.', () => {
      chatPanel.VerifyEndSessionChatTurnControls()
    })

    it('Should save the training', () => {
      train.SaveAsIsVerifyInGrid()
    })
  })

  context('Edit Train Dialog', () => {
    it('Should be able to edit the training that we just saved', () => {
      cy.WaitForTrainingStatusCompleted()
      trainDialogsGrid.TdGrid.EditTrainingByChatInputs('Hi', 'Bye', "Goodbye")
    })

    it('Should delete EndSession turn', () => {
      chatPanel.SelectChatTurnExactMatch('EndSession: Goodbye')
      train.ClickDeleteChatTurn()
    })

    it('End Session Action should be disabled for remaining Bot turn', () => {
      chatPanel.SelectChatTurnExactMatch('Hello')
      scorerModal.VerifyContainsDisabledEndSessionAction('Goodbye')
    })

    it('Should delete last user turn and cause a Bot turn to be the last turn', () => {
      chatPanel.SelectChatTurnExactMatch('Bye')
      train.ClickDeleteChatTurn()
    })

    it('End Session Action should now be enabled', () => {
      chatPanel.SelectChatTurnExactMatch('Hello')
      scorerModal.VerifyContainsEnabledEndSessionAction('Goodbye')
    })

    it('Should abandon our changes', () => {
      train.ClickAbandonDeleteButton()
      train.ClickConfirmAbandonButton()
    })
  })

  context('Edit another Train Dialog', () => {
    it('Should be able to edit a training that came with the model we imported', () => {
      cy.WaitForTrainingStatusCompleted()
      trainDialogsGrid.TdGrid.EditTrainingByChatInputs('Yo', 'Bye', "Goodbye")
    })

    it('End Session Score Action button should be labeled "Selected" for last Bot turn', () => {
      chatPanel.SelectChatTurnExactMatch('EndSession: Goodbye')
      scorerModal.VerifyContainsSelectedEndSessionAction('Goodbye')
    })

    it('End Session chat turn should only contain a delete turn button.', () => {
      chatPanel.VerifyEndSessionChatTurnControls()
    })

    it('End Session Score Action should be disabled for 1st Bot turn', () => {
      chatPanel.SelectChatTurnExactMatch('Okay')
      scorerModal.VerifyContainsDisabledEndSessionAction('Goodbye')
    })

    it('Should insert a new Bot turn whose Action is automatically selected', () => {
      chatPanel.InsertBotResponseAfter('Okay')
    })

    it('Verify that the automatically selected Bot turn is NOT our EndSession Action', () => {
      chatPanel.VerifyChatTurnIsNotAnExactMatch('EndSession: Goodbye', 5, 2)
    })
  })
})

