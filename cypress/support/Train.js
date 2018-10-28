/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

const scorerModal = require('./components/ScorerModal')
const trainDialogsGrid = require('./components/TrainDialogsGrid')
const editDialogModal = require('./components/EditDialogModal')
const helpers = require('./Helpers.js')

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

// Cypress Flaw: to get true global data it must be attached to the window object.
window.trainingSummary = newTrainingSummary
window.expectedTrainGridRowCount = 9999

export function CreateNewTrainDialog()
{
  cy.train_CreateNewTrainDialog().then(() => {helpers.ConLog(`CreateNewTrainDialog`, `expectedTrainGridRowCount: ${window.expectedTrainGridRowCount}`)})
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
  trainDialogsGrid.GridIsReady(elements => { expect(elements).to.have.length(window.expectedTrainGridRowCount)})
  cy.wrap(700, {timeout: 15000}).train_VerifyTrainingSummaryIsInGrid()
}

export function OneTimeInitialization()
{
console.log('##3##')  
  Cypress.Commands.add("train_CreateNewTrainDialog", () =>
  {
    var turns = trainDialogsGrid.GetTurns()
    window.expectedTrainGridRowCount = (turns ? turns.length : 0) + 1
    helpers.ConLog(`train_CreateNewTrainDialog`, `expectedTrainGridRowCount: ${window.expectedTrainGridRowCount}`)
    window.trainingSummary = newTrainingSummary
  })

  Cypress.Commands.add("train_TypeYourMessage", (message) =>
  {
    if (!window.trainingSummary.FirstInput) 
    {
      ConLogTrainingSummary(`train_TypeYourMessage1: ${message}`)
      window.trainingSummary.FirstInput = message
    }
    window.trainingSummary.LastInput = message
    ConLogTrainingSummary(`train_TypeYourMessage2: ${message}`)
    window.trainingSummary.Turns++
    ConLogTrainingSummary(`train_TypeYourMessage3: ${message}`)
  })

  Cypress.Commands.add("train_SelectAction", (expectedResponse, lastResponse) =>
  {
    ConLogTrainingSummary(`train_SelectAction: ${expectedResponse} ${lastResponse}`)
    if (lastResponse) window.trainingSummary.LastResponse = lastResponse
    else window.trainingSummary.LastResponse = expectedResponse // NOTE: This is ONLY correct if the response contains no entities that have been replaced.
  })

  Cypress.Commands.add("train_Save", () => {ConLogTrainingSummary(`train_Save`)
    window.trainingSummary.CreatedDate = window.trainingSummary.LastModifiedDate = Today()})

  Cypress.Commands.add("train_VerifyTrainingSummaryIsInGrid", () =>
  {
    ConLogTrainingSummary(`train_VerifyTrainingSummaryIsInGrid`)
    var turns = trainDialogsGrid.GetTurns()
    
    // CanNOT do this here because cypress does not do its retry on this method.
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

export function RemoveThisFunction()
{
  window.trainingSummary = 
  {
    FirstInput: 'My name is David.',
    LastInput: 'xyz123',
    LastResponse: 'Hello $name',
    Turns: 10,
    LastModifiedDate: '10/26/2018',
    CreatedDate: '10/26/2018',
  }
  window.expectedTrainGridRowCount = 2
  trainDialogsGrid.GridIsReady(window.expectedTrainGridRowCount)
  cy.wrap(700, {timeout: 15000}).train_VerifyTrainingSummaryIsInGrid() 
}

function ConLogTrainingSummary(message)
{
  helpers.ConLog(`######==> ${message}`, `FirstInput: ${window.trainingSummary.FirstInput} -- LastInput: ${window.trainingSummary.LastInput} -- LastResponse: ${window.trainingSummary.LastResponse} -- Turns: ${window.trainingSummary.Turns} -- LastModifiedDate: ${window.trainingSummary.LastModifiedDate} -- CreatedDate: ${window.trainingSummary.CreatedDate}`)
}