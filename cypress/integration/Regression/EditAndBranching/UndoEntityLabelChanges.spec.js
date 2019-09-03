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
    
    it('Verify that after selecting an entity to label, we can select a different user turn and label text', () => {
      train.SelectEntityLabel('user', 'one')
      train.SelectChatTurnExactMatch('The user asks another question')
    })

    // Bug 2264: Selecting a labeled Entity then selecting a different user turn disables the ability to label Entities
    // When block of code breaks, it is likely because this bug has been fixed. Comment it out and uncomment the next.
    it('Verify that Bug 2264 reproduces', () => {
      train.VerifyCanNotLabelTextAsEntity('user')
    })

    // it('Verify that Bug 2264 does not re-occur', () => {
    //   train.VerifyCanLabelTextAsEntity('user')
    // })

    it('Select a Bot turn to reset the internal UI state', () => {
      // This resets the internal UI state so that either the bug no longer has an effect,
      // or the Entity selector goes away and we can continue testing other scenarios.
      train.SelectChatTurnExactMatch('Bot responds with a silly answer')
    })

    it('Remove Entity label from the 1st user turn', () => {
      train.SelectChatTurnExactMatch('The user asks a silly question')
      train.RemoveEntityLabel('user', 'one')
    })

    it('Verify the "Submit Changes" and "Undo" buttons are enabled', () => {
      train.VerifySubmitChangesButtonIsEnabled()
      train.VerifyUndoButtonIsEnabled()
    })

    it('Undo the change and verify that the Entity label returns', () => {
      train.ClickUndoButton()
      train.VerifyTextIsLabeledAsEntity('user', 'one')
    })

    it('', () => {
    })

    it('', () => {
    })

  })
})