/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const models = require('../../support/Models')
const modelPage = require('../../support/components/ModelPage')
const train = require('../../support/Train')
const editDialogModal = require('../../support/components/EditDialogModal')

// This is a test case to test one of our test methods, cy.DoesNotContain.
// The problem with that method is that if it has a bug and does not find
// the element we were expecting to not be on the page it passes, so this
// will verify that our method is working as we expect.
export function VerifyDoesNotContainTestMethod()
{
  models.ImportModel('z-editContols', 'z-nameTrained.cl')
  modelPage.NavigateToTrainDialogs()

  train.EditTraining('My name is David.', 'My name is Susan.', 'Hello $name')
  train.CaptureOriginalChatMessages()

  editDialogModal.SelectChatTurn('My name is Susan.')
  editDialogModal.VerifyCyDoesNotContainMethodWorksWithSpecialChatSelector()

  editDialogModal.ClickSaveCloseButton()
}
