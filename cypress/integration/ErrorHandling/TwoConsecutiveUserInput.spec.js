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
  it('Two Consecutive User Input', () => {
    models.ImportModel('z-2UserInputs', 'z-disqualifyngEnt.Trained.cl')
    modelPage.NavigateToTrainDialogs()
    cy.WaitForTrainingStatusCompleted()

    modelPage.VerifyNoIncidentTriangleOnPage()

    train.EditTraining('Hey', 'world peace', "Sorry $name, I can't help you get $want")
    editDialogModal.InsertUserInputAfter('Sam', 'InsertedText')
    editDialogModal.VerifyErrorMessage(common.trainDialogHasErrorsMessage)
    editDialogModal.SelectChatTurnExactMatch('Sam')
    editDialogModal.VerifyErrorMessage('Two consecutive User Inputs')

    editDialogModal.ClickSaveCloseButton()

    modelPage.VerifyIncidentTriangleForTrainDialogs()
    train.VerifyIncidentTriangleFoundInTrainDialogsGrid(`Hey`, 'world peace', "Sorry $name, I can't help you get $want")

    // - - - Open the same Train Dialog, validate and fix the errors. - - -

    train.EditTraining(`Hey`, 'world peace', "Sorry $name, I can't help you get $want")
    editDialogModal.VerifyErrorMessage(common.trainDialogHasErrorsMessage)
    editDialogModal.SelectChatTurnExactMatch('Sam')
    editDialogModal.VerifyErrorMessage('Two consecutive User Inputs')
    editDialogModal.SelectChatTurnExactMatch('InsertedText')
    editDialogModal.ClickDeleteChatTurn()
    editDialogModal.VerifyNoErrorMessage()

    editDialogModal.ClickSaveCloseButton()
    modelPage.VerifyNoIncidentTriangleOnPage()
  })
})