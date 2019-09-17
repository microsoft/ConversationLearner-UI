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

describe('Comprehensive 1 - Score Actions', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)
  let generatedScoreActionsData = new scorerModal.GeneratedData('comprehensive1.json')

  context('Setup', () => {
    it('Create a model to test against and navigate to Train Dialogs', () => {
      models.CreateNewModel('z-comprehensive1')
      modelPage.NavigateToTrainDialogs()
    })
  })

  context('Train Dialog', () => {
    it('Create a new Train Dialog', () => {
      train.CreateNewTrainDialog()
    })

    it('Simple User Turn', () => {
      train.TypeYourMessage('Hi')
    })

    // Bug 2239: Bot response does not post to Chat Pane after adding 1st Action to Model from Train Dialog Modal
    // This group of steps are the ones that produced bug 2239, however it has not yet reproduced.
    it('Create Bot Response', () => {
      train.ClickScoreActionsButton()
      scorerModal.ClickAddActionButton()
      actionModal.ClickAddEntityButton()
      entities.CreateNewEntity({ name: 'name' })
      actions.CreateNewAction({ responseNameData: common.whatsYourName, expectedEntity: 'name' })
    })

    it('Select the action that was just used as a Bot Response', () => {
      train.SelectLastChatTurn()
    })

    generatedScoreActionsData.VerifyScoreActionsList()

    // I would have added the simple "Hello" Bot response first, but I wanted to try to reproduce bug 2239,
    // so this is how to make the conversation flow correctly and still attempt to repro that bug.
    it('Add new Bot Response to replace/insert before prior response', () => {
      scorerModal.ClickAddActionButton()
      actions.CreateNewAction({ responseNameData: 'Hello', uncheckWaitForResponse: true })
      train.ClickScoreActionsButton()
      train.VerifyChatTurnIsAnExactMatch(common.whatsYourName, 3, 2)
      train.SelectLastChatTurn()
    })

    generatedScoreActionsData.VerifyScoreActionsList()

    it('Name Entity in User Turn', () => {
      train.TypeYourMessage('My name is Jeff')
      train.RemoveEntityLabel('My', 'name')
      train.LabelTextAsEntity('Jeff', 'name')
    })
//>>>>>>>>>>
    it('Uses the "name" Entity in a new Bot Response', () => {
      train.ClickScoreActionsButton()
      scorerModal.ClickAddActionButton()
      actions.CreateNewAction({ responseNameData: 'Hello $name{enter}', uncheckWaitForResponse: true })
    })

    generatedScoreActionsData.VerifyScoreActionsList()

    it('Create another Bot Response', () => {
      scorerModal.ClickAddActionButton()
      actions.CreateNewAction({ responseNameData: 'What kind of fruit do you like?' })
    })

    it('User Turn to give the Bot oranges to trigger a SET_ENTITY action', () => {
      train.TypeYourMessage('I love oranges!')
      train.ClickScoreActionsButton()
    })

    generatedScoreActionsData.VerifyScoreActionsList()

    it('Create some Enums to use as SET_ENTITY Actions', () => {
      scorerModal.ClickAddActionButton()
      actionModal.ClickAddEntityButton()
      entities.CreateNewEntity({ type: 'Enum', name: 'fruit', enumValues: ['APPLES', 'BANANAS', 'MANGOES', 'ORANGES', 'PEACHES'] })
      actionModal.ClickCancelButton()
    })

    // Bug 2243: Adding an ENUM entity from Score Actions +Actions +Entity after canceling the +Actions fails to reveal the new possible SET_ENTITY options
    // Once this bug is fixed remove this block of code and the test suite should work as expected.
    it('Hack around Bug 2243', () => {
      scorerModal.ClickTextAction('What kind of fruit do you like?')
      train.SelectChatTurnExactMatch('What kind of fruit do you like?', 1)
    })

    generatedScoreActionsData.VerifyScoreActionsList()

    it('Select Set Entity Action fruit: ORANGES', () => {
      scorerModal.ClickSetEntityAction('fruit: ORANGES')
      train.ClickScoreActionsButton()
      train.SelectLastChatTurn()
    })

    generatedScoreActionsData.VerifyScoreActionsList()

    it('Create Bot response about the choice of fruit', () => {
      scorerModal.ClickAddActionButton()
      actions.CreateNewAction({ responseNameData: 'I like $fruit{enter} too' })
    })

    it('Save Training', () => {
      train.SaveAsIs()
    })
  })

  generatedScoreActionsData.SaveGeneratedData()
  // Manually EXPORT this to fixtures folder and name it 'z-comprehensive1.cl'
})