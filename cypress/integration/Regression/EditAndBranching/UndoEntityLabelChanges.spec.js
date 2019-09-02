/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../../support/Models'
import * as modelPage from '../../../support/components/ModelPage'
import * as entities from '../../../support/Entities'
import * as actions from '../../../support/Actions'
import * as train from '../../../support/Train'
import * as memoryTableComponent from '../../../support/components/MemoryTableComponent'
import * as common from '../../../support/Common'
import * as helpers from '../../../support/Helpers'

describe('Undo Entity Labeling - Edit and Branching', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)
  
  context('Setup', () => {
    it('Should import a model to test against and navigate to Train Dialogs view', () => {
      models.ImportModel('z-undoEntityLabel', 'z-undoEntityLabel.cl')
      modelPage.NavigateToTrainDialogs()
    })
  })

  context('Train', () => {
    it('Edit user turn and verify that "Submit Changes" and "Undo" buttons are disabled', () => {
      train.EditTraining('The user asks a silly question', 'The user asks another question', 'The Bot responds once again')
      train.SelectChatTurnExactMatch('The user asks a silly question')
      train.VerifySubmitChangesButtonIsDisabled()
      train.VerifyUndoButtonIsDisabled()
    })
    
    it('Bug 2264 Repro', () => {
      cy.wait(3000)
      train.SelectEntityLabel('user', 'one')
      train.SelectChatTurnExactMatch('The user asks another question')
      train.LabelTextAsEntity('user', 'one')
    })

    it('', () => {
    })

    it('', () => {
    })

    it('', () => {
    })

  })
})