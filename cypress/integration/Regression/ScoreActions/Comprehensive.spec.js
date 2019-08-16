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

describe('Comprehensive - Score Actions', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)
  let generatedScoreActionsData = new scorerModal.GeneratedData('comprehensive.json')

  context('Setup', () => {
    it('Create a model to test against and navigate to Train Dialogs', () => {
      models.CreateNewModel('z-comprehensive')
      modelPage.NavigateToTrainDialogs()
    })
  })

  context('Train Dialog', () => {
    it('Create a new Train Dialog', () => {
      train.CreateNewTrainDialog()
    })

    it('1st User Turn', () => {
      train.TypeYourMessage('Hi')
    })

    it('1st Bot Response', () => {
      train.ClickScoreActionsButton()
      scorerModal.ClickAddActionButton()
      actions.ClickAddEntityButton()
      entities.CreateNewEntity({ name: 'name' })
      actions.CreateNewAction({ responseNameData: common.whatsYourName, expectedEntity: 'name' })
    })

    it('Modify Bot Response', () => {
      train.SelectLastChatTurn()
      scorerModal.ClickAddActionButton()
      actions.CreateNewAction({ responseNameData: 'Hello', uncheckWaitForResponse: true })
      train.ClickScoreActionsButton()
      train.VerifyChatTurnIsAnExactMatch(common.whatsYourName, 3, 2)
    })

    it('2nd User Turn', () => {
      train.TypeYourMessage('My name is Jeff')
      train.RemoveEntityLabel('My', 'name')
      train.LabelTextAsEntity('Jeff', 'name')
    })

    it('2nd Bot Response', () => {
      train.ClickScoreActionsButton()
      scorerModal.ClickAddActionButton()
      actions.CreateNewAction({ responseNameData: 'Hello $name{enter}', uncheckWaitForResponse: true })
    })

    it('3rd Bot Response', () => {
      scorerModal.ClickAddActionButton()
      actions.CreateNewAction({ responseNameData: 'What kind of fruit do you like?' })
    })

    it('3rd User Turn', () => {
      train.TypeYourMessage('I love oranges!')
    })

    it('Create some Enums to use as SET_ENTITY Actions', () => {
      train.ClickScoreActionsButton()
      scorerModal.ClickAddActionButton()
      actions.ClickAddEntityButton()
      entities.CreateNewEntity({ type: 'Enum', name: 'fruit', enumValues: ['APPLES', 'BANANAS', 'MANGOES', 'ORANGES', 'PEACHES'] })
      actionModal.ClickCancelButton()
    })

    // Bug 2243: Adding an ENUM entity from Score Actions +Actions +Entity after canceling the +Actions fails to reveal the new possible SET_ENTITY options
    // Once this bug is fixed remove this block of code and the test suite should work as expected.
    it('Hack around Bug 2243', () => {
      scorerModal.ClickTextAction('What kind of fruit do you like?')
      train.SelectChatTurnExactMatch('What kind of fruit do you like?', 1)
    })

    it('Select Set Entity Action fruit: ORANGES', () => {
      scorerModal.ClickSetEntityAction('fruit: ORANGES')
    })

    it('Create Bot response about the choice of fruit', () => {
      train.ClickScoreActionsButton()
      train.SelectLastChatTurn()
      scorerModal.ClickAddActionButton()
      actions.CreateNewAction({ responseNameData: 'I like $fruit{enter} too' })
    })

    it('User prompts Bot for other Actions', () => {
      train.TypeYourMessage('Try Different Action Types')
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
      
// When the Action cannot be selected because it is disqualified like this one will be, then nothing is automatically selected
// and the user must chose what to do next.
      actions.CreateNewAction({ 
        responseNameData: 'RenderTheArgs',
        type: 'API',
        logicArgs: ['$1stArg{enter}', '$2ndArg{enter}', '333', '4444', 'five', 'six', 'seven'],                                          
        renderArgs: ['$1stArg{enter}', '$2ndArg{enter}', 'three', 'four', '55555', '666666', '7777777'],
        validateApiResponse: 'RenderTheArgslogic(memoryManager, firstArg, secondArg, thirdArg, fourthArg, fifthArg, sixthArg, seventhArg)firstArg:"$1stArg"secondArg:"$2ndArg"thirdArg:"333"fourthArg:"4444"fifthArg:"five"sixthArg:"six"seventhArg:"seven"render(result, memoryManager, firstArg, secondArg, thirdArg, fourthArg, fifthArg, sixthArg, seventhArg)firstArg:"$1stArg"secondArg:"$2ndArg"thirdArg:"three"fourthArg:"four"fifthArg:"55555"sixthArg:"666666"seventhArg:"7777777"',
        disqualifyingEntities: ['disqualifier']
      })

    })

    it('', () => {
    })

    it('', () => {
    })
  })
})