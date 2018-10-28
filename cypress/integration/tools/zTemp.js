/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const homePage = require('../../support/components/HomePage')
const modelPage = require('../../support/components/ModelPage')
const train = require('../../support/Train')
const trainDialogsGrid = require('../../support/components/TrainDialogsGrid')

/// Description: A temporary workspace for experimental code
describe('zTemp test', () =>
{
  it('zTemp test', () => 
  {
    homePage.Visit()
    homePage.NavigateToModelPage("Model1-mni-Oct26-090220-500")
    modelPage.NavigateToTrainDialogs()

    //cy.pause()
    cy.WaitForTrainingStatusCompleted()
    train.RemoveThisFunction()

    // console.log('##2##')
    // train.CreateNewTrainDialog()
  
    // train.TypeYourMessage('Hello')
  
    // Cypress.Commands.add("zTemp", () => 
    // {
    //   var turns = trainDialogsGrid.GetTurns()
    //   console.log(`turns.length: ${turns.length} ${turns}`)
    // })
    // cy.zTemp()
  })
})
