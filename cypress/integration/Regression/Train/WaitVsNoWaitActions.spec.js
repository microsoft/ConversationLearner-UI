/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../../support/Models'
import * as modelPage from '../../../support/components/ModelPage'
import * as scorerModal from '../../../support/components/ScorerModal'
import * as train from '../../../support/Train'
import * as common from '../../../support/Common'
import * as helpers from '../../../support/Helpers'

describe('Wait vs Non Wait Actions - Train', () => {
  afterEach(() => helpers.SkipRemainingTestsOfSuiteIfFailed())

  context('Setup', () => {
    it('Should import a model to test against, navigate to Train Dialogs view and wait for training status to complete', () => {
      models.ImportModel('z-waitNoWait', 'z-waitNoWait.cl')
      modelPage.NavigateToTrainDialogs()
      cy.WaitForTrainingStatusCompleted()
    })
  })

  context('Train - 1st Round', () => {
    it('Should create a new Train Dialog', () => {
      train.CreateNewTrainDialog()
    })

    it('Should type a user message and click the Score Actions button', () => {
      train.TypeYourMessage('Hello')
      train.ClickScoreActionsButton()
    })
      
    it('Should verify all 3 actions are enabled', () => {
      scorerModal.VerifyContainsEnabledAction('Which animal would you like?')
      scorerModal.VerifyContainsEnabledAction('Cows say moo!')
      scorerModal.VerifyContainsEnabledAction(common.ducksSayQuack)
    })

    it('Should select a wait Action for the Bot Response', () => {
      train.SelectTextAction('Which animal would you like?')
    })
  })

  context('Train - 2nd Round', () => {
    it('Should type another user message and click the Score Actions button', () => {
      train.TypeYourMessage('Cow')
      train.ClickScoreActionsButton()
    })

    it('Should verify 3 actions are enabled', () => {
      scorerModal.VerifyContainsEnabledAction('Which animal would you like?')
      scorerModal.VerifyContainsEnabledAction('Cows say moo!')
      scorerModal.VerifyContainsEnabledAction(common.ducksSayQuack)
    })

    it('Should select a non-wait Action for the Bot Response', () => {
      train.SelectTextAction('Cows say moo!')
    })

    it('Should select a wait Action for the Bot Response which also verifies that the non-wait Action worked as expected', () => {
      train.SelectTextAction('Which animal would you like?')
    })
  })

  context('Train - 3rd Round', () => {
    it('Should type another user message and click the Score Actions button', () => {
      train.TypeYourMessage('Duck')
      train.ClickScoreActionsButton()
    })

    it('Should verify 3 actions are enabled', () => {
      scorerModal.VerifyContainsEnabledAction('Which animal would you like?')
      scorerModal.VerifyContainsEnabledAction('Cows say moo!')
      scorerModal.VerifyContainsEnabledAction(common.ducksSayQuack)
    })

    it('Should select a non-wait Action for the Bot Response', () => {
      train.SelectTextAction(common.ducksSayQuack)
    })

    it('Should select a wait Action for the Bot Response which also verifies that the non-wait Action worked as expected', () => {
      train.SelectTextAction('Which animal would you like?')
    })

    it('Should save the training and verify that it appears in the grid', () => {
      train.SaveAsIsVerifyInGrid()
    })
  })
})