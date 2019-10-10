/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../../support/Models'
import * as modelPage from '../../../support/components/ModelPage'
import * as train from '../../../support/Train'
import * as helpers from '../../../support/Helpers'

describe('Consistent Entity Labeling', () => {
  const textEntityPairs = [{ text: 'Tag', entity: 'multi' }, { text: 'Frog', entity: 'multi' }]

  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)
  
  context('Setup', () => {
    it('Should import a model, wait for training to complete and start a new Train Dialog', () => {
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
    it('Should abandon Train Dialog, wait for training status to complete and start a new Train Dialog', () => {
      train.AbandonDialog()
      cy.WaitForTrainingStatusCompleted()
      train.CreateNewTrainDialog()
    })
  })

  context('Train - Alternative Input', () => {
    it('Should automatically label entites in alternative input', () => {
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

  context('Edit Train Dialog', () => {
    it('Should edit the training and verify the entities are labeled', () => {
      train.EditTraining('This is Tag.', 'This is Tag.', 'Hi')
      train.SelectChatTurnExactMatch('This is Tag.')

      train.VerifyEntityLabelWithinSpecificInput([textEntityPairs[0]], 0)
      train.VerifyEntityLabelWithinSpecificInput(textEntityPairs, 1)
      train.VerifyEntityLabelWithinSpecificInput(textEntityPairs, 2)
    })

    it('Should remove two entity labels from alternative input', () => {
      train.RemoveEntityLabel('Tag', 'multi', 1)
      train.RemoveEntityLabel('Frog', 'multi', 2)
    })
    
    it('Should verify user cannot submit changes without accepting auto-re-labling of the 1st alternative input that we changed', () => {
      train.ClickSubmitChangesButton()
      train.VerifyEntityLabelConflictPopupAndClose(textEntityPairs)
      train.ClickSubmitChangesButton()
      train.VerifyEntityLabelConflictPopupAndChangeToPevious(textEntityPairs)
    })

    it('Should verify user cannot submit changes without accepting auto-re-labling of the 2nd alternative input that we changed', () => {
      train.VerifyEntityLabelConflictPopupAndClose(textEntityPairs)
      train.ClickSubmitChangesButton()
      train.VerifyEntityLabelConflictPopupAndChangeToPevious(textEntityPairs)
    })

    it('Should abandon the changes', () => {
      train.AbandonDialog()
    })
  })
    // Manually EXPORT this to fixtures folder and name it 'z-cnstntEntLabel.cl'
})