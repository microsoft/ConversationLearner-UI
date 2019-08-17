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

describe('Comprehensive 2 - Score Actions', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)
  let generatedScoreActionsData = new scorerModal.GeneratedData('comprehensive.json')

  context('Setup', () => {
    it('Should import a model to test against, navigate to Train Dialogs view and wait for training status to complete', () => {
      models.ImportModel('z-comprehensive2', 'z-comprehensive1.cl')
      modelPage.NavigateToTrainDialogs()
      cy.WaitForTrainingStatusCompleted()
    })
  })

  context('Continue Training', () => {
    it('Edit existing Train Dialog', () => {
      train.EditTraining('Hi', 'I love oranges!', 'I like $fruit{enter} too')
    })

    it('User prompts Bot for other Actions', () => {
      train.TypeYourMessage('Render these API Arguments: OneFromAnEntity, TwoToBeUsedByApiCall - and temporarily disqualify the Api response')
      train.LabelTextAsEntity('OneFromAnEntity', '1stArg')
      train.LabelTextAsEntity('TwoToBeUsedByApiCall', '2ndArg')
      train.LabelTextAsEntity('disqualify', 'disqualifier')
    })

    it('Create Bot response about the choice of fruit', () => {
      train.ClickScoreActionsButton()
      scorerModal.ClickAddActionButton()

      actions.ClickAddEntityButton()
      entities.CreateNewEntity({ name: '1stArg' })
      actions.ClickAddEntityButton()
      entities.CreateNewEntity({ name: '2ndArg' })
      actions.ClickAddEntityButton()
      entities.CreateNewEntity({ name: 'disqualifier' })
      
      actions.CreateNewAction({ 
        responseNameData: 'RenderTheArgs',
        type: 'API',
        logicArgs: ['$1stArg{enter}', '$2ndArg{enter}', '333', '4444', 'five', 'six', 'seven'],                                          
        renderArgs: ['$1stArg{enter}', '$2ndArg{enter}', 'three', 'four', '55555', '666666', '7777777'],
        validateApiResponse: 'RenderTheArgslogic(memoryManager, firstArg, secondArg, thirdArg, fourthArg, fifthArg, sixthArg, seventhArg)firstArg:"$1stArg"secondArg:"$2ndArg"thirdArg:"333"fourthArg:"4444"fifthArg:"five"sixthArg:"six"seventhArg:"seven"render(result, memoryManager, firstArg, secondArg, thirdArg, fourthArg, fifthArg, sixthArg, seventhArg)firstArg:"$1stArg"secondArg:"$2ndArg"thirdArg:"three"fourthArg:"four"fifthArg:"55555"sixthArg:"666666"seventhArg:"7777777"',
        disqualifyingEntities: ['disqualifier']
      })
      // When the Action cannot be selected because it is disqualified like this one is at this point in the test, 
      // then nothing is automatically selected and the user must chose what to do next.

      actions.CreateNewAction({ responseNameData: 'Uhhhh...' })
    })

    generatedScoreActionsData.VerifyScoreActionsList()

    it('Label entities in prior User Turn to cause a change in the API qualification', () => {
      train.SelectChatTurnStartsWith('Render these API Arguments')
      train.LabelTextAsEntity('OneFromAnEntity', '1stArg')
      train.LabelTextAsEntity('TwoToBeUsedByApiCall', '2ndArg')
      train.LabelTextAsEntity('disqualify', 'disqualifier')
    })

    it('', () => {
    })

    it('', () => {
    })
  })
})