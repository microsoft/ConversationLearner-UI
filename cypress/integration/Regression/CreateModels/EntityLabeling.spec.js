/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../../support/Models'
import * as modelPage from '../../../support/components/ModelPage'
import * as entities from '../../../support/Entities'
import * as actions from '../../../support/Actions'
import * as train from '../../../support/Train'
import * as memoryTableComponent from '../../../support/components/MemoryTableComponent'
import * as common from '../../../support/Common'
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
      train.CreateNewTrainDialog()
    })

    it('Label single word as an entity.', () => {
      train.TypeDescription('Both Tag & Frog')
      train.AddTags(['Tag', 'Frog'])

      train.TypeYourMessage('This is Tag.')
      train.LabelTextAsEntity('Tag', 'multi', false)
      train.ClickScoreActionsButton()
      train.SelectTextAction('Hello')
    })
    
    it('Save the training and re-edit it to later verify Entity recognition', () => {
      train.SaveAsIsVerifyInGrid()
      cy.WaitForTrainingStatusCompleted()
      train.EditTraining('This is Tag.', 'This is Tag.', 'Hello')
    })

    it('Label multiple words as the same entity.', () => {
      train.TypeYourMessage('This is Frog and Tag.')
      memoryTableComponent.VerifyEntityValues('multi', ['Tag'])
      train.VerifyEntityLabel('Tag', 'multi')
      train.LabelTextAsEntity('Frog', 'multi', false)
      train.ClickScoreActionsButton()
      memoryTableComponent.VerifyEntityValues('multi', ['Tag', 'Frog'])
      train.SelectTextAction('Hi')
    })

    it('Save the training and re-edit it to later verify Entity recognition', () => {
      train.SaveAsIsVerifyInGrid()
      cy.WaitForTrainingStatusCompleted()
      train.EditTraining('This is Tag.', 'This is Frog and Tag.', 'Hi')
    })

    it('Reverse the labeled words and once again label them as the same entity.', () => {
      train.TypeYourMessage('This is Tag and Frog.')
      memoryTableComponent.VerifyEntityValues('multi', ['Tag', 'Frog'])
      train.VerifyEntityLabel('Tag', 'multi')
      train.VerifyEntityLabel('Frog', 'multi')
      train.ClickScoreActionsButton()
      train.SelectTextAction('Hi')

      train.SaveAsIsVerifyInGrid()
    })

    // Manually EXPORT this to fixtures folder and name it 'z-entityLabeling.cl'
  })
})