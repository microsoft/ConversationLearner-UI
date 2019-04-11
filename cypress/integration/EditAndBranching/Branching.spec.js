/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../support/Models'
import * as modelPage from '../../support/components/ModelPage'
import * as scorerModal from '../../support/components/ScorerModal'
import * as train from '../../support/Train'
import * as helpers from '../../support/Helpers'

describe('Basic Branching', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)
  
  context('Setup', () => {
    it('Should import a model and wait for training to complete', () => {
      models.ImportModel('z-branching', 'z-nameTrained.cl')
      modelPage.NavigateToTrainDialogs()
      cy.WaitForTrainingStatusCompleted()
    })
  })

  context('Branching', () => {
    it('Should edit a specific Train Dialog, branch and save it', () => {
      train.EditTraining('My name is David.', 'My name is Susan.', 'Hello $name')
      train.CaptureOriginalChatMessages()

      train.BranchChatTurn('My name is Susan.', 'My name is Joseph.')
      train.ClickScoreActionsButton('Hello $name')
      scorerModal.VerifyChatMessage('Hello Joseph')
      train.CaptureEditedChatMessages()
      train.Save()
    })

    it('Should edit the original Train Dialog and verify it was not changed.', () => {
      train.EditTraining('My name is David.', 'My name is Susan.', 'Hello $name')
      train.VerifyOriginalChatMessages()
      train.ClickSaveCloseButton()
    })

    it('Should edit the Train Dialog created by branching and verify it was persisted correctly.', () => {
      train.EditTraining('My name is David.', 'My name is Joseph.', 'Hello $name')
      train.VerifyEditedChatMessages()
      train.ClickSaveCloseButton()
    })
  })
})