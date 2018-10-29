/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const helpers = require('../../support/Helpers.js')
const homePage = require('../../support/components/HomePage')
const modelPage = require('../../support/components/ModelPage')
const train = require('../../support/Train')
const trainDialogsGrid = require('../../support/components/TrainDialogsGrid')

/// Description: A temporary workspace for experimental code
describe('zTemp test', () =>
{
  it('zTemp test', () => 
  {
    const newTrainingSummary =
    {
      FirstInput: undefined,
      LastInput: undefined,
      LastResponse: undefined,
      Turns: 0,
      LastModifiedDate: undefined,
      CreatedDate: undefined,
    }
    
    // Cypress Flaw: to get true global data it must be attached to the window object.
    window.trainingSummary = newTrainingSummary
    
    window.trainingSummary.FirstInput = "1st"
    window.trainingSummary.LastInput = "last!!!"
    window.trainingSummary.Turns = "****"

    helpers.ConLog(`######==>`, `FirstInput: ${newTrainingSummary.FirstInput} -- LastInput: ${newTrainingSummary.LastInput} -- LastResponse: ${newTrainingSummary.LastResponse} -- Turns: ${newTrainingSummary.Turns} -- LastModifiedDate: ${newTrainingSummary.LastModifiedDate} -- CreatedDate: ${newTrainingSummary.CreatedDate}`)

    // homePage.Visit()
    // homePage.NavigateToModelPage("Model1-mni-Oct26-090220-500")
    // modelPage.NavigateToTrainDialogs()

    // //cy.pause()
    // cy.WaitForTrainingStatusCompleted()

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
