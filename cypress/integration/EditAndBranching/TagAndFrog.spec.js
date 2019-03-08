/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../support/Models'
import * as modelPage from '../../support/components/ModelPage'
import * as scorerModal from '../../support/components/ScorerModal'
import * as train from '../../support/Train'
import * as editDialogModal from '../../support/components/EditDialogModal'

describe('EditAndBranching', () => {
  it('Tag And Frog', () => {
    let textEntityPairs = [{text: 'Tag', entity: 'multi'}, {text: 'Frog', entity: 'multi'}]

    models.ImportModel('z-tagAndFrog2', 'z-tagAndFrog2.cl')
    modelPage.NavigateToTrainDialogs()
    cy.WaitForTrainingStatusCompleted()

    train.EditTraining('This is Tag.', 'This is Tag.', 'Hi')
    editDialogModal.SelectChatTurnExactMatch('This is Tag.')

    editDialogModal.VerifyEntityLabelWithinSpecificInput([textEntityPairs[0]], 0)
    editDialogModal.VerifyEntityLabelWithinSpecificInput(textEntityPairs, 1)
    editDialogModal.VerifyEntityLabelWithinSpecificInput(textEntityPairs, 2)

    editDialogModal.RemoveEntityLabel('Tag', 'multi', 1)
    editDialogModal.RemoveEntityLabel('Frog', 'multi', 2)

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