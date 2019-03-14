/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../support/Models'
import * as modelPage from '../../support/components/ModelPage'
import * as train from '../../support/Train'
import * as editDialogModal from '../../support/components/EditDialogModal'
import * as common from '../../support/Common'
import * as helpers from '../../support/Helpers'

describe('Tag And Frog - Train', () => {
  // TODO: Need to add another test case or expand this one so that tagging something
  //       that was NOT tagged in another instance causes the UI to complain.
  const textEntityPairs = [{ text: 'Tag', entity: 'multi' }, { text: 'Frog', entity: 'multi' }]

  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)
  
  context('Setup', () => {
    it('Should import a model and wait for training to complete', () => {
      models.ImportModel('z-tagAndFrog', 'z-tagAndFrog.cl')
      modelPage.NavigateToTrainDialogs()

      cy.WaitForTrainingStatusCompleted()
    })
  })

  context('Train - Standard Input', () => {
    it('Should get an error message after removing single entity label & prevent scoring actions till fixed', () => {
      train.CreateNewTrainDialog()

      train.TypeYourMessage('This is Tag.')
      editDialogModal.RemoveEntityLabel('Tag', 'multi')
      editDialogModal.ClickScoreActionsButton()
      editDialogModal.VerifyEntityLabeledDifferentPopupAndClose([textEntityPairs[0]])
      editDialogModal.ClickScoreActionsButton()
      editDialogModal.VerifyEntityLabeledDifferentPopupAndAccept([textEntityPairs[0]])
      train.SelectAction('Hello')
    })

    it('Should get an error message after removing a different single entity label & prevent scoring actions till fixed', () => {
      train.TypeYourMessage('This is Frog and Tag.')
      editDialogModal.RemoveEntityLabel('Frog', 'multi')
      editDialogModal.ClickScoreActionsButton()
      editDialogModal.VerifyEntityLabeledDifferentPopupAndClose(textEntityPairs)
      editDialogModal.ClickScoreActionsButton()
      editDialogModal.VerifyEntityLabeledDifferentPopupAndAccept(textEntityPairs)
      train.SelectAction('Hi')
    })

    it('Should get an error message after removing two entity labels & prevent scoring actions till fixed', () => {
      train.TypeYourMessage('This is Tag and Frog.')
      editDialogModal.RemoveEntityLabel('Tag', 'multi')
      editDialogModal.RemoveEntityLabel('Frog', 'multi')
      editDialogModal.ClickScoreActionsButton()
      editDialogModal.VerifyEntityLabeledDifferentPopupAndClose(textEntityPairs)
      editDialogModal.ClickScoreActionsButton()
      editDialogModal.VerifyEntityLabeledDifferentPopupAndAccept(textEntityPairs)
      train.SelectAction('Hi')
    })
  })

  context('Setup for next phase', () => {
    it('Should abandon Train Dialog and start a new Train Dialog', () => {
      train.AbandonDialog()

      cy.WaitForTrainingStatusCompleted()
      train.CreateNewTrainDialog()
    })
  })

  context('Train - Alternative Input', () => {
    it('Should automatically label entites in alternative input', () => {
      train.TypeYourMessage('This is Tag.')
      editDialogModal.TypeAlternativeInput('This is Frog and Tag.')
      editDialogModal.TypeAlternativeInput('This is Tag and Frog.')

      editDialogModal.VerifyEntityLabelWithinSpecificInput([textEntityPairs[0]], 0)
      editDialogModal.VerifyEntityLabelWithinSpecificInput(textEntityPairs, 1)
      editDialogModal.VerifyEntityLabelWithinSpecificInput(textEntityPairs, 2)
    })

    it('Should get an error message after removing two entity labels from alternative input & prevent scoring actions till fixed', () => {
      editDialogModal.RemoveEntityLabel('Tag', 'multi', 1)
      editDialogModal.RemoveEntityLabel('Frog', 'multi', 2)

      editDialogModal.ClickScoreActionsButton()
      editDialogModal.VerifyEntityLabeledDifferentPopupAndClose(textEntityPairs)
      editDialogModal.ClickScoreActionsButton()
      editDialogModal.VerifyEntityLabeledDifferentPopupAndAccept(textEntityPairs)

      editDialogModal.VerifyEntityLabeledDifferentPopupAndClose(textEntityPairs)
      editDialogModal.ClickScoreActionsButton()
      editDialogModal.VerifyEntityLabeledDifferentPopupAndAccept(textEntityPairs)
      train.SelectAction('Hi')

      train.Save()
    })
  })
    // Manually EXPORT this to fixtures folder and name it 'z-tagAndFrog2.cl'
})