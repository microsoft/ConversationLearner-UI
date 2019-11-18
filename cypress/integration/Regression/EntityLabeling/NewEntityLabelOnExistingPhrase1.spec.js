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

describe.skip('New Entity Label on Existing Phrase 1 - Entity Labeling', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)

  context('Setup', () => {
    it('Import a model and wait for training to complete', () => {
      models.ImportModel('z-newEntityLabel1', 'z-newEntityLabel.cl')
      modelPage.NavigateToTrainDialogs()
      cy.WaitForTrainingStatusCompleted()
    })
  })

  context('One Instance of the Phrase', () => {
    it('Create a new Train Dialog and add a description for unique identification', () => {
      trainDialogsGrid.TdGrid.CreateNewTrainDialog()
      train.TypeDescription('Test Generated')
    })

    it('User utters an existing phrase and labels an entity', () => {
      train.TypeYourMessage('Phrase used only once.')
      entityDetectionPanel.LabelTextAsEntity('once', 'anEntity') // always an entity...LOL
    })

    it('Score Actions, verify that the Entitly Label Conflict modal pops up and that we can close it without change to our labeling', () => {
      train.ClickScoreActionsButton()
      entityDetectionPanel.VerifyEntityLabelConflictPopupAndClose(undefined, [{ text: 'once', entity: 'anEntity' }])
      entityDetectionPanel.VerifyTextIsLabeledAsEntity('once', 'anEntity')
    })

    it('Change to Previously Submitted Labels from other Train Dialogs...after we Score Actions', () => {
      train.ClickScoreActionsButton()
      entityDetectionPanel.VerifyEntityLabelConflictPopupAndChangeToPevious(undefined, [{ text: 'once', entity: 'anEntity' }])
    })

    it('Verify that the label was removed and then relable it', () => {
      train.SelectTextAction('The only response')
      chatPanel.SelectChatTurnExactMatch('Phrase used only once.')
      entityDetectionPanel.VerifyWordNotLabeledAsEntity('once', 'anEntity')
      entityDetectionPanel.LabelTextAsEntity('once', 'anEntity')
    })

    it('Change to Attempted labels all matching phrases found in other Train Dialogs...after we Score Actions', () => {
      train.ClickSubmitChangesButton()
      entityDetectionPanel.VerifyEntityLabelConflictPopupAndChangeToAttempted(undefined, [{ text: 'once', entity: 'anEntity' }])
    })

    // Bug 2343: Test Blocker: Rendering Issue with Inconsistent Entity Label popup
    // At this point this bug blocks this test from continuing.
    it('Save the Train Dialog and verify that it is in the grid', () => {
      train.SaveAsIsVerifyInGrid()
    })

    it('Edit the training affected by conflict resolution and verify there is a warning', () => {
      modelPage.VerifyWarningTriangleForTrainDialogs()
      trainDialogsGrid.TdGrid.EditTrainingByChatInputs('Phrase used only once.', 'We use this phrase three times.', 'The only response')
      train.VerifyWarningMessage('Entity or Action changes require replay of the TrainDialog')
    })

    it('Verify that the affected turn is now Entity labeled', () => {
      chatPanel.SelectChatTurnExactMatch('Phrase used only once.')
      entityDetectionPanel.VerifyTextIsLabeledAsEntity('once', 'anEntity')
    })

    it('Click Replay button and verify it clears the warning for this Train Dialog', () => {
      train.ClickReplayButton()
      train.VerifyNoWarningMessage()
    })

    it('Save the changes', () => {
      train.SaveAsIs()
    })

    // TODO: Still need to verify that the TD Grid has no warnings
  })
  // Manually EXPORT this to fixtures folder and name it 'z-newEntityLabel.cl'
})