/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../../support/Models'
import * as modelPage from '../../../support/components/ModelPage'
import * as memoryTableComponent from '../../../support/components/MemoryTableComponent'
import * as entityDetectionPanel from '../../../support/components/EntityDetectionPanel'
import * as scorerModal from '../../../support/components/ScorerModal'
import * as trainDialogsGrid from '../../../support/components/TrainDialogsGrid'
import * as train from '../../../support/Train'
import * as helpers from '../../../support/Helpers'

// The "Expected Entity Labeling" test scenario is Part 1 and
// this "Learned Entity Labeling" test scenario is Part 2 in that 
// it continues from where the 1st test case left off by using the
// model created by that test scenario.
describe('Learned Entity Labeling', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)
  let generatedScoreActionsData = new scorerModal.GeneratedData('learnedEntityLabeling.json')

  context('Setup', () => {
    it('Should import a model and wait for training to complete', () => {
      models.ImportModel('z-learnedEntLabel', 'z-expectedEntLabl.cl')
      modelPage.NavigateToTrainDialogs()
      cy.WaitForTrainingStatusCompleted()
    })
  })

  context('Train Dialog', () => {
    it('Should create a new Train Dialog', () => {
      trainDialogsGrid.TdGrid.CreateNewTrainDialog()
    })

    it('Should auto-label Entity in user utterance based existing Train Dialog', () => {
      train.TypeYourMessage('My name is David.')
      entityDetectionPanel.VerifyTextIsLabeledAsEntity('David', 'name')
    })

    it('Should find labeled Entity in memory', () => {
      train.ClickScoreActionsButton()
      memoryTableComponent.VerifyEntityValues('name', ['David'])
    })

    generatedScoreActionsData.VerifyScoreActionsList()

    it('Should be able to select an Action', () => {
      train.SelectTextAction('Hello David')
      cy.WaitForTrainingStatusCompleted()
    })

    it('Should require manual Entity labeling', () => {
      train.TypeYourMessage('My name is Susan.')
      entityDetectionPanel.LabelTextAsEntity('Susan', 'name')
    })

    it('Should find labeled Entity in memory', () => {
      train.ClickScoreActionsButton()
      memoryTableComponent.VerifyEntityValues('name', ['Susan'])
      memoryTableComponent.VerifyDisplacedEntityValues('name', ['David'])
    })

    generatedScoreActionsData.VerifyScoreActionsList()

    it('Should be able to select an Action and save the training', () => {
      train.SelectTextAction('Hello Susan')
      train.SaveAsIsVerifyInGrid()
    })
  })
  
  context('Train Dialog Next', () => {
    it('Should wait for Training Status to Complete and then create a new Train Dialog', () => {
      cy.WaitForTrainingStatusCompleted()
      trainDialogsGrid.TdGrid.CreateNewTrainDialog()
    })

    it('Should auto-label Entity in user utterance based previous Train Dialog', () => {
      train.TypeYourMessage('My name is Gabriella.')
      entityDetectionPanel.VerifyTextIsLabeledAsEntity('Gabriella', 'name')
    })

    it('Should find labeled Entity in memory', () => {
      train.ClickScoreActionsButton()
      memoryTableComponent.VerifyEntityValues('name', ['Gabriella'])
    })

    generatedScoreActionsData.VerifyScoreActionsList()

    it('Should be able to select an Action and save the training', () => {
      train.SelectTextAction('Hello Gabriella')
      train.SaveAsIsVerifyInGrid()
    })
  })

  generatedScoreActionsData.SaveGeneratedData()
  // Manually EXPORT this to fixtures folder and name it 'z-learnedEntLabel.cl'
})