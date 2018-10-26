/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

const scorerModal = require('../support/components/ScorerModal')
const trainDialogsGrid = require('../support/components/TrainDialogsGrid')
const editDialogModal = require('../support/components/EditDialogModal')

function Today() { return Cypress.moment().format("MM/DD/YYYY") }

const newTrainingSummary =
{
  FirstInput: undefined,
  LastInput: undefined,
  LastResponse: undefined,
  Turns: 0,
  LastModifiedDate: undefined,
  CreatedDate: undefined,
}

export var trainingSummary = newTrainingSummary
export var trainGridRowCount = 0

export function CreateNewTrainDialog()
{
  cy.train_CreateNewTrainDialog()
  trainDialogsGrid.CreateNewTrainDialog()
}

export function TypeYourMessage(message)
{
  editDialogModal.TypeYourMessage(message)
  cy.train_TypeYourMessage(message)
}

export function SelectAction(expectedResponse, lastResponse)
{
  scorerModal.ClickAction(expectedResponse)
  cy.train_SelectAction(expectedResponse, lastResponse)
}

export function Save()
{
  editDialogModal.ClickSaveButton()
  cy.train_Save()
  trainDialogsGrid.VerifyPageTitle()
  cy.train_VerifyTrainingSummaryIsInGrid()
}

export function OneTimeInitialization()
{
console.log('##3##')  
  Cypress.Commands.add("train_CreateNewTrainDialog", () =>
  {
    var turns = trainDialogsGrid.GetTurns()
    trainGridRowCount = turns ? turns.length : 0
    window.trainingSummary = newTrainingSummary
  })

  Cypress.Commands.add("train_TypeYourMessage", (message) =>
  {
    if (!window.trainingSummary.FirstInput) window.trainingSummary.FirstInput = message
    window.trainingSummary.LastInput = message
    window.trainingSummary.Turns++
    console.log(`######==> train_TypeYourMessage: ${message} -- ${window.trainingSummary.FirstInputs} -- ${window.trainingSummary.LastInputs} -- ${window.trainingSummary.LastResponse} -- ${window.trainingSummary.Turns} -- ${window.trainingSummary.LastModifiedDate} -- ${window.trainingSummary.CreatedDate}`)
  })

  Cypress.Commands.add("train_SelectAction", (expectedResponse, lastResponse) =>
  {
    if (lastResponse) window.trainingSummary.LastResponse = lastResponse
    else window.trainingSummary.LastResponse = expectedResponse // NOTE: This is ONLY correct if the response contains no entities that have been replaced.
  })

  Cypress.Commands.add("train_Save", () => {console.log(`======>${window.trainingSummary.FirstInputs} -- ${window.trainingSummary.LastInputs} -- ${window.trainingSummary.LastResponse} -- ${window.trainingSummary.Turns} -- ${window.trainingSummary.LastModifiedDate} -- ${window.trainingSummary.CreatedDate}`)
    window.trainingSummary.CreatedDates = window.trainingSummary.LastModifiedDates = Today()})

  Cypress.Commands.add("train_VerifyTrainingSummaryIsInGrid", () =>
  {
    var turns = trainDialogsGrid.GetTurns()
    expect(trainGridRowCount).to.equal(turns.length - 1)
    trainGridRowCount = turns.length
    
    var firstInputs = trainDialogsGrid.GetFirstInputs()
    var lastInputs = trainDialogsGrid.GetLastInputs()
    var lastResponses = trainDialogsGrid.GetLastResponses()
    var lastModifiedDates = trainDialogsGrid.GetLastModifiedDates()
    var createdDates = trainDialogsGrid.GetCreatedDates()

    for (var i = 0; i < trainGridRowCount; i++)
    {
      if (lastModifiedDates[i] == window.trainingSummary.LastModifiedDate && 
          turns[i] == window.trainingSummary.Turns &&
          createdDates[i] == window.trainingSummary.CreatedDate &&
          firstInputs[i] == window.trainingSummary.FirstInputs &&
          lastInputs[i] == window.trainingSummary.LastInputs &&
          lastResponses[i] == window.trainingSummary.LastResponse)
        return
    }
    throw `The grid should, but does not, contain a row with this data in it: ${window.trainingSummary.FirstInputs} -- ${window.trainingSummary.LastInputs} -- ${window.trainingSummary.LastResponse} -- ${window.trainingSummary.Turns} -- ${window.trainingSummary.LastModifiedDate} -- ${window.trainingSummary.CreatedDate}`
  })
}


