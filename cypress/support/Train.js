/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

const scorerModal = require('./components/ScorerModal')
const trainDialogsGrid = require('./components/TrainDialogsGrid')
const editDialogModal = require('./components/EditDialogModal')
const helpers = require('./Helpers')

function Today() { return Cypress.moment().format("MM/DD/YYYY") }

// Workaround: to get true global data it must be attached to the window object.
window.trainingSummary = undefined
window.expectedTrainGridRowCount = 9999

export function CreateNewTrainDialog()
{
  cy.Train_CreateNewTrainDialog()
  trainDialogsGrid.CreateNewTrainDialog()
}

export function TypeYourMessage(message)
{
  editDialogModal.TypeYourMessage(message)
  cy.Train_TypeYourMessage(message)
}

export function SelectAction(expectedResponse, lastResponse)
{
  scorerModal.ClickAction(expectedResponse)
  cy.Train_SelectAction(expectedResponse, lastResponse)
}

export function Save()
{
  editDialogModal.ClickSaveButton()
  cy.Train_Save()
  trainDialogsGrid.VerifyPageTitle()
  
  // Workaround: We need to do this here instead of inside of Train_VerifyTrainingSummaryIsInGrid()
  //             since Cypress won't retry that function. ALSO we need to prevent that function 
  //             from executing until we know the grid is populated and this will do that.
  trainDialogsGrid.GridIsReady(elements => { expect(elements).to.have.length(window.expectedTrainGridRowCount)})

  cy.Train_VerifyTrainingSummaryIsInGrid()
}

export function OneTimeInitialization()
{
  Cypress.Commands.add("Train_CreateNewTrainDialog", () =>
  {
    var turns = trainDialogsGrid.GetTurns()
    window.expectedTrainGridRowCount = (turns ? turns.length : 0) + 1
    window.trainingSummary = 
    {
      FirstInput: undefined,
      LastInput: undefined,
      LastResponse: undefined,
      Turns: 0,
      LastModifiedDate: undefined,
      CreatedDate: undefined,
    }    
  })

  Cypress.Commands.add("Train_TypeYourMessage", (message) =>
  {
    if (!window.trainingSummary.FirstInput) window.trainingSummary.FirstInput = message
    window.trainingSummary.LastInput = message
    window.trainingSummary.Turns++
  })

  // lastResponse is OPTIONAL, it is needed when the Action contains a $entityName
  // that was replaced with the expected value in expectedResponse.
  Cypress.Commands.add("Train_SelectAction", (expectedResponse, lastResponse) =>
  {
    if (lastResponse) window.trainingSummary.LastResponse = lastResponse
    else window.trainingSummary.LastResponse = expectedResponse
  })

  Cypress.Commands.add("Train_Save", () => { window.trainingSummary.CreatedDate = window.trainingSummary.LastModifiedDate = Today() })

  Cypress.Commands.add("Train_VerifyTrainingSummaryIsInGrid", () =>
  {
    var turns = trainDialogsGrid.GetTurns()

    // Workaround: Can NOT do this here because Cypress does not do its retry on this method.
    // expect(window.expectedTrainGridRowCount).to.equal(turns.length)
    
    var firstInputs = trainDialogsGrid.GetFirstInputs()
    var lastInputs = trainDialogsGrid.GetLastInputs()
    var lastResponses = trainDialogsGrid.GetLastResponses()
    var lastModifiedDates = trainDialogsGrid.GetLastModifiedDates()
    var createdDates = trainDialogsGrid.GetCreatedDates()

    for (var i = 0; i < window.expectedTrainGridRowCount; i++)
    {
      if (lastModifiedDates[i] == window.trainingSummary.LastModifiedDate && 
          turns[i] == window.trainingSummary.Turns &&
          createdDates[i] == window.trainingSummary.CreatedDate &&
          firstInputs[i] == window.trainingSummary.FirstInput &&
          lastInputs[i] == window.trainingSummary.LastInput &&
          lastResponses[i] == window.trainingSummary.LastResponse)
        return
    }
    throw `The grid should, but does not, contain a row with this data in it: FirstInput: ${window.trainingSummary.FirstInput} -- LastInput: ${window.trainingSummary.LastInput} -- LastResponse: ${window.trainingSummary.LastResponse} -- Turns: ${window.trainingSummary.Turns} -- LastModifiedDate: ${window.trainingSummary.LastModifiedDate} -- CreatedDate: ${window.trainingSummary.CreatedDate}`
  })
}

function ConLogTrainingSummary(message)
{
  helpers.ConLog(`######==> ${message}`, `FirstInput: ${window.trainingSummary.FirstInput} -- LastInput: ${window.trainingSummary.LastInput} -- LastResponse: ${window.trainingSummary.LastResponse} -- Turns: ${window.trainingSummary.Turns} -- LastModifiedDate: ${window.trainingSummary.LastModifiedDate} -- CreatedDate: ${window.trainingSummary.CreatedDate}`)
}