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

/*
Planning and Design - I'm looking for feedback about this, will write up a new Feature Work Item if you all agree...

As I am writing tests for this Entity Value/Name Toggle feature it occurs to me that this is more complex than it needs to be, not only for the test code, but also for the user. It seems to me that we should have only one toggle switch and it should affect all Actions in the Score Actions panel, rather than one for each action.

The way it is now, the user has to click on multiple toggles to see all the Entity names in the Score Actions panel...as for test code, I'm writing code to test the various times the toggle switch is present or not and if it has an affect or not.

It all seems like unnecessary overkill for such a simple control.

So far I have designed the model to be used for this test suite about 90%. I've added the scenarios to the Test Grid. I coded up the helper methods I need to test with, and coded up a small test suite that verified the helper method before I realized there was more scenarios to test than I had accounted for.

The point is, that I do have more work to do on this if we leave this feature as it is. But if we intend to change it, I shouldn't continue coding as I have been doing. So for now I am putting this feature on pause and will move along to other test cases to revisit this once we have a decision.
*/

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

    it('Toggle an API Action then verify text changes', () => {
      scorerModal.ClickEndSessionEntityValueNameToggleButon('EndSessionGoodbye')
      scorerModal.VerifyContainsEndSessionAction('')
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