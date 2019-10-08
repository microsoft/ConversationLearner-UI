/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../../../support/Models'
import * as modelPage from '../../../../support/components/ModelPage'
import * as scorerModal from '../../../../support/components/ScorerModal'
import * as train from '../../../../support/Train'
import * as helpers from '../../../../support/Helpers'

describe('Comprehensive 5 - Score Actions', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)
  let generatedScoreActionsData = new scorerModal.GeneratedData('comprehensive5.json')

  context('Setup', () => {
    it('Should import a model to test against, navigate to Train Dialogs view and wait for training status to complete', () => {
      models.ImportModel('z-comprehensive5', 'z-comprehensive4.cl')
      modelPage.NavigateToTrainDialogs()
      cy.WaitForTrainingStatusCompleted()
    })
  })

  context('Verify Action Scoring of Imported Training Without Modification', () => {
    it('Edit existing Train Dialog', () => {
      train.EditTraining('Hi', 'Mangoes and Peaches', 'Goodbye')
    })

    it('Select and Verify Each Bot Turn', () => {
      train.VerifyEachBotChatTurn(() => { generatedScoreActionsData.VerifyScoreActionsListUnwrapped() })      
    })
  })

  context('Modify the Training then Verify Action Scoring', () => {
    it('Modify Entity Labels', () => {
      train.SelectChatTurnExactMatch('My name is Jeff')
      train.RemoveEntityLabel('Jeff', 'name')
      train.ClickSubmitChangesButton()

      train.SelectChatTurnExactMatch('Render these API Arguments: OneFromAnEntity, TwoToBeUsedByApiCall - and temporarily disqualify the Api response')
      train.RemoveEntityLabel('OneFromAnEntity', '1stArg')
      train.RemoveEntityLabel('TwoToBeUsedByApiCall', '2ndArg')
      train.ClickSubmitChangesButton()

      train.SelectChatTurnExactMatch('Clear Entity Values: 1stArg - 2ndArg - disqualifier - clear - fruit - name - set')
      train.RemoveEntityLabel('1stArg', 'clear')
      train.RemoveEntityLabel('2ndArg', 'clear')
      train.ClickSubmitChangesButton()

      train.SelectChatTurnExactMatch('Set Entities: 1stArg: FirstArg - 2ndArg: SecondArg - fruit: PEACHES - name: Cindy - disqualifier: DISQUALIFIED')
      train.RemoveEntityLabel('2ndArg:', 'set')
      train.RemoveEntityLabel('fruit:', 'set')
      train.LabelTextAsEntity('1stArg: FirstArg', '1stArg')
      train.LabelTextAsEntity('disqualifier: DISQUALIFIED', 'disqualifier')
      train.ClickSubmitChangesButton()

      train.ClickReplayButton()
    })

    it('Select and Verify Each Bot Turn', () => {
      train.VerifyEachBotChatTurn(() => { generatedScoreActionsData.VerifyScoreActionsListUnwrapped() })      
    })

    it('Save the Train Dialog', () => {
      train.SaveAsIs()
    })
  })

  generatedScoreActionsData.SaveGeneratedData()
  // Manually EXPORT this to fixtures folder and name it 'z-comprehensive5.cl'
})