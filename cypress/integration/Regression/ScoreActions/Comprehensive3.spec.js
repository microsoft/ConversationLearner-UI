/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../../support/Models'
import * as modelPage from '../../../support/components/ModelPage'
import * as entities from '../../../support/Entities'
import * as actions from '../../../support/Actions'
import * as actionModal from '../../../support/components/ActionModal'
import * as scorerModal from '../../../support/components/ScorerModal'
import * as common from '../../../support/Common'
import * as train from '../../../support/Train'
import * as common from '../../../support/Common'
import * as helpers from '../../../support/Helpers'

describe('Comprehensive 3 - Score Actions', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)
  let generatedScoreActionsData = new scorerModal.GeneratedData('comprehensive3.json')

  context('Setup', () => {
    it('Should import a model to test against, navigate to Train Dialogs view and wait for training status to complete', () => {
      models.ImportModel('z-comprehensive3', 'z-comprehensive2.cl')
      modelPage.NavigateToTrainDialogs()
      cy.WaitForTrainingStatusCompleted()
    })
  })

  context('Continue Training', () => {
    it('Edit existing Train Dialog', () => {
      train.EditTraining('Hi', 
                         'Render these API Arguments: OneFromAnEntity, TwoToBeUsedByApiCall - and temporarily disqualify the Api response', 
                         'RenderTheArgs')
    })

    it('Add two more entities', () => {
      train.ClickScoreActionsButton()
      train.SelectLastChatTurn()
      scorerModal.ClickAddActionButton()

      actionModal.ClickAddEntityButton()
      entities.CreateNewEntity({ name: 'clear', multiValued: true })

      actionModal.ClickAddEntityButton()
      entities.CreateNewEntity({ name: 'set', multiValued: true })

      actionModal.ClickCancelButton()
    })

    it('Add another Bot response', () => {
      scorerModal.ClickTextAction('Uhhhh...')
      train.SelectLastChatTurn()
    })

    generatedScoreActionsData.VerifyScoreActionsList()

    it('User turn that will facilitate clearing out some entities', () => {
      // The Entity labels in this turn will be edited and changed multiple times.
      // The text that is labeled as the 'clear' Entity will cause those values to be 
      // cleared whenever the 'ClearMemory' API is used.
      train.TypeYourMessage('Clear Entity Values: 1stArg - 2ndArg - disqualifier - clear - fruit - name - set')
      train.LabelTextAsEntity('1stArg', 'clear')
      train.LabelTextAsEntity('2ndArg', 'clear')
      train.ClickScoreActionsButton()
    })

    it('Create an API Action to clear Entities listed in the "clear" Entity', () => {
      scorerModal.ClickAddActionButton()

      actions.CreateNewAction({ 
        responseNameData: 'ClearMemory',
        type: 'API',
        logicArgs: ['$clear{enter}'],
                                                  
        uncheckWaitForResponse: true
      })
    })

    generatedScoreActionsData.VerifyScoreActionsList()

    it('Next Bot Response - Create Prompt with Picture that uses the fruit entity', () => {
      scorerModal.ClickAddActionButton()
      actions.CreateNewAction({ 
        type: 'CARD',
        responseNameData: 'promptWithPicture',
        title: 'Do you like flowers?',
        image: 'https://cdn.pixabay.com/photo/2018/10/30/16/06/water-lily-3784022__340.jpg',
        line1: 'Flowers make life beautiful',
        line2: '$fruit{enter} start out as a flower',
        line3: 'Bees Like Flowers',
        button1: 'I Like Flowers',
        button2: 'Flowers are for the birds and bees',
        //requiredEntities: ['fruit'], 
        disqualifyingEntities: ['1stArg', '2ndArg'], 
      })
    })

    it('Create an API Action to set Entities listed in the "clear" Entity', () => {
      train.TypeYourMessage('Set Entities: 1stArg: FirstArg - 2ndArg: SecondArg - fruit: PEACHES - name: Cindy - disqualifier: DISQUALIFIED')
      train.LabelTextAsEntity('fruit: PEACHES', 'set')
      train.LabelTextAsEntity('2ndArg: SecondArg', 'set')
      train.ClickScoreActionsButton()
    })

    generatedScoreActionsData.VerifyScoreActionsList()

    it('Create an action to set some entities', () => {
      scorerModal.ClickAddActionButton()
      actions.CreateNewAction({ 
        responseNameData: 'SetMemory',
        type: 'API',
        logicArgs: ['$set{enter}'],                                          
        uncheckWaitForResponse: true
      })
    })

    it('Bot Response to finish the round and allow scrutiny of the Action scores', () => {
      scorerModal.ClickTextAction('Uhhhh...')
      train.SelectLastChatTurn()
    })

    generatedScoreActionsData.VerifyScoreActionsList()

    it('Save the Train Dialog', () => {
      train.SaveAsIs()
    })
  })

  generatedScoreActionsData.SaveGeneratedData()
  // Manually EXPORT this to fixtures folder and name it 'z-comprehensive3.cl'
})