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

    it('End Session Action should be disabled for 1st Bot turn', () => {
      editDialogModal.SelectChatTurnExactMatch('Hello')
      scorerModal.VerifyContainsDisabledEndSessionAction('Goodbye')
    })

    it('End Session Action should be disabled for last Bot turn', () => {
      editDialogModal.SelectChatTurnExactMatch('EndSession: Goodbye')
      scorerModal.VerifyContainsDisabledEndSessionAction('Goodbye')
    })

    it('End Session chat turn should only contain a delete Action button.', () => {
      editDialogModal.VerifyEndSessionChatTurnControls()
    })

    it('Should save the training', () => {
      train.Save()
  })

  context('Edit Train Dialog', () => {
    it('Should be able to edit training that we just saved', () => {
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

    it('Should delete last user turn', () => {
      editDialogModal.SelectChatTurnExactMatch('Hello')
      editDialogModal.ClickDeleteChatTurn()
    })

    it('Now that the Bot turn is the last turn, the End Session Action should be enabled', () => {
      editDialogModal.SelectChatTurnExactMatch('Hello')
      scorerModal.VerifyContainsDisabledEndSessionAction('Goodbye')
    })

    it('Should', () => {
    })

    it('Should', () => {
    })
    it('Should', () => {
    })

    // End Session Test Case:
  // - New Train Dialog
  // - Enter chat turns...hi, hello, bye, goodbye
  // - Verify other end session actions are disabled when clicking on a previous Bot turn.
  // - Verify add and branching buttons are missing on the End Session Bot turn
  // - Subtle nuance at 1:00 into video "C:\Users\v-miskow\Microsoft\ConvSysResearch - General\Test Videos\End Session and Edit.mp4"
  // -- Delete the existing End Session.
  // ---- verify the other bot turn still shows End Session Action as disabled
  // ---- Delete the user turn as well
  // ---- verify the other bot turn now enables the End Session Action
  // ---- ABORT there is a second saved Train Dialog we can use for editing.
  // - Another Subtle nuance at 1:55 into video
  // -- Verify editing an existing training, that End Session is disabled for all Bot turns prior to the End Session Action.
  // -- Verify that OKAY cannot be replaced with End Session Action
  // -- Delete the existing End Session.
  // ---- Score Action and pick "hello" instead of goodbye.
  // ---- Add another 'bye' user turn
  // ---- Score Action and pick goodbye.
  // ------ Verify flash of End Session at top shows up as expected.
  // ---- Select 2nd to last bye, add a Bot turn.
  // ---- Verify you don't get End Session Action
  
})