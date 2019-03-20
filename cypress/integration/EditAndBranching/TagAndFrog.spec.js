/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../support/Models'
import * as modelPage from '../../support/components/ModelPage'
import * as scorerModal from '../../support/components/ScorerModal'
import * as train from '../../support/Train'
import * as editDialogModal from '../../support/components/EditDialogModal'
import * as helpers from '../../support/Helpers'

describe('Tag and Frog - Edit And Branching', () => {
  const textEntityPairs = [{text: 'Tag', entity: 'multi'}, {text: 'Frog', entity: 'multi'}]

  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)
  
  context('Setup', () => {
    it('Should import a model and wait for training to complete', () => {
    models.ImportModel('z-tagAndFrog2', 'z-tagAndFrog2.cl')
    modelPage.NavigateToTrainDialogs()
    cy.WaitForTrainingStatusCompleted()
    })
  })

  context('Edit Train Dialog', () => {
    it('Should remove two entity labels from alternative input', () => {
      train.EditTraining('This is Tag.', 'This is Tag.', 'Hi')
      editDialogModal.SelectChatTurnExactMatch('This is Tag.')

      editDialogModal.VerifyEntityLabelWithinSpecificInput([textEntityPairs[0]], 0)
      editDialogModal.VerifyEntityLabelWithinSpecificInput(textEntityPairs, 1)
      editDialogModal.VerifyEntityLabelWithinSpecificInput(textEntityPairs, 2)

      editDialogModal.RemoveEntityLabel('Tag', 'multi', 1)
      editDialogModal.RemoveEntityLabel('Frog', 'multi', 2)
    })

    
    it('Should verify user cannot submit changes without accepting auto-re-labling of those two entity labels in the alternative input', () => {
      editDialogModal.ClickSubmitChangesButton()
      editDialogModal.VerifyEntityLabeledDifferentPopupAndClose(textEntityPairs)
      editDialogModal.ClickSubmitChangesButton()
      editDialogModal.VerifyEntityLabeledDifferentPopupAndAccept(textEntityPairs)

      editDialogModal.VerifyEntityLabeledDifferentPopupAndClose(textEntityPairs)
      editDialogModal.ClickSubmitChangesButton()
      editDialogModal.VerifyEntityLabeledDifferentPopupAndAccept(textEntityPairs)

      train.AbandonDialog()
    })
  })
})