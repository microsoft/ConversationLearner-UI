/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../../support/Models'
import * as modelPage from '../../../support/components/ModelPage'
import * as entityDetectionPanel from '../../../support/components/EntityDetectionPanel'
import * as chatPanel from '../../../support/components/ChatPanel'
import * as trainDialogsGrid from '../../../support/components/TrainDialogsGrid'
import * as train from '../../../support/Train'
import * as helpers from '../../../support/Helpers'

describe.skip('New Entity Label on Existing Phrase 2 - Entity Labeling', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)

  context('Setup', () => {
    it('Import a model and wait for training to complete', () => {
      models.ImportModel('z-newEntityLabel2', 'z-newEntityLabel.cl')
      modelPage.NavigateToTrainDialogs()
      cy.WaitForTrainingStatusCompleted()
    })
  })

  context('Two Instances of the Phrase', () => {
    //it('Edit the Training we created earlier', () => {
    it('Create a new Train Dialog and add a description for unique identification', () => {
      trainDialogsGrid.TdGrid.CreateNewTrainDialog()
      train.TypeDescription('Test Generated 2')
    })

    it('User utters another existing phrase and labels an entity', () => {
      train.TypeYourMessage('Two instances of this phrase there are.')
      entityDetectionPanel.LabelTextAsEntity('Two', 'anEntity')
      entityDetectionPanel.LabelTextAsEntity('phrase', 'anEntity')
    })

    it('Score Actions, verify that the Entitly Label Conflict modal pops up and that we can close it without change to our labeling', () => {
      train.ClickScoreActionsButton()
      entityDetectionPanel.VerifyEntityLabelConflictPopupAndClose(undefined, [{ text: 'Two', entity: 'anEntity' }, { text: 'phrase', entity: 'anEntity' }])
      entityDetectionPanel.VerifyTextIsLabeledAsEntity('Two', 'anEntity')
      entityDetectionPanel.VerifyTextIsLabeledAsEntity('phrase', 'anEntity')
    })

    it('Change to Previously Submitted Labels from other Train Dialogs...after we Score Actions', () => {
      train.ClickScoreActionsButton()
      entityDetectionPanel.VerifyEntityLabelConflictPopupAndChangeToPevious(undefined, [{ text: 'Two', entity: 'anEntity' }, { text: 'phrase', entity: 'anEntity' }])
    })

    it('Verify that the label was removed and then relable it', () => {
      train.SelectTextAction('The only response')
      chatPanel.SelectChatTurnExactMatch('Two instances of this phrase there are.')
      entityDetectionPanel.VerifyWordNotLabeledAsEntity('Two', 'anEntity')
      entityDetectionPanel.VerifyWordNotLabeledAsEntity('phrase', 'anEntity')
      entityDetectionPanel.LabelTextAsEntity('Two', 'anEntity')
      entityDetectionPanel.LabelTextAsEntity('phrase', 'anEntity')
    })

    it('Change to Attempted labels all matching phrases found in other Train Dialogs...after we Score Actions', () => {
      train.ClickSubmitChangesButton()
      entityDetectionPanel.VerifyEntityLabelConflictPopupAndChangeToAttempted(undefined, [{ text: 'Two', entity: 'anEntity' }, { text: 'phrase', entity: 'anEntity' }])
    })

    // Bug 2343: Test Blocker: Rendering Issue with Inconsistent Entity Label popup
    // At this point this bug blocks this test from continuing.
    it('Save the Train Dialog and verify that it is in the grid', () => {
      train.SaveAsIsVerifyInGrid()
    })

    it('Edit one of the trainings affected by conflict resolution and verify there is a warning', () => {
      modelPage.VerifyWarningTriangleForTrainDialogs()
      trainDialogsGrid.TdGrid.EditTrainingByChatInputs('Phrase used only once.', 'We use this phrase three times.', 'The only response')
      train.VerifyWarningMessage('Entity or Action changes require replay of the TrainDialog')
    })

    it('Verify that the affected turn is now Entity labeled', () => {
      chatPanel.SelectChatTurnExactMatch('Two instances of this phrase there are.')
      entityDetectionPanel.VerifyTextIsLabeledAsEntity('Two', 'anEntity')
    })

    it('Click Replay button and verify it clears the warning for this Train Dialog', () => {
      train.ClickReplayButton()
      train.VerifyNoWarningMessage()
    })

    it('Save the changes', () => {
      train.SaveAsIs()
    })

    it('Edit the other training affected by conflict resolution and verify there is a warning', () => {
      modelPage.VerifyWarningTriangleForTrainDialogs()
      trainDialogsGrid.TdGrid.EditTrainingByChatInputs('Two instances of this phrase there are.', 'We use this phrase three times.', '')
      train.VerifyWarningMessage('Entity or Action changes require replay of the TrainDialog')
    })

    it('Verify that the affected turn is now Entity labeled', () => {
      chatPanel.SelectChatTurnExactMatch('Two instances of this phrase there are.')
      entityDetectionPanel.VerifyTextIsLabeledAsEntity('Two', 'anEntity')
    })

    it('Click Replay button and verify it clears the warning for this Train Dialog', () => {
      train.ClickReplayButton()
      train.VerifyNoWarningMessage()
    })

    it('Save the changes', () => {
      train.SaveAsIs()
    })

    // TODO: Still need to verify that the TD Grid has no warnings
    //       Also need to verify the warning count, since there should be 2 of them.
   })
})