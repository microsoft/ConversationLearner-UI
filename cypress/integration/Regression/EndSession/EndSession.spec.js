/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as homePage from '../../../support/components/HomePage'
import * as models from '../../../support/Models'
import * as modelPage from '../../../support/components/ModelPage'
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
      train.CreateNewTrainDialog()

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
      train.SelectChatTurnExactMatch('Hello')
      scorerModal.VerifyContainsDisabledEndSessionAction('Goodbye')
    })

    it('End Session Score Action button should be labeled "Selected" for last Bot turn', () => {
      train.SelectChatTurnExactMatch('EndSession: Goodbye')
      scorerModal.VerifyContainsSelectedEndSessionAction('Goodbye')
    })

    it('End Session chat turn should only contain a delete turn button.', () => {
      train.VerifyEndSessionChatTurnControls()
    })

    it('Should save the training', () => {
      train.SaveAsIsVerifyInGrid()
    })
  })

  context('Edit Train Dialog', () => {
    it('Should be able to edit the training that we just saved', () => {
      cy.WaitForTrainingStatusCompleted()
      train.EditTraining('Hi', 'Bye', "Goodbye")
    })

    it('Should delete EndSession turn', () => {
      train.SelectChatTurnExactMatch('EndSession: Goodbye')
      train.ClickDeleteChatTurn()
    })

    it('End Session Action should be disabled for remaining Bot turn', () => {
      train.SelectChatTurnExactMatch('Hello')
      scorerModal.VerifyContainsDisabledEndSessionAction('Goodbye')
    })

    it('Should delete last user turn and cause a Bot turn to be the last turn', () => {
      train.SelectChatTurnExactMatch('Bye')
      train.ClickDeleteChatTurn()
    })

    it('End Session Action should now be enabled', () => {
      train.SelectChatTurnExactMatch('Hello')
      scorerModal.VerifyContainsEnabledEndSessionAction('Goodbye')
    })

    it('Should abandon our changes', () => {
      train.ClickAbandonDeleteButton()
      homePage.ClickConfirmButton()
    })
  })

  context('Edit another Train Dialog', () => {
    it('Should be able to edit a training that came with the model we imported', () => {
      cy.WaitForTrainingStatusCompleted()
      train.EditTraining('Yo', 'Bye', "Goodbye")
    })

    it('End Session Score Action button should be labeled "Selected" for last Bot turn', () => {
      train.SelectChatTurnExactMatch('EndSession: Goodbye')
      scorerModal.VerifyContainsSelectedEndSessionAction('Goodbye')
    })

    it('End Session chat turn should only contain a delete turn button.', () => {
      train.VerifyEndSessionChatTurnControls()
    })

    it('End Session Score Action should be disabled for 1st Bot turn', () => {
      train.SelectChatTurnExactMatch('Okay')
      scorerModal.VerifyContainsDisabledEndSessionAction('Goodbye')
    })

    it('Should insert a new Bot turn whose Action is automatically selected', () => {
      train.InsertBotResponseAfter('Okay')
    })

    it('Verify that the automatically selected Bot turn is NOT our EndSession Action', () => {
      train.VerifyChatTurnIsNotAnExactMatch('EndSession: Goodbye', 5, 2)
    })
  })
})

