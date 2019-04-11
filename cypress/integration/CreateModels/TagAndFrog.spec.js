/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../support/Models'
import * as modelPage from '../../support/components/ModelPage'
import * as entities from '../../support/Entities'
import * as actions from '../../support/Actions'
import * as train from '../../support/Train'
import * as memoryTableComponent from '../../support/components/MemoryTableComponent'
import * as common from '../../support/Common'
import * as helpers from '../../support/Helpers'

describe('Tag And Frog - Create Model', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)
  
  context('Create', () => {
    it('Create a model to test against', () => {
      // models.ImportModel('z-tagAndFrog', 'z-tagAndFrog.cl')
      models.CreateNewModel('z-tagAndFrog')
    })

    it('Create a Multivalue Entity', () => {
      entities.CreateNewEntity({ name: 'multi', multiValued: true })
    })

    it('Create two Actions', () => {
      actions.CreateNewActionThenVerifyInGrid({ response: "Hello" })
      actions.CreateNewActionThenVerifyInGrid({ response: "Hi" })
    })
  })

  context('Train', () => {
    it('Create a new Training Dialog', () => {
      modelPage.NavigateToTrainDialogs()
      cy.WaitForTrainingStatusCompleted()
      train.CreateNewTrainDialog()
    })

    // ------------------------------------------------------------------------
    // This block of code should be removed once we determine and fix the cause
    // of: Bug 1901-Automatic Entity Labeling Is NOT Consistent
    // ------------------------------------------------------------------------
    it('Create a SPECIAL Training Dialog to deal with bug 1901', () => {
      train.TypeDescription('Tag Only')
      train.AddTags(['Tag'])
    
      train.TypeYourMessage('This is Tag.')
      train.LabelTextAsEntity('Tag', 'multi')
      train.ClickScoreActionsButton()
      train.SelectAction('Hello')

      train.Save()

      modelPage.NavigateToTrainDialogs()
      cy.WaitForTrainingStatusCompleted()
      train.CreateNewTrainDialog()
    })
    // ------------------------------------------------------------------------

    it('Label single word as an entity.', () => {
      train.TypeDescription('Both Tag & Frog')
      train.AddTags(['Tag', 'Frog'])

      train.TypeYourMessage('This is Tag.')
      train.LabelTextAsEntity('Tag', 'multi', false)
      train.ClickScoreActionsButton()
      // TODO: Verify that the entity was labeled and now in memory.
      train.SelectAction('Hello')
      cy.WaitForTrainingStatusCompleted()
    })
    
    it('Label multiple words as the same entity.', () => {
      train.TypeYourMessage('This is Frog and Tag.')
      memoryTableComponent.VerifyEntitiesInMemory('multi', ['Tag'])
      train.VerifyEntityLabel('Tag', 'multi')
      train.LabelTextAsEntity('Frog', 'multi', false)
      train.ClickScoreActionsButton()
      memoryTableComponent.VerifyEntitiesInMemory('multi', ['Tag', 'Frog'])
      train.SelectAction('Hi')
      cy.WaitForTrainingStatusCompleted()
    })

    it('Reverse the labeled words and once again label them as the same entity.', () => {
      train.TypeYourMessage('This is Tag and Frog.')
      memoryTableComponent.VerifyEntitiesInMemory('multi', ['Tag', 'Frog'])
      train.VerifyEntityLabel('Tag', 'multi')
      train.VerifyEntityLabel('Frog', 'multi', 1)
      train.ClickScoreActionsButton()
      train.SelectAction('Hi')

      train.Save()
    })

    // Manually EXPORT this to fixtures folder and name it 'z-tagAndFrog.cl'
  })
})