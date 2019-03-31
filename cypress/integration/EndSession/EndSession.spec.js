/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../support/Models'
import * as modelPage from '../../support/components/ModelPage'
import * as train from '../../support/Train'
import * as editDialogModal from '../../support/components/EditDialogModal'
import * as scorerModal from '../../support/components/ScorerModal'
import * as helpers from '../../support/Helpers'

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
      train.CreateNewTrainDialog()

      train.TypeYourMessage('Hi')
      editDialogModal.ClickScoreActionsButton()
      train.SelectAction('Hello')

      train.TypeYourMessage('Bye')
      editDialogModal.ClickScoreActionsButton()
      train.SelectEndSessionAction('Goodbye')
    })

    it('End Session Score Action should be disabled for 1st Bot turn', () => {
      editDialogModal.SelectChatTurnExactMatch('Hello')
      scorerModal.VerifyContainsDisabledEndSessionAction('Goodbye')
    })

    it('End Session Score Action should be disabled for last Bot turn', () => {
      editDialogModal.SelectChatTurnExactMatch('EndSession: Goodbye')
      scorerModal.VerifyContainsDisabledEndSessionAction('Goodbye')
    })

    it('End Session chat turn should only contain a delete turn button.', () => {
      editDialogModal.VerifyEndSessionChatTurnControls()
    })

    it('Should save the training', () => {
      train.Save()
    })
  })

  context('Edit Train Dialog', () => {
    it('Should be able to edit the training that we just saved', () => {
      cy.WaitForTrainingStatusCompleted()
      train.EditTraining('Hi', 'Bye', "EndSession: Goodbye")
    })

    it('Should delete EndSession turn', () => {
      editDialogModal.SelectChatTurnExactMatch('EndSession: Goodbye')
      editDialogModal.ClickDeleteChatTurn()
    })

    it('End Session Action should be disabled for remaining Bot turn', () => {
      editDialogModal.SelectChatTurnExactMatch('Hello')
      scorerModal.VerifyContainsDisabledEndSessionAction('Goodbye')
    })

    it('Should delete last user turn and cause a Bot turn to be the last turn', () => {
      editDialogModal.SelectChatTurnExactMatch('Hello')
      editDialogModal.ClickDeleteChatTurn()
    })

    it('End Session Action should now be enabled', () => {
      editDialogModal.SelectChatTurnExactMatch('Hello')
      scorerModal.VerifyContainsEnabledEndSessionAction('Goodbye')
    })

    it('Should abandon our changes', () => {
      editDialogModal.ClickAbandonDeleteButton()
    })
  })

  context('Edit another Train Dialog', () => {
    it('Should be able to edit a training that came with the model we imported', () => {
      cy.WaitForTrainingStatusCompleted()
      train.EditTraining('Yo', 'Bye', "EndSession: Goodbye")
    })

    it('End Session Score Action should be disabled for last Bot turn', () => {
      editDialogModal.SelectChatTurnExactMatch('EndSession: Goodbye')
      scorerModal.VerifyContainsDisabledEndSessionAction('Goodbye')
    })

    it('End Session chat turn should only contain a delete turn button.', () => {
      editDialogModal.VerifyEndSessionChatTurnControls()
    })

    it('End Session Score Action should be disabled for 1st Bot turn', () => {
      editDialogModal.SelectChatTurnExactMatch('Okay')
      scorerModal.VerifyContainsDisabledEndSessionAction('Goodbye')
    })

    it('Should insert a new Bot turn whose Action is automatically selected', () => {
      editDialogModal.InsertBotResponseAfter('Okay')
    })

    it('Verify that the automatically selected Bot turn is NOT our EndSession Action', () => {
      editDialogModal.VerifyChatTurnDoesNotContain('EndSession Goodbye')
    })
  })
})

