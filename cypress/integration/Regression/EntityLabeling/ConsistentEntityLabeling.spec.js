/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../../support/Models'
import * as modelPage from '../../../support/components/ModelPage'
import * as chatPanel from '../../../support/components/ChatPanel'
import * as trainDialogsGrid from '../../../support/components/TrainDialogsGrid'
import * as train from '../../../support/Train'
import * as entityDetectionPanel from '../../../support/components/EntityDetectionPanel'
import * as helpers from '../../../support/Helpers'

describe.skip('Consistent Entity Labeling', () => {
  const textEntityPairs = [{ text: 'Tag', entity: 'multi' }, { text: 'Frog', entity: 'multi' }]

  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)
  
  context('Setup', () => {
    it('Import a model, wait for training to complete and start a new Train Dialog', () => {
      models.ImportModel('z-cnstntEntLabel', 'z-entityLabeling.cl')
      modelPage.NavigateToTrainDialogs()
      cy.WaitForTrainingStatusCompleted()
      trainDialogsGrid.TdGrid.CreateNewTrainDialog()
    })
  })

  context('Train - Standard Input', () => {
    it('Should get an error message after removing single entity label & prevent scoring actions till fixed', () => {
      train.TypeYourMessage('This is Tag.')
      entityDetectionPanel.RemoveEntityLabel('Tag', 'multi')
      train.ClickScoreActionsButton()
      entityDetectionPanel.VerifyEntityLabelConflictPopupAndClose([textEntityPairs[0]])
      train.ClickScoreActionsButton()
      entityDetectionPanel.VerifyEntityLabelConflictPopupAndChangeToPevious([textEntityPairs[0]])
      train.SelectTextAction('Hello')
    })

    it('Should get an error message after removing a different single entity label & prevent scoring actions till fixed', () => {
      train.TypeYourMessage('This is Frog and Tag.')
      entityDetectionPanel.RemoveEntityLabel('Frog', 'multi')
      train.ClickScoreActionsButton()
      entityDetectionPanel.VerifyEntityLabelConflictPopupAndClose(textEntityPairs)
      train.ClickScoreActionsButton()
      entityDetectionPanel.VerifyEntityLabelConflictPopupAndChangeToPevious(textEntityPairs)
      train.SelectTextAction('Hi')
    })

    it('Should get an error message after removing two entity labels & prevent scoring actions till fixed', () => {
      train.TypeYourMessage('This is Tag and Frog.')
      entityDetectionPanel.RemoveEntityLabel('Tag', 'multi')
      entityDetectionPanel.RemoveEntityLabel('Frog', 'multi')
      train.ClickScoreActionsButton()
      entityDetectionPanel.VerifyEntityLabelConflictPopupAndClose(textEntityPairs)
      train.ClickScoreActionsButton()
      entityDetectionPanel.VerifyEntityLabelConflictPopupAndChangeToPevious(textEntityPairs)
      train.SelectTextAction('Hi')
    })
  })

  context('Setup for next phase', () => {
    it('Abandon Train Dialog, wait for training status to complete and start a new Train Dialog', () => {
      train.AbandonDialog()
      cy.WaitForTrainingStatusCompleted()
      trainDialogsGrid.TdGrid.CreateNewTrainDialog()
    })
  })

  context('Train - Alternative Input', () => {
    it('Automatically label entites in alternative input', () => {
      train.TypeYourMessage('This is Tag.')
      entityDetectionPanel.TypeAlternativeInput('This is Frog and Tag.')
      entityDetectionPanel.TypeAlternativeInput('This is Tag and Frog.')

      entityDetectionPanel.VerifyMultipleEntityLabels([textEntityPairs[0]], 0)
      entityDetectionPanel.VerifyMultipleEntityLabels(textEntityPairs, 1)
      entityDetectionPanel.VerifyMultipleEntityLabels(textEntityPairs, 2)
    })

    it('Should get an error message after removing two entity labels from alternative input & prevent scoring actions till fixed', () => {
      entityDetectionPanel.RemoveEntityLabel('Tag', 'multi', 1)
      entityDetectionPanel.RemoveEntityLabel('Frog', 'multi', 2)

      train.ClickScoreActionsButton()
      entityDetectionPanel.VerifyEntityLabelConflictPopupAndClose(textEntityPairs)
      train.ClickScoreActionsButton()
      entityDetectionPanel.VerifyEntityLabelConflictPopupAndChangeToPevious(textEntityPairs)

      entityDetectionPanel.VerifyEntityLabelConflictPopupAndClose(textEntityPairs)
      train.ClickScoreActionsButton()
      entityDetectionPanel.VerifyEntityLabelConflictPopupAndChangeToPevious(textEntityPairs)
      train.SelectTextAction('Hi')

      train.SaveAsIsVerifyInGrid()
    })
  })

  context('Edit and Change to Previous Submited Labels', () => {
    it('Edit the training and verify the entities are labeled', () => {
      trainDialogsGrid.TdGrid.EditTrainingByChatInputs('This is Tag.', 'This is Tag.', 'Hi')
      chatPanel.SelectChatTurnExactMatch('This is Tag.')

      entityDetectionPanel.VerifyMultipleEntityLabels([textEntityPairs[0]], 0)
      entityDetectionPanel.VerifyMultipleEntityLabels(textEntityPairs, 1)
      entityDetectionPanel.VerifyMultipleEntityLabels(textEntityPairs, 2)
    })

    it('Remove two entity labels from alternative input', () => {
      entityDetectionPanel.RemoveEntityLabel('Tag', 'multi', 1)
      entityDetectionPanel.RemoveEntityLabel('Frog', 'multi', 2)
    })
    
    it('Verify user cannot submit changes without accepting auto-re-labling of the 1st alternative input that we changed', () => {
      train.ClickSubmitChangesButton()
      entityDetectionPanel.VerifyEntityLabelConflictPopupAndClose(textEntityPairs)
      train.ClickSubmitChangesButton()
      entityDetectionPanel.VerifyEntityLabelConflictPopupAndChangeToPevious(textEntityPairs)
    })

    it('Verify user cannot submit changes without accepting auto-re-labling of the 2nd alternative input that we changed', () => {
      entityDetectionPanel.VerifyEntityLabelConflictPopupAndClose(textEntityPairs)
      train.ClickSubmitChangesButton()
      entityDetectionPanel.VerifyEntityLabelConflictPopupAndChangeToPevious(textEntityPairs)
    })

    it('Abandon the changes', () => {
      train.AbandonDialog()
    })
  })

  context('Edit and Preserve Attempted Labels', () => {
    it('Edit the training', () => {
      trainDialogsGrid.TdGrid.EditTrainingByDescriptionAndOrTags('Both Tag & Frog')
    })

    it('Remove both Entity labels', () => {
      chatPanel.SelectChatTurnExactMatch('This is Frog and Tag.')
      entityDetectionPanel.RemoveEntityLabel('Tag', 'multi')
      entityDetectionPanel.RemoveEntityLabel('Frog', 'multi')
    })

    it('Submit changes, verify conflict popup, and use "Attempted Labels" option to alter other instances of this phrase in other TDs', () => {
      train.ClickSubmitChangesButton()
      entityDetectionPanel.VerifyEntityLabelConflictPopupAndChangeToAttempted(textEntityPairs)
    })

    // Bug 2343: Test Blocker: Rendering Issue with Inconsistent Entity Label popup
    // At this point this bug blocks this test from continuing.
    it('Save the changes', () => {
      train.SaveAsIs()
    })

    it('Error Triangle in the Train Dialog Grid should be showing for the effected Train Dialog', () => {
      trainDialogsGrid.VerifyIncidentTriangleFoundInTrainDialogsGrid('This is Tag.', 'This is Tag.', 'Hi', '', '', 3)  
    })
    
    it('Edit the Train Dialog that got changed', () => {
      trainDialogsGrid.TdGrid.EditTrainingByChatInputs('This is Tag.', 'This is Tag.', 'Hi')
    })

    // Bug 2327: Typical Error indicators missing from Alternative Text error
    // Once this bug is fixed comment out this block of code and uncomment the next block
    it('Verify that Bug 2327 reproduced', () => {
      train.VerifyNoErrorMessage()
      chatPanel.VerifyChatTurnHasNoError(0)
    })

    // Bug 2327: Typical Error indicators missing from Alternative Text error
    // This code should work once this bug is fixed...
    // Uncomment this and comment out the above to detect a regression.
    // it('Verify that the general error appears', () => {
    //   train.VerifyErrorMessage(common.trainDialogHasErrorsMessage)
    //   chatPanel.VerifyChatTurnHasError(0)
    // })
    
    it('Select the user turn and verify there is an error message', () => {
      chatPanel.SelectChatTurnExactMatch('This is Tag.')
      entityDetectionPanel.VerifyMatchWarning(1)
    })

    it('verify that the alternative text at index 1 is not labeled.', () => {
      entityDetectionPanel.VerifyTextIsNotLabeledAsEntity('Tag', 'multi', 1)
      entityDetectionPanel.VerifyTextIsNotLabeledAsEntity('Frog', 'multi', 1)
    })

    it('Re-label the entities to set things right in this Train Dialog', () => {
      entityDetectionPanel.LabelTextAsEntity('Tag', 'multi', 1, true)
      entityDetectionPanel.LabelTextAsEntity('Frog', 'multi', 1, true)
    })

    it('Submit changes, verify conflict popup, and use "Attempted Labels" option to set things right again in other instances of this phrase in other TDs', () => {
      train.ClickSubmitChangesButton()
      entityDetectionPanel.VerifyEntityLabelConflictPopupAndChangeToAttempted(undefined, textEntityPairs)
    })

    it('Save the Train Dialog', () => {
      train.SaveAsIs()
    })

    it('Verify there is a yellow warning triangle on the TD that was affected by the last change', () => {
      trainDialogsGrid.VerifyIncidentTriangleFoundInTrainDialogsGrid('This is Tag.', 'This is Tag and Frog.', 'Hi', 'Both Tag & Frog', 'TagFrog', 3)
    })

    it('Select the row with the warning and replay the TD intending to have the warning go away', () => {
      trainDialogsGrid.ToggleRowSelection('This is Tag.', 'This is Tag and Frog.', 'Hi', 'Both Tag & Frog', 'TagFrog', 3)
      trainDialogsGrid.ClickReplaySelectedButton()
    })

    // Bug 2326: Replay Selected Train Dialogs fails to resolve Error Incident Triangle
    // This verifies that the bug does NOT reproduce.
    it('Verify the yellow warning triangle is now gone', () => {
      trainDialogsGrid.VerifyNoIncidentTriangleFoundInTrainDialogsGrid('This is Tag.', 'This is Tag and Frog.', 'Hi', 'Both Tag & Frog', 'TagFrog', 3)
    })
  })
})