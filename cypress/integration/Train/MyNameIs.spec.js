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

describe('My Name Is - Train Dialog', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)

  context('Setup', () => {
    it('Should import a model and wait for training to complete', () => {
      models.ImportModel('z-myNameIs', 'z-myNameIs.cl')
      modelPage.NavigateToTrainDialogs()
      cy.WaitForTrainingStatusCompleted()
    })
  })
  
  context('Train Dialog', () => {
    it('Should create a new Train Dialog', () => {
      train.CreateNewTrainDialog()
    })

    it('Should auto-label Entity in user utterance based existing Train Dialog', () => {
      train.TypeYourMessage('My name is David.')
      train.VerifyEntityLabel('David', 'name')
    })

    it('Should find labeled Entity in memory', () => {
      train.ClickScoreActionsButton()
      memoryTableComponent.VerifyEntitiesInMemory('name', ['David'])
    })

    it('Should show one disabled and one enabled Action', () => {
      scorerModal.VerifyContainsDisabledAction(common.whatsYourName)
      scorerModal.VerifyContainsEnabledAction('Hello David')
    })

    it('Should be able to select an Action', () => {
      train.SelectAction('Hello David', 'Hello $name')
      cy.WaitForTrainingStatusCompleted()
    })

    it('Should require manual Entity labeling', () => {
      train.TypeYourMessage('My name is Susan.')
      train.LabelTextAsEntity('Susan', 'name')
    })

    it('Should find labeled Entity in memory', () => {
      train.ClickScoreActionsButton()
      memoryTableComponent.VerifyEntitiesInMemory('name', ['Susan'], 'David')
    })

    it('Should show one disabled and one enabled Action', () => {
      scorerModal.VerifyContainsDisabledAction(common.whatsYourName)
      scorerModal.VerifyContainsEnabledAction('Hello Susan')
    })

    it('Should be able to select an Action and save the training', () => {
      train.SelectAction('Hello Susan', 'Hello $name')
      train.Save()
    })
  })
  
  context('Train Dialog Next', () => {
    it('Should create a new Train Dialog', () => {
      cy.WaitForTrainingStatusCompleted()

      // Hack to deal with "Bug 1901: Training Status is Misleading Causes Automatic Entity Labeling to NOT be Consistent"
      cy.wait(30000)

      train.CreateNewTrainDialog()
    })

    it('Should auto-label Entity in user utterance based previous Train Dialog', () => {
      train.TypeYourMessage('My name is Gabriella.')
      train.VerifyEntityLabel('Gabriella', 'name')
    })

    it('Should find labeled Entity in memory', () => {
      train.ClickScoreActionsButton()
      memoryTableComponent.VerifyEntitiesInMemory('name', ['Gabriella'])
    })

    it('Should show one disabled and one enabled Action', () => {
      scorerModal.VerifyContainsDisabledAction(common.whatsYourName)
      scorerModal.VerifyContainsEnabledAction('Hello Gabriella')
    })

    it('Should be able to select an Action and save the training', () => {
      train.SelectAction('Hello Gabriella', 'Hello $name')
      train.Save()
    })
    // Manually EXPORT this to fixtures folder and name it 'z-nameTrained.cl'
  })
})