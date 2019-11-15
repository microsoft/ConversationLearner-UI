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
import * as common from '../../../support/Common'
import * as helpers from '../../../support/Helpers'

describe('Disqualifying Entities - Train', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)
  let generatedScoreActionsData = new scorerModal.GeneratedData('disqualifyingEntities.json')

  context('Setup', () => {
    it('Should import a model to test against, navigate to Train Dialogs view and wait for training status to complete', () => {
      models.ImportModel('z-disqualifyngEnt', 'z-disqualifyngEnt.cl')
      modelPage.NavigateToTrainDialogs()
      cy.WaitForTrainingStatusCompleted()
    })
  })

  context('1st Train Dialog', () => {
    context('1st Round', () => {
      it('Should create a new Train Dialog', () => {
        trainDialogsGrid.TdGrid.CreateNewTrainDialog()
      })

      it('Should type in a user utterance and click Score Actions button', () => {
        train.TypeYourMessage('Hey')
        train.ClickScoreActionsButton()
      })

      generatedScoreActionsData.VerifyScoreActionsList()

      it('Should select an action', () => {
        train.SelectTextAction(common.whatsYourName)
      })
    })

    context('2nd Round', () => {
      it('Should type in another user utterance, verify it is labled as the "name" Entity and click Score Actions button', () => {
        train.TypeYourMessage('Sam')
        entityDetectionPanel.VerifyTextIsLabeledAsEntity('Sam', 'name')
        train.ClickScoreActionsButton()
      })

      it('Should verify the labeled Entity appears in the Memory pane', () => {
        memoryTableComponent.VerifyEntityValues('name', ['Sam'])
      })

      generatedScoreActionsData.VerifyScoreActionsList()

      it('Should select an action', () => {
        train.SelectTextAction('Hey Sam')
      })
    })

    context('3rd Round', () => {
      it('Should type in another user utterance and click Score Actions button', () => {
        train.TypeYourMessage('Hey')
        train.ClickScoreActionsButton()
      })

      it('Should verify the labeled Entity still appears in the Memory pane', () => {
        memoryTableComponent.VerifyEntityValues('name', ['Sam'])
      })
    
      generatedScoreActionsData.VerifyScoreActionsList()

      it('Should select an action', () => {
        train.SelectTextAction('Hey Sam, what do you really want?')
      })
    })

    context('4th Round', () => {
      it('Should type in the last user utterance and click Score Actions button', () => {
        train.TypeYourMessage('world peace')
        train.ClickScoreActionsButton()
      })

      it('Should verify the 1st labeled Entity still appears in the Memory pane', () => {
        memoryTableComponent.VerifyEntityValues('name', ['Sam'])
      })

      it('Should verify that a 2nd labeled Entity also appears in the Memory pane', () => {
        memoryTableComponent.VerifyEntityValues('want', ['world peace'])
      })

      generatedScoreActionsData.VerifyScoreActionsList()

      it('Should select an action', () => {
        train.SelectTextAction("Sorry Sam, I can't help you get world peace")
      })

      it('Should save the Train Dialog and verify that it shows up in the grid', () => {
        train.SaveAsIsVerifyInGrid()
      })
    })
  })

  context('2nd Train Dialog', () => {
    context('1st Round', () => {
      it('Should create a new Train Dialog', () => {
        trainDialogsGrid.TdGrid.CreateNewTrainDialog()
      })

      it('Should type in a user utterance and click Score Actions button', () => {
        train.TypeYourMessage('I want a million dollars')
        entityDetectionPanel.LabelTextAsEntity('a million dollars', 'want')
        train.ClickScoreActionsButton()
      })

      generatedScoreActionsData.VerifyScoreActionsList()

      it('Should select an action', () => {
        train.SelectTextAction(common.whatsYourName)
      })
    })

    context('2nd Round', () => {
      it('Should type in a user utterance and click Score Actions button', () => {
        train.TypeYourMessage('Sandeep')
        entityDetectionPanel.VerifyTextIsLabeledAsEntity('Sandeep', 'name')
        train.ClickScoreActionsButton()
      })

      generatedScoreActionsData.VerifyScoreActionsList()

      it('Should select an action', () => {
        train.SelectTextAction("Sorry Sandeep, I can't help you get a million dollars")
      })

      it('Should save the Train Dialog and verify the contents show up in the grid', () => {
        train.SaveAsIsVerifyInGrid()
      })
    })
  })

  generatedScoreActionsData.SaveGeneratedData()
  // Manually EXPORT this to fixtures folder and name it 'z-disqualifyngEnt.Trained.cl'
})