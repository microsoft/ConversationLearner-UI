/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const models = require('../../support/Models')
const modelPage = require('../../support/components/ModelPage')
const scorerModal = require('../../support/components/ScorerModal')
const train = require('../../support/Train')
const editDialogModal = require('../../support/components/EditDialogModal')

describe('EditAndBranching', () => {
  it('Verify Edit Training Controls And Labels', () => {
    models.ImportModel('z-editContols', 'z-nameTrained.cl')
    modelPage.NavigateToTrainDialogs()

    train.EditTraining('My name is David.', 'My name is Susan.', 'Hello $name')
    train.CaptureOriginalChatMessages()

    editDialogModal.VerifyCloseButtonLabel()
    editDialogModal.VerifyDeleteButtonLabel()

    editDialogModal.VerifyThereAreNoChatEditControls('My name is David.', 'Hello Susan')
    train.SelectAndVerifyEachChatTurn()

    train.BranchChatTurn('My name is Susan.', 'I am Groot')
    editDialogModal.VerifySaveBranchButtonLabel()
    editDialogModal.VerifyAbandonBranchButtonLabel()

    editDialogModal.VerifyThereAreNoChatEditControls('I am Groot', 'Hello David')
    editDialogModal.AbandonBranchChanges()

    train.EditTraining('My name is David.', 'My name is Susan.', 'Hello $name')
    train.VerifyOriginalChatMessages()
  })
})