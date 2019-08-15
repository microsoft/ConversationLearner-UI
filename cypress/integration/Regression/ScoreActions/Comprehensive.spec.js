/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../../support/Models'
import * as modelPage from '../../../support/components/ModelPage'
import * as entities from '../../../support/Entities'
import * as actions from '../../../support/Actions'
import * as scorerModal from '../../../support/components/ScorerModal'
import * as common from '../../../support/Common'
import * as train from '../../../support/Train'
import * as common from '../../../support/Common'
import * as helpers from '../../../support/Helpers'

describe('Disqualifying Entities - Train', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)
  //let generatedScoreActionsData = new scorerModal.GeneratedData('comprehensive.json')

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
      train.VerifyChatTurnIsAnExactMatch(common.whatsYourName, 3, 2)
    })

    it('Modify Bot Response', () => {
      train.SelectChatTurnExactMatch(common.whatsYourName)
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

    it('', () => {
    })

    it('', () => {
    })
  })
})