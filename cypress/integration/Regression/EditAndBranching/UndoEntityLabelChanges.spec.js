/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../../support/Models'
import * as modelPage from '../../../support/components/ModelPage'
import * as entityModal from '../../../support/components/EntityModal'
import * as entities from '../../../support/Entities'
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
      train.EditTraining('The user asks a silly question', 'The user asks their final question', 'The Bot responds once again')
      train.SelectChatTurnExactMatch('The user asks a silly question')
      train.VerifySubmitChangesButtonIsDisabled()
      train.VerifyEntityLabelUndoButtonIsDisabled()
    })
    
    it('Verify that after selecting an entity to label, we can select a different user turn and label text', () => {
      train.SelectEntityLabel('user', 'one')
      train.SelectChatTurnExactMatch('The user asks another question')
    })

    // Bug 2264: Selecting a labeled Entity then selecting a different user turn disables the ability to label Entities
    // When this block of code breaks, it is likely because this bug has been fixed. Comment it out and uncomment the next.
    it('Verify that Bug 2264 reproduces', () => {
      train.VerifyCanNotLabelTextAsEntity('user')
    })

    // Bug 2264: Selecting a labeled Entity then selecting a different user turn disables the ability to label Entities
    // Confirm that this bug no longer reproduces.
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
      train.VerifyEntityLabelUndoButtonIsEnabled()
    })

    it('Undo the change and verify that the Entity label is restored', () => {
      train.ClickEntityLabelUndoButton()
      train.VerifyTextIsLabeledAsEntity('user', 'one')
    })

    it('Select a Bot turn to cause any potential UI changes to trigger', () => {
      train.SelectChatTurnExactMatch('Bot responds with a silly answer')
    })

    it('Verify the formatted user turn', () => {
      train.VerifyChatTurnIsAnExactMatchWithMarkup('The <strong><em>user</em></strong> asks a silly question', 6, 0)
    })

    it('Relable a word of a user turn to a different Entity', () => {
      train.SelectChatTurnExactMatch('The user asks a silly question')
      train.RemoveEntityLabel('user', 'one')
      train.LabelTextAsEntity('user', 'two')
    })

    // Bug 2262: Undo Entity Label Changes not-rerendering correctly
    // When this block of code breaks, it is likely because this bug has been fixed. Comment it out and uncomment the next.
    // THERE IS ALSO ANOTHER LINE OF CODE COMMENTED OUT FURTHER BELOW THAT MUST BE RE-ENABLED ONCE FIXED!
    it('Undo the change and verify that the Entity label is restored', () => {
      train.ClickEntityLabelUndoButton()
      train.VerifyTextIsLabeledAsEntity('user', 'two')
      train.SelectChatTurnExactMatch('Bot responds with a silly answer')
      train.SelectChatTurnExactMatch('The user asks a silly question')
      train.VerifyTextIsLabeledAsEntity('user', 'one')
    })

    // Bug 2262: Undo Entity Label Changes not-rerendering correctly
    // Confirm that this bug no longer reproduces.
    // it('Undo the change and verify that the Entity label is restored', () => {
    //   train.ClickEntityLabelUndoButton()
    //   train.VerifyTextIsLabeledAsEntity('user', 'one')
    // })

    it('Verify the formatted user turn', () => {
      train.VerifyChatTurnIsAnExactMatchWithMarkup('The <strong><em>user</em></strong> asks a silly question', 6, 0)
    })

    it('Verify undo on a totally new Entity labeled word works', () => {
      train.SelectChatTurnExactMatch('The user asks another question')
      train.LabelTextAsEntity('user', 'one')
      train.ClickEntityLabelUndoButton()
      train.VerifyTextIsNotLabeledAsEntity('user', 'one')
    })

    it('Verify undo on multiple changes to a user turn', () => {
      train.SelectChatTurnExactMatch('The user asks their final question')
      train.RemoveEntityLabel('user', 'one')
      train.RemoveEntityLabel('asks', 'two')
      
      // Bug 2262: Undo Entity Label Changes not-rerendering correctly
      //train.LabelTextAsEntity('asks', 'one')

      train.LabelTextAsEntity('question', 'three')
      train.ClickEntityLabelUndoButton()
      train.VerifyTextIsLabeledAsEntity('user', 'one')
      train.VerifyTextIsLabeledAsEntity('asks', 'two')
      train.VerifyTextIsNotLabeledAsEntity('question', 'three')
    })

    it("Begin to add a new entity but cancel, verify Entity labeling changes don't happen", () => {
      train.SelectChatTurnExactMatch('The user asks another question')
      train.VerifyCanLabelTextAsEntity('user')
      train.ClickNewEntityButton()
      entityModal.ClickCancelButton()
    })

    it('Add a new entity, verify it is used automatically and that we can undo it', () => {
      train.ClickNewEntityButton()
      entities.CreateNewEntity({ name: 'four' })
      train.VerifyTextIsLabeledAsEntity('user', 'four')
      train.ClickEntityLabelUndoButton()
      train.VerifyTextIsNotLabeledAsEntity('user', 'four')
    })

    it('Manually undo a change - remove Entity label and then add the same label back again', () => {
      train.SelectChatTurnExactMatch('The user asks a silly question')
      train.RemoveEntityLabel('user', 'one')
      train.VerifySubmitChangesButtonIsEnabled()
      train.VerifyEntityLabelUndoButtonIsEnabled()
      train.LabelTextAsEntity('user', 'one')
    })

    // Bug 2263: Submit Changes button is enabled, select user turns disabled, after no net change
    // When this block of code breaks, it is likely because this bug has been fixed. Comment it out and uncomment the next.
    it('Verify that the "Submit Changes" and "Undo" buttons are enabled', () => {
      train.VerifySubmitChangesButtonIsEnabled()
      train.VerifyEntityLabelUndoButtonIsEnabled()
      train.ClickEntityLabelUndoButton()
    })
    
    // Bug 2263: Submit Changes button is enabled, select user turns disabled, after no net change
    // Confirm that this bug no longer reproduces.
    // it('Verify that the "Submit Changes" and "Undo" buttons are disabled', () => {
    //   train.VerifySubmitChangesButtonIsDisabled()
    //   train.VerifyEntityLabelUndoButtonIsDisabled()
    // })

    it('Verify that the user chat turn did not change', () => {
      train.SelectChatTurnExactMatch('Bot responds with a silly answer')
      train.VerifyChatTurnIsAnExactMatchWithMarkup('The <strong><em>user</em></strong> asks a silly question', 6, 0)
    })
  })
})