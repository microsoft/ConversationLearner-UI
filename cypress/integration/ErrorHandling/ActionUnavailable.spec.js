/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../support/Models'
import * as modelPage from '../../support/components/ModelPage'
import * as train from '../../support/Train'
import * as editDialogModal from '../../support/components/EditDialogModal'
import * as common from '../../support/Common'

describe('ErrorHandling', () => {
  it('Action Unavailable', () => {
    models.ImportModel('z-actionUnavail', 'z-whatsYourName.cl')
    modelPage.NavigateToTrainDialogs()
    cy.WaitForTrainingStatusCompleted()

    modelPage.VerifyNoErrorIconOnPage()

    train.CreateNewTrainDialog()

    train.TypeYourMessage('Joe')
    editDialogModal.LabelTextAsEntity('Joe', 'name')
    editDialogModal.ClickScoreActionsButton()
    train.SelectAction('Hello Joe')

    editDialogModal.SelectChatTurnExactMatch('Joe')
    editDialogModal.RemoveEntityLabel('Joe', 'name')
    editDialogModal.ClickSubmitChangesButton()
    editDialogModal.VerifyErrorMessage(common.trainDialogHasErrorsMessage)

    editDialogModal.SelectChatTurnStartsWith('Hello')
    editDialogModal.VerifyErrorMessage('Action is unavailable')

    editDialogModal.ClickSaveCloseButton()
    modelPage.VerifyErrorIconForTrainDialogs()
    train.VerifyErrorsFoundInTraining(`Joe`, 'Joe', "Hello $name")

    train.EditTraining(`Joe`, 'Joe', "Hello $name")
    editDialogModal.VerifyErrorMessage(common.trainDialogHasErrorsMessage)

    editDialogModal.SelectChatTurnStartsWith('Hello')
    editDialogModal.VerifyErrorMessage('Action is unavailable')

    editDialogModal.SelectChatTurnExactMatch('Joe')
    editDialogModal.LabelTextAsEntity('Joe', 'name')
    editDialogModal.ClickSubmitChangesButton()

    editDialogModal.VerifyNoErrorMessage()

    editDialogModal.ClickSaveCloseButton()
    modelPage.VerifyNoErrorIconOnPage()
  })
})