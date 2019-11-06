/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../../../support/Models'
import * as modelPage from '../../../../support/components/ModelPage'
import * as entities from '../../../../support/Entities'
import * as actions from '../../../../support/Actions'
import * as actionModal from '../../../../support/components/ActionModal'
import * as scorerModal from '../../../../support/components/ScorerModal'
import * as entityDetectionPanel from '../../../../support/components/EntityDetectionPanel'
import * as chatPanel from '../../../../support/components/ChatPanel'
import * as trainDialogsGrid from '../../../../support/components/TrainDialogsGrid'
import * as train from '../../../../support/Train'
import * as helpers from '../../../../support/Helpers'

describe('Comprehensive 2 - Score Actions', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)
  let generatedScoreActionsData = new scorerModal.GeneratedData('comprehensive2.json')

  context('Setup', () => {
    it('Should import a model to test against, navigate to Train Dialogs view and wait for training status to complete', () => {
      models.ImportModel('z-comprehensive2', 'z-comprehensive1.cl')
      modelPage.NavigateToTrainDialogs()
      cy.WaitForTrainingStatusCompleted()
    })
  })

  context('Continue Training', () => {
    it('Edit existing Train Dialog', () => {
      trainDialogsGrid.TdGrid.EditTrainingByChatInputs('Hi', 'I love oranges!', 'I like $fruit too')
    })

    it('User prompts Bot for other Actions', () => {
      train.TypeYourMessage('Render these API Arguments: OneFromAnEntity, TwoToBeUsedByApiCall - and temporarily disqualify the Api response')
      train.ClickScoreActionsButton()
    })

    generatedScoreActionsData.VerifyScoreActionsList()

    it('Create Bot response about the choice of fruit', () => {
      scorerModal.ClickAddActionButton()

      actionModal.ClickAddEntityButton()
      entities.CreateNewEntity({ name: '1stArg' })
      actionModal.ClickAddEntityButton()
      entities.CreateNewEntity({ name: '2ndArg' })
      actionModal.ClickAddEntityButton()
      entities.CreateNewEntity({ name: 'disqualifier' })
      
      actions.CreateNewAction({ 
        responseNameData: 'RenderTheArgs',
        type: 'API',
        logicArgs: ['$1stArg{enter}', '$2ndArg{enter}', '333', '4444', 'five', 'six', 'seven'],                                          
        renderArgs: ['$1stArg{enter}', '$2ndArg{enter}', 'three', 'four', '55555', '666666', '7777777'],
        validateApiResponse: 'RenderTheArgslogic(memoryManager, firstArg, secondArg, thirdArg, fourthArg, fifthArg, sixthArg, seventhArg)firstArg:"$1stArg"secondArg:"$2ndArg"thirdArg:"333"fourthArg:"4444"fifthArg:"five"sixthArg:"six"seventhArg:"seven"render(result, memoryManager, firstArg, secondArg, thirdArg, fourthArg, fifthArg, sixthArg, seventhArg)firstArg:"$1stArg"secondArg:"$2ndArg"thirdArg:"three"fourthArg:"four"fifthArg:"55555"sixthArg:"666666"seventhArg:"7777777"',
        disqualifyingEntities: ['disqualifier'],
        uncheckWaitForResponse: true
      })
      // When the Action cannot be selected because it is disqualified like this one is at this point in the test, 
      // then nothing is automatically selected and the user must chose what to do next.

      scorerModal.ClickAddActionButton()
      actions.CreateNewAction({ responseNameData: 'Uhhhh...' })
      chatPanel.SelectLastChatTurn()
    })

    generatedScoreActionsData.VerifyScoreActionsList()

    it('Label an entity from prior User Turn to cause a change in the API qualification', () => {
      chatPanel.SelectChatTurnStartsWith('Render these')
      entityDetectionPanel.LabelTextAsEntity('disqualify', 'disqualifier')
      train.ClickSubmitChangesButton()
      chatPanel.SelectChatTurnExactMatch('Uhhhh…')
    })

    generatedScoreActionsData.VerifyScoreActionsList()

    it('Label another entity from prior User Turn to cause a change in the API qualification', () => {
      chatPanel.SelectChatTurnStartsWith('Render these')
      entityDetectionPanel.LabelTextAsEntity('OneFromAnEntity', '1stArg')
      train.ClickSubmitChangesButton()
      chatPanel.SelectChatTurnExactMatch('Uhhhh…')
    })

    generatedScoreActionsData.VerifyScoreActionsList()

    it('Label yet another entity from prior User Turn to cause a change in the API qualification', () => {
      chatPanel.SelectChatTurnStartsWith('Render these')
      entityDetectionPanel.LabelTextAsEntity('TwoToBeUsedByApiCall', '2ndArg')
      train.ClickSubmitChangesButton()
      chatPanel.SelectChatTurnExactMatch('Uhhhh…')
    })

    generatedScoreActionsData.VerifyScoreActionsList()

    it('Remove label from the disqualifying entity from prior User Turn to cause a change in the API qualification', () => {
      chatPanel.SelectChatTurnStartsWith('Render these')
      entityDetectionPanel.RemoveEntityLabel('disqualify', 'disqualifier')
      train.ClickSubmitChangesButton()
      chatPanel.SelectChatTurnExactMatch('Uhhhh…')
    })

    generatedScoreActionsData.VerifyScoreActionsList()

    it('Select RenderTheArgs API action', () => {
      train.SelectApiTextAction('RenderTheArgs', "The Logic Args: 'OneFromAnEntity', 'TwoToBeUsedByApiCall', '333', '4444', 'five', 'six', 'seven'The Render Args: 'OneFromAnEntity', 'TwoToBeUsedByApiCall', 'three', 'four', '55555', '666666', '7777777'")
    })

    it('Save the Train Dialog', () => {
      train.SaveAsIs()
    })
  })

  generatedScoreActionsData.SaveGeneratedData()
  // Manually EXPORT this to fixtures folder and name it 'z-comprehensive2.cl'
})