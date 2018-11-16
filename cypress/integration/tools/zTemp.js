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
    var obj = {a: 25, b: 50, c: 75};
    var A = Object.create(obj);
    var B = Object.create(obj);

    A.a = 30;
    B.a = 40;

    alert(`${obj.a} ${A.a} ${B.a} ${A.b} ${B.c}`); // 25 30 40

    // homePage.Visit()
    // homePage.NavigateToModelPage("BigTrain")
    // // modelPage.NavigateToTrainDialogs()
    // cy.pause()//.then(() =>
    // cy.Train_CaptureAllChatMessages()
    // cy.pause()
    // cy.Train_VerifyAllChatMessagesSameAsCaptured()
  })
})
