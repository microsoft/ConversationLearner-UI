/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../../support/Models'
import * as modelPage from '../../../support/components/ModelPage'
import * as train from '../../../support/Train'
import * as trainDialogsGrid from '../../../support/components/TrainDialogsGrid'
import * as common from '../../../support/Common'
import * as helpers from '../../../support/Helpers'

describe('Consistent Entity Labeling', () => {
  const textEntityPairs = [{ text: 'Tag', entity: 'multi' }, { text: 'Frog', entity: 'multi' }]

  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)
  
  context('Setup', () => {
    it('Import a model, wait for training to complete and start a new Train Dialog', () => {
      models.ImportModel('z-cnstntEntLabel', 'z-entityLabeling.cl')
      modelPage.NavigateToTrainDialogs()
      cy.WaitForTrainingStatusCompleted()
      train.CreateNewTrainDialog()
    })
  })

  context('Train - Standard Input', () => {
    it('Should get an error message after removing single entity label & prevent scoring actions till fixed', () => {
      train.TypeYourMessage('This is Tag.')
      train.RemoveEntityLabel('Tag', 'multi')
      train.ClickScoreActionsButton()
      train.VerifyEntityLabelConflictPopupAndClose([textEntityPairs[0]])
      train.ClickScoreActionsButton()
      train.VerifyEntityLabelConflictPopupAndChangeToPevious([textEntityPairs[0]])
      train.SelectTextAction('Hello')
    })

    it('Should get an error message after removing a different single entity label & prevent scoring actions till fixed', () => {
      train.TypeYourMessage('This is Frog and Tag.')
      train.RemoveEntityLabel('Frog', 'multi')
      train.ClickScoreActionsButton()
      train.VerifyEntityLabelConflictPopupAndClose(textEntityPairs)
      train.ClickScoreActionsButton()
      train.VerifyEntityLabelConflictPopupAndChangeToPevious(textEntityPairs)
      train.SelectTextAction('Hi')
    })

    it('Should get an error message after removing two entity labels & prevent scoring actions till fixed', () => {
      train.TypeYourMessage('This is Tag and Frog.')
      train.RemoveEntityLabel('Tag', 'multi')
      train.RemoveEntityLabel('Frog', 'multi')
      train.ClickScoreActionsButton()
      train.VerifyEntityLabelConflictPopupAndClose(textEntityPairs)
      train.ClickScoreActionsButton()
      train.VerifyEntityLabelConflictPopupAndChangeToPevious(textEntityPairs)
      train.SelectTextAction('Hi')
    })
  })

  context('Setup for next phase', () => {
    it('Abandon Train Dialog, wait for training status to complete and start a new Train Dialog', () => {
      train.AbandonDialog()
      cy.WaitForTrainingStatusCompleted()
      train.CreateNewTrainDialog()
    })
  })

  context('Train - Alternative Input', () => {
    it('Automatically label entites in alternative input', () => {
      train.TypeYourMessage('This is Tag.')
      train.TypeAlternativeInput('This is Frog and Tag.')
      train.TypeAlternativeInput('This is Tag and Frog.')

      train.VerifyEntityLabelWithinSpecificInput([textEntityPairs[0]], 0)
      train.VerifyEntityLabelWithinSpecificInput(textEntityPairs, 1)
      train.VerifyEntityLabelWithinSpecificInput(textEntityPairs, 2)
    })

    it('Should get an error message after removing two entity labels from alternative input & prevent scoring actions till fixed', () => {
      train.RemoveEntityLabel('Tag', 'multi', 1)
      train.RemoveEntityLabel('Frog', 'multi', 2)

      train.ClickScoreActionsButton()
      train.VerifyEntityLabelConflictPopupAndClose(textEntityPairs)
      train.ClickScoreActionsButton()
      train.VerifyEntityLabelConflictPopupAndChangeToPevious(textEntityPairs)

      train.VerifyEntityLabelConflictPopupAndClose(textEntityPairs)
      train.ClickScoreActionsButton()
      train.VerifyEntityLabelConflictPopupAndChangeToPevious(textEntityPairs)
      train.SelectTextAction('Hi')

      train.SaveAsIsVerifyInGrid()
    })
  })

  context('Edit and Change to Previous Submited Labels', () => {
    it('Edit the training and verify the entities are labeled', () => {
      train.EditTraining('This is Tag.', 'This is Tag.', 'Hi')
      train.SelectChatTurnExactMatch('This is Tag.')

      train.VerifyEntityLabelWithinSpecificInput([textEntityPairs[0]], 0)
      train.VerifyEntityLabelWithinSpecificInput(textEntityPairs, 1)
      train.VerifyEntityLabelWithinSpecificInput(textEntityPairs, 2)
    })

    it('Remove two entity labels from alternative input', () => {
      train.RemoveEntityLabel('Tag', 'multi', 1)
      train.RemoveEntityLabel('Frog', 'multi', 2)
    })
    
    it('Verify user cannot submit changes without accepting auto-re-labling of the 1st alternative input that we changed', () => {
      train.ClickSubmitChangesButton()
      train.VerifyEntityLabelConflictPopupAndClose(textEntityPairs)
      train.ClickSubmitChangesButton()
      train.VerifyEntityLabelConflictPopupAndChangeToPevious(textEntityPairs)
    })

    it('Verify user cannot submit changes without accepting auto-re-labling of the 2nd alternative input that we changed', () => {
      train.VerifyEntityLabelConflictPopupAndClose(textEntityPairs)
      train.ClickSubmitChangesButton()
      train.VerifyEntityLabelConflictPopupAndChangeToPevious(textEntityPairs)
    })

    it('Abandon the changes', () => {
      train.AbandonDialog()
    })
  })

  context('Edit and Preserve Attempted Labels', () => {
    it('Edit the training', () => {
      train.EditTrainingByDescriptionAndOrTags('Both Tag & Frog')
    })

    it('Remove both Entity labels', () => {
      train.SelectChatTurnExactMatch('This is Frog and Tag.')
      train.RemoveEntityLabel('Tag', 'multi')
      train.RemoveEntityLabel('Frog', 'multi')
    })

    it('Change other instance of the phrase to attempted changes we just made', () => {
      train.ClickSubmitChangesButton()
      train.VerifyEntityLabelConflictPopupAndChangeToAttempted(textEntityPairs)
    })

    it('Save the changes', () => {
      train.SaveAsIs()
    })

    it('Error Triangle in the Train Dialog Grid should be showing for the effected Train Dialog', () => {
      trainDialogsGrid.VerifyIncidentTriangleFoundInTrainDialogsGrid('This is Tag.', 'This is Tag.', 'Hi', 3)  
    })
    
    it('Edit the Train Dialog that got changed', () => {
      train.EditTraining('This is Tag.', 'This is Tag.', 'Hi')
    })

    // Bug 2327: Typical Error indicators missing from Alternative Text error
    // Once this bug is fixed comment out this block of code and uncomment the next block
    it('Verify that Bug 2327 reproduced', () => {
      train.VerifyNoErrorMessage()
      train.VerifyChatTurnHasNoError(0)
    })

    // Bug 2327: Typical Error indicators missing from Alternative Text error
    // This code should work once this bug is fixed...
    // Uncomment this and comment out the above to detect a regression.
    // it('Verify that the general error appears', () => {
    //   train.VerifyErrorMessage(common.trainDialogHasErrorsMessage)
    //   train.VerifyChatTurnHasError(0)
    // })
    
    it('Select the user turn and verify there is an error message', () => {
      train.SelectChatTurnExactMatch('This is Tag.')
      train.VerifyMatchWarning(1)
    })

    it('Re-lable the entities to set things right in this Train Dialog', () => {
      train.XLabelTextAsEntity()
    })

    it('', () => {
    })

    it('verify that the alternative text at index 1 is not labeled.', () => {
      train.VerifyTextIsNotLabeledAsEntity('Tag', 'multi', 1)
      train.VerifyTextIsNotLabeledAsEntity('Frog', 'multi', 1)
    })

    it('Close the Train Dialog', () => {
      train.ClickSaveCloseButton()
    })

    it('', () => {
    })

    it('', () => {
    })
  })
})