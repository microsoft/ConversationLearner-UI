/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const helpers = require('../../support/Helpers')
const homePage = require('../../support/components/HomePage')
const modelPage = require('../../support/components/ModelPage')
const train = require('../../support/Train')
const trainDialogsGrid = require('../../support/components/TrainDialogsGrid')
const editDialogModal = require('../../support/components/EditDialogModal')

/// Description: A temporary workspace for experimental code
describe('zTemp test', () =>
{
  it('zTemp test', () => 
  {
    homePage.Visit()
    // homePage.NavigateToModelPage("BigTrain")
    // modelPage.NavigateToTrainDialogs()
    cy.pause()

    // editDialogModal.SelectChatTurn('Hello Paul', 3)
    // cy.pause()
    // editDialogModal.BranchChatTurn('Paul is not here', 'Larry wants to join the fun')
    editDialogModal.VerifyThereAreNoSpecialChatControls('My name is David.', 'Hello Susan')
  })
})
