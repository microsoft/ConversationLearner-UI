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

describe('Expected Entity Labeling - Train', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)

  context('Setup', () => {
    it('Should import a model to test against, navigate to Train Dialogs view and wait for training status to complete', () => {
      models.ImportModel('z-expectedEntLabel', 'z-whatsYourName.cl')
      modelPage.NavigateToTrainDialogs()
      cy.WaitForTrainingStatusCompleted()
    })
  })

  context('Train Dialog - 1st Round', () => {
    it('Should create a new Train Dialog', () => {
      train.CreateNewTrainDialog()
    })

    it('Should type in a user utterance and click Score Actions button', () => {
      train.TypeYourMessage('Hello')
      train.ClickScoreActionsButton()
    })

    it('Should verify the Action list contains 1 enabled and 1 disabled Action', () => {
      scorerModal.VerifyContainsEnabledAction(common.whatsYourName)
      scorerModal.VerifyContainsDisabledAction('Hello $name')
    })

    it('Should select an action', () => {
      train.SelectAction(common.whatsYourName)
    })
  })

  context('Train Dialog - 2nd Round', () => {
    it('Should type in another user utterance, verify it was labeled as the "name" entity and click Score Actions button', () => {
      train.TypeYourMessage('David')
      train.VerifyEntityLabel('David', 'name')
      train.ClickScoreActionsButton()
    })

    it('Should verify the "name" Entity is in memory with its value', () => {
      memoryTableComponent.VerifyEntitiesInMemory('name', ['David'])
    })

    it('Should verify the Action list contains 1 enabled Action and 3 disabled Actions', () => {
      scorerModal.VerifyContainsDisabledAction(common.whatsYourName)
      scorerModal.VerifyContainsEnabledAction('Hello David')
    })

    it('Should select an action', () => {
      train.SelectAction('Hello David', 'Hello $name')
    })

    it('Should save the Train Dialog and verify that it shows up in the grid', () => {
      train.Save()
    })
  })
  // Manually EXPORT this to fixtures folder and name it 'z-expectedEntLabel.cl'
})
