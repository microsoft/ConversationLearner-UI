/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const models = require('../../support/Models')
const modelPage = require('../../support/components/ModelPage')
const train = require('../../support/Train')
const editDialogModal = require('../../support/components/EditDialogModal')
const common = require('../../support/Common')

describe('ErrorHandling', () => {
  it('Two Consecutive User Input', () => {
    models.ImportModel('z-2UserInputs', 'z-disqualifyngEnt.Trained.cl')
    modelPage.NavigateToTrainDialogs()
    cy.WaitForTrainingStatusCompleted()

    modelPage.VerifyNoErrorIconOnPage()

    train.EditTraining('Hey', 'world peace', "Sorry $name, I can't help you get $want")
    editDialogModal.InsertUserInputAfter('Sam', 'InsertedText')
    editDialogModal.VerifyErrorMessage(common.trainDialogHasErrorsMessage)
    editDialogModal.SelectChatTurnExactMatch('Sam')
    editDialogModal.VerifyErrorMessage('Two consecutive User Inputs')

    editDialogModal.ClickSaveCloseButton()

    modelPage.VerifyErrorIconForTrainDialogs()
    train.VerifyErrorsFoundInTraining(`${common.errorIconCharacter}Hey`, 'world peace', "Sorry $name, I can't help you get $want")

    // - - - Open the same Train Dialog, validate and fix the errors. - - -

    train.EditTraining(`${common.errorIconCharacter}Hey`, 'world peace', "Sorry $name, I can't help you get $want")
    editDialogModal.VerifyErrorMessage(common.trainDialogHasErrorsMessage)
    editDialogModal.SelectChatTurnExactMatch('Sam')
    editDialogModal.VerifyErrorMessage('Two consecutive User Inputs')
    editDialogModal.SelectChatTurnExactMatch('InsertedText')
    editDialogModal.ClickDeleteChatTurn()
    editDialogModal.VerifyNoErrorMessage()

    editDialogModal.ClickSaveCloseButton()
    modelPage.VerifyNoErrorIconOnPage()
  })
})