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


const addToCypressTestList = require('../../support/TestList')
const testList = require('/temp/TestsToRun')
console.log(testList.testList)
addToCypressTestList.AddToCypressTestList2(testList.testList) 


/// Description: A temporary workspace for experimental code
// describe('zTemp test', () =>
// {
//   it('zTemp test', () => 
//   {
//     // homePage.Visit()
//     // homePage.NavigateToModelPage("BigTrain")
//     // // modelPage.NavigateToTrainDialogs()
//     // cy.pause()//.then(() =>
//     // cy.Train_CaptureAllChatMessages()
//     // cy.pause()
    
//   })
// })


