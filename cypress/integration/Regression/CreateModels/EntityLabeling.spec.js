/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../../support/Models'
import * as modelPage from '../../../support/components/ModelPage'
import * as entities from '../../../support/Entities'
import * as actions from '../../../support/Actions'
import * as trainDialogsGrid from '../../../support/components/TrainDialogsGrid'
import * as train from '../../../support/Train'
import * as entityDetectionPanel from '../../../support/components/EntityDetectionPanel'
import * as memoryTableComponent from '../../../support/components/MemoryTableComponent'
import * as helpers from '../../../support/Helpers'

describe('Entity Labeling - Create Model', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)
  
  context('Create', () => {
    it('Create a model to test against', () => {
      models.CreateNewModel('z-entityLabeling')
    })

    it('Create a Multivalue Entity', () => {
      entities.CreateNewEntityThenVerifyInGrid({ name: 'multi', multiValued: true })
    })

    it('Create two Actions', () => {
      actions.CreateNewActionThenVerifyInGrid({ responseNameData: "Hello" })
      actions.CreateNewActionThenVerifyInGrid({ responseNameData: "Hi" })
    })
  })

  context('Train', () => {
    it('Create a new Training Dialog', () => {
      modelPage.NavigateToTrainDialogs()
      cy.WaitForTrainingStatusCompleted()
      trainDialogsGrid.TdGrid.CreateNewTrainDialog()
    })

    it('Label single word as an entity.', () => {
      train.TypeDescription('Both Tag & Frog')
      train.AddTags(['Tag', 'Frog'])

      train.TypeYourMessage('This is Tag.')
      entityDetectionPanel.LabelTextAsEntity('Tag', 'multi', 0, false)
      train.ClickScoreActionsButton()
      train.SelectTextAction('Hello')
    })
    
    it('Save the training and re-edit it to later verify Entity recognition', () => {
      train.SaveAsIsVerifyInGrid()
      cy.WaitForTrainingStatusCompleted()
      trainDialogsGrid.TdGrid.EditTrainingByDescriptionAndOrTags('Both Tag & Frog')
    })

    it('Label multiple words as the same entity.', () => {
      train.TypeYourMessage('This is Frog and Tag.')
      memoryTableComponent.VerifyEntityValues('multi', ['Tag'])
      entityDetectionPanel.VerifyTextIsLabeledAsEntity('Tag', 'multi')
      entityDetectionPanel.LabelTextAsEntity('Frog', 'multi', 0, false)
      train.ClickScoreActionsButton()
      memoryTableComponent.VerifyEntityValues('multi', ['Tag', 'Frog'])
      train.SelectTextAction('Hi')
    })

    it('Save the training and re-edit it to later verify Entity recognition', () => {
      train.SaveAsIsVerifyInGrid()
      cy.WaitForTrainingStatusCompleted()
      trainDialogsGrid.TdGrid.EditTrainingByDescriptionAndOrTags('Both Tag & Frog')
    })

    // Bug 2351: Inconsistant Automatic Entity Labeling
    it('Reverse the labeled words and once again label them as the same entity.', () => {
      train.TypeYourMessage('This is Tag and Frog.')
      memoryTableComponent.VerifyEntityValues('multi', ['Tag', 'Frog'])
      entityDetectionPanel.VerifyTextIsLabeledAsEntity('Tag', 'multi')
      
      // Sometimes it is labeled, sometimes it is not - bug 2351
      entityDetectionPanel.LabelTextAsEntity('Frog', 'multi', 0, false) // should not need this line of code
      //entityDetectionPanel.VerifyTextIsLabeledAsEntity('Frog', 'multi') // this is the line of code we should need
      
      train.ClickScoreActionsButton()
      train.SelectTextAction('Hi')
    })

    it('Save the training and re-edit it to later verify Entity recognition', () => {
      train.SaveAsIsVerifyInGrid()
      cy.WaitForTrainingStatusCompleted()
      trainDialogsGrid.TdGrid.EditTrainingByDescriptionAndOrTags('Both Tag & Frog')
    })

    it('Try another version of the labeled words and verify they are automatically labeled.', () => {
      train.TypeYourMessage('This is Bag and Grog.')
      entityDetectionPanel.VerifyTextIsLabeledAsEntity('Bag', 'multi')
      entityDetectionPanel.VerifyTextIsLabeledAsEntity('Grog', 'multi')
      
      train.ClickScoreActionsButton()
      train.SelectTextAction('Hi')

      train.SaveAsIsVerifyInGrid()
    })

    // Manually EXPORT this to fixtures folder and name it 'z-entityLabeling.cl'
  })
})