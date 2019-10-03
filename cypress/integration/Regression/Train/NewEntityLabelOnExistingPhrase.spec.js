/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../../support/Models'
import * as modelPage from '../../../support/components/ModelPage'
import * as memoryTableComponent from '../../../support/components/MemoryTableComponent'
import * as scorerModal from '../../../support/components/ScorerModal'
import * as train from '../../../support/Train'
import * as common from '../../../support/Common'
import * as helpers from '../../../support/Helpers'

describe('New Entity Label on Existing Phrase - Train Dialog', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)

  context('Setup', () => {
    it('Should import a model and wait for training to complete', () => {
      models.ImportModel('z-newEntityLabel', 'z-newEntityLabel.cl')
      modelPage.NavigateToTrainDialogs()
      cy.WaitForTrainingStatusCompleted()
    })
  })

  context('Train Dialog', () => {
    it('Should create a new Train Dialog', () => {
      train.CreateNewTrainDialog()
    })

    it('User utters an existing phrase, labels an entity and clicks Score Actions Button', () => {
      train.TypeYourMessage('Phrase used only once.')
      train.LabelTextAsEntity('once', 'anEntity')
      train.ClickScoreActionsButton()
    })

    it('', () => {
      train.VerifyEntityLabelConflictPopupAndClose([{ text: 'once', entity: 'anEntity' }])
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
})