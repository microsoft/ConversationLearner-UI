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

describe('Entity Value-Name Toggle - Score Actions', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)
  let generatedScoreActionsData = new scorerModal.GeneratedData('comprehensive4.json')

  context('Setup', () => {
    it('Create a model to test against and navigate to Train Dialogs', () => {
      models.ImportModel('z-valueNameToggle', 'z-comprehensive4.cl')
      modelPage.NavigateToTrainDialogs()
    })
  })

  context('Train Dialog', () => {
    it('Edit the Train Dialog and Bring up Score Actions Panel', () => {
      train.EditTraining('Hi', 'Mangoes and Peaches', 'Goodbye')
      train.SelectChatTurnExactMatch('Uhhhh…')
    })

    it('Toggle a Text Action then verify text changes', () => {
      scorerModal.ClickTextEntityValueNameToggleButon('Hello Jeff')
      scorerModal.VerifyContainsTextAction('Hello $name')
      scorerModal.ClickTextEntityValueNameToggleButon('Hello $name')
      scorerModal.VerifyContainsTextAction('Hello Jeff')
    })

    it('Toggle an API Action then verify text changes', () => {
      scorerModal.ClickApiEntityValueNameToggleButon('RenderTheArgs')
      scorerModal.VerifyContainsApiAction('RenderTheArgslogic(memoryManager, firstArg, secondArg, thirdArg, fourthArg, fifthArg, sixthArg, seventhArg)firstArg:"$1stArg"secondArg:"$2ndArg"thirdArg:"333"fourthArg:"4444"fifthArg:"five"sixthArg:"six"seventhArg:"seven"render(result, memoryManager, firstArg, secondArg, thirdArg, fourthArg, fifthArg, sixthArg, seventhArg)firstArg:"$1stArg"secondArg:"$2ndArg"thirdArg:"three"fourthArg:"four"fifthArg:"55555"sixthArg:"666666"seventhArg:"7777777"')
    })

    it('', () => {
    })

    it('', () => {
    })

    it('', () => {
    })

    it('', () => {
    })

    it('', () => {
    })

  })

  // Manually EXPORT this to fixtures folder and name it 'z-comprehensive1.cl'
})