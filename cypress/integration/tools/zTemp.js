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
const memoryTableComponent = require('../../support/components/MemoryTableComponent')

// Description: A temporary workspace for experimental code
describe('zTemp test', () =>
{
  it('zTemp test', () => 
  {
    homePage.Visit()
    cy.pause()
    train.TypeYourMessage('This is Tag and Frog.')
    memoryTableComponent.VerifyEntityInMemory('multi', 'Tag', 'Frog')
    editDialogModal.VerifyEntityLabel('Tag', 'multi')
    editDialogModal.VerifyEntityLabel('Frog', 'multi', 1)
    editDialogModal.ClickScoreActionsButton()
    train.SelectAction('Hi')
  
    train.Save()
      // homePage.NavigateToModelPage("BigTrain")
    // modelPage.NavigateToTrainDialogs()
    // cy.pause()
    // cy.Train_CaptureAllChatMessages()
  })
})