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
import * as train from '../../../support/Train'
import * as common from '../../../support/Common'
import * as helpers from '../../../support/Helpers'

describe('Comprehensive 4 - Score Actions', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)
  let generatedScoreActionsData = new scorerModal.GeneratedData('comprehensive4.json')

  context('Setup', () => {
    it('Should import a model to test against, navigate to Train Dialogs view and wait for training status to complete', () => {
      models.ImportModel('z-comprehensive4', 'z-comprehensive3.cl')
      modelPage.NavigateToTrainDialogs()
      cy.WaitForTrainingStatusCompleted()
    })
  })

  context('Continue Training', () => {
    it('Edit existing Train Dialog', () => {
      train.EditTraining('Hi',
                         'Set Entities: 1stArg: FirstArg - 2ndArg: SecondArg - fruit: PEACHES - name: Cindy - disqualifier: DISQUALIFIED', 
                         'Uhhhh...')
    })

    it('User Turn Apples and Bananas', () => {
      train.TypeYourMessage('Apples and Bananas')
      train.ClickScoreActionsButton()
    })

    it('Bot Response APPLES', () => {
        scorerModal.ClickSetEntityAction('fruit: APPLES')
    })

    generatedScoreActionsData.VerifyScoreActionsList()
    
    it('Bot Response BANANAS', () => {
      scorerModal.ClickSetEntityAction('fruit: BANANAS')
    })

    generatedScoreActionsData.VerifyScoreActionsList()

    it('Bot Response Uhhh...', () => {
      scorerModal.ClickTextAction('Uhhhh...')
      train.SelectLastChatTurn()
    })

    it('User Turn Mangoes and Peaches', () => {
      train.TypeYourMessage('Mangoes and Peaches')
      train.ClickScoreActionsButton()
    })

    generatedScoreActionsData.VerifyScoreActionsList()

    it('Bot Response MANGOES', () => {
      scorerModal.ClickSetEntityAction('fruit: MANGOES')
    })

    generatedScoreActionsData.VerifyScoreActionsList()
    
    it('Bot Response PEACHES', () => {
      scorerModal.ClickSetEntityAction('fruit: PEACHES')
    })

    generatedScoreActionsData.VerifyScoreActionsList()

    it('Bot Responds with End Session', () => {
      scorerModal.ClickAddActionButton()
      actions.CreateNewAction({ type: 'END_SESSION', responseNameData: "Goodbye" })
      train.SelectLastChatTurn()
    })

    generatedScoreActionsData.VerifyScoreActionsList()

    it('Save the Train Dialog', () => {
      train.SaveAsIs()
    })
  })

  generatedScoreActionsData.SaveGeneratedData()
  // Manually EXPORT this to fixtures folder and name it 'z-comprehensive4.cl'
})