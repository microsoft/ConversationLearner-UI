/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../../support/Models'
import * as modelPage from '../../../support/components/ModelPage'
import * as entityModal from '../../../support/components/EntityModal'
import * as entityDetectionPanel from '../../../support/components/EntityDetectionPanel'
import * as entities from '../../../support/Entities'
import * as chatPanel from '../../../support/components/ChatPanel'
import * as trainDialogsGrid from '../../../support/components/TrainDialogsGrid'
import * as train from '../../../support/Train'
import * as helpers from '../../../support/Helpers'

describe('Undo Entity Labeling - Edit and Branching', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)
  
  context('Setup', () => {
    it('Should import a model to test against and navigate to Train Dialogs view', () => {
      models.ImportModel('z-undoEntityLabel', 'z-undoEntityLabel.cl')
      modelPage.NavigateToTrainDialogs()
    })
  })

  context('Undo Entity Label Change', () => {
    it('Edit user turn and verify that "Submit Changes" and "Undo" buttons are disabled', () => {
      trainDialogsGrid.TdGrid.EditTrainingByChatInputs('The user asks a silly question', 'The user asks their final question', 'The Bot responds once again')
      chatPanel.SelectChatTurnExactMatch('The user asks a silly question')
      train.VerifySubmitChangesButtonIsDisabled()
      entityDetectionPanel.VerifyEntityLabelUndoButtonIsDisabled()
    })
    
    it('Verify that after selecting an entity to label, we can select a different user turn and label text', () => {
      entityDetectionPanel.SelectEntityLabel('user', 'one')
      chatPanel.SelectChatTurnExactMatch('The user asks another question')
    })

    // Bug 2264: Selecting a labeled Entity then selecting a different user turn disables the ability to label Entities
    // When this block of code breaks, it is likely because this bug has been fixed. Comment it out and uncomment the next.
    // it('Verify that Bug 2264 reproduces', () => {
    //   entityDetectionPanel.VerifyCanNotLabelTextAsEntity('user')
    // })

    // Bug 2264: Selecting a labeled Entity then selecting a different user turn disables the ability to label Entities
    // Confirm that this bug no longer reproduces.
    it('Verify that Bug 2264 does not re-occur', () => {
      entityDetectionPanel.VerifyCanLabelTextAsEntity('user')
    })

    it('Select a Bot turn to reset the internal UI state', () => {
      // This resets the internal UI state so that either the bug no longer has an effect,
      // or the Entity selector goes away and we can continue testing other scenarios.
      chatPanel.SelectChatTurnExactMatch('Bot responds with a silly answer')
    })

    it('Remove Entity label from the 1st user turn', () => {
      chatPanel.SelectChatTurnExactMatch('The user asks a silly question')
      entityDetectionPanel.RemoveEntityLabel('user', 'one')
    })

    it('Verify the "Submit Changes" and "Undo" buttons are enabled', () => {
      train.VerifySubmitChangesButtonIsEnabled()
      entityDetectionPanel.VerifyEntityLabelUndoButtonIsEnabled()
    })

    it('Undo the change and verify that the Entity label is restored', () => {
      entityDetectionPanel.ClickEntityLabelUndoButton()
      entityDetectionPanel.VerifyTextIsLabeledAsEntity('user', 'one')
    })

    it('Select a Bot turn to cause any potential UI changes to trigger', () => {
      chatPanel.SelectChatTurnExactMatch('Bot responds with a silly answer')
    })

    it('Verify the formatted user turn', () => {
      chatPanel.VerifyChatTurnIsAnExactMatchWithMarkup('The <strong><em>user</em></strong> asks a silly question', 6, 0)
    })

    it('Relable a word of a user turn to a different Entity', () => {
      chatPanel.SelectChatTurnExactMatch('The user asks a silly question')
      entityDetectionPanel.RemoveEntityLabel('user', 'one')
      entityDetectionPanel.LabelTextAsEntity('user', 'two')
    })

    // Bug 2262: Undo Entity Label Changes not-rerendering correctly
    // When this block of code breaks, it is likely because this bug has been fixed. Comment it out and uncomment the next.
    // THERE IS ALSO ANOTHER LINE OF CODE COMMENTED OUT FURTHER BELOW THAT MUST BE RE-ENABLED ONCE FIXED!
    it('Undo the change and verify that the Entity label is restored', () => {
      entityDetectionPanel.ClickEntityLabelUndoButton()
      entityDetectionPanel.VerifyTextIsLabeledAsEntity('user', 'two')
      chatPanel.SelectChatTurnExactMatch('Bot responds with a silly answer')
      chatPanel.SelectChatTurnExactMatch('The user asks a silly question')
      entityDetectionPanel.VerifyTextIsLabeledAsEntity('user', 'one')
    })

    // Bug 2262: Undo Entity Label Changes not-rerendering correctly
    // Confirm that this bug no longer reproduces.
    // it('Undo the change and verify that the Entity label is restored', () => {
    //   entityDetectionPanel.ClickEntityLabelUndoButton()
    //   entityDetectionPanel.VerifyTextIsLabeledAsEntity('user', 'one')
    // })

    it('Verify the formatted user turn', () => {
      chatPanel.VerifyChatTurnIsAnExactMatchWithMarkup('The <strong><em>user</em></strong> asks a silly question', 6, 0)
    })

    it('Verify undo on a totally new Entity labeled word works', () => {
      chatPanel.SelectChatTurnExactMatch('The user asks another question')
      entityDetectionPanel.LabelTextAsEntity('user', 'one')
      entityDetectionPanel.ClickEntityLabelUndoButton()
      entityDetectionPanel.VerifyTextIsNotLabeledAsEntity('user', 'one')
    })

    it('Verify undo on multiple changes to a user turn', () => {
      chatPanel.SelectChatTurnExactMatch('The user asks their final question')
      entityDetectionPanel.RemoveEntityLabel('user', 'one')
      entityDetectionPanel.RemoveEntityLabel('asks', 'two')
      
      // Bug 2262: Undo Entity Label Changes not-rerendering correctly
      //entityDetectionPanel.LabelTextAsEntity('asks', 'one')

      entityDetectionPanel.LabelTextAsEntity('question', 'three')
      entityDetectionPanel.ClickEntityLabelUndoButton()
      entityDetectionPanel.VerifyTextIsLabeledAsEntity('user', 'one')
      entityDetectionPanel.VerifyTextIsLabeledAsEntity('asks', 'two')
      entityDetectionPanel.VerifyTextIsNotLabeledAsEntity('question', 'three')
    })

    it("Begin to add a new entity but cancel, verify Entity labeling changes don't happen", () => {
      chatPanel.SelectChatTurnExactMatch('The user asks another question')
      entityDetectionPanel.VerifyCanLabelTextAsEntity('user')
      entityDetectionPanel.ClickNewEntityButton()
      entityModal.ClickCancelButton()
    })

    it('Add a new entity, verify it is used automatically and that we can undo it', () => {
      entityDetectionPanel.ClickNewEntityButton()
      entities.CreateNewEntity({ name: 'four' })
      entityDetectionPanel.VerifyTextIsLabeledAsEntity('user', 'four')
      entityDetectionPanel.ClickEntityLabelUndoButton()
      entityDetectionPanel.VerifyTextIsNotLabeledAsEntity('user', 'four')
    })

    it('Manually undo a change - remove Entity label and then add the same label back again', () => {
      chatPanel.SelectChatTurnExactMatch('The user asks a silly question')
      entityDetectionPanel.RemoveEntityLabel('user', 'one')
      train.VerifySubmitChangesButtonIsEnabled()
      entityDetectionPanel.VerifyEntityLabelUndoButtonIsEnabled()
      entityDetectionPanel.LabelTextAsEntity('user', 'one')
    })

    // Bug 2263: Submit Changes button is enabled, select user turns disabled, after no net change
    // When this block of code breaks, it is likely because this bug has been fixed. Comment it out and uncomment the next.
    it('Verify that the "Submit Changes" and "Undo" buttons are enabled', () => {
      train.VerifySubmitChangesButtonIsEnabled()
      entityDetectionPanel.VerifyEntityLabelUndoButtonIsEnabled()
      entityDetectionPanel.ClickEntityLabelUndoButton()
    })
    
    // Bug 2263: Submit Changes button is enabled, select user turns disabled, after no net change
    // Confirm that this bug no longer reproduces.
    // it('Verify that the "Submit Changes" and "Undo" buttons are disabled', () => {
    //   train.VerifySubmitChangesButtonIsDisabled()
    //   entityDetectionPanel.VerifyEntityLabelUndoButtonIsDisabled()
    // })

    it('Verify that the user chat turn did not change', () => {
      chatPanel.SelectChatTurnExactMatch('Bot responds with a silly answer')
      chatPanel.VerifyChatTurnIsAnExactMatchWithMarkup('The <strong><em>user</em></strong> asks a silly question', 6, 0)
    })
  })
})