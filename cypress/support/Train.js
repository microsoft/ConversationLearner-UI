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
  cy.Enqueue(() => 
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
  trainDialogsGrid.CreateNewTrainDialog()
}

export function TypeYourMessage(message)
{
  editDialogModal.TypeYourMessage(message)
  cy.Enqueue(() => 
  {
    if (!window.trainingSummary.FirstInput) window.trainingSummary.FirstInput = message
    window.trainingSummary.LastInput = message
    window.trainingSummary.Turns++
  })
}

export function SelectAction(expectedResponse, lastResponse)
{
  scorerModal.ClickAction(expectedResponse)
  cy.Enqueue(() => 
  { 
    if (lastResponse) window.trainingSummary.LastResponse = lastResponse
    else window.trainingSummary.LastResponse = expectedResponse
  })
}

export function Save()
{
  editDialogModal.ClickSaveButton()
  cy.Enqueue(() => { window.trainingSummary.CreatedDate = window.trainingSummary.LastModifiedDate = Today() })
  trainDialogsGrid.VerifyPageTitle()
  VerifyTrainingSummaryIsInGrid()
}

export function VerifyTrainingSummaryIsInGrid()
{
  trainDialogsGrid.WaitForGridReadyThen(() =>
  {
    var turns = trainDialogsGrid.GetTurns()
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

export function EditTraining(firstInput, lastInput, lastResponse)
{
  cy.Enqueue(() => 
  {
    var firstInputs = trainDialogsGrid.GetFirstInputs()
    var lastInputs = trainDialogsGrid.GetLastInputs()
    var lastResponses = trainDialogsGrid.GetLastResponses()

    for (var i = 0; i < firstInputs.length; i++)
    {
      if (firstInputs[i] == firstInput && lastInputs[i] == lastInput && lastResponses[i] == lastResponse)
      {
        trainDialogsGrid.ClickTraining(i)
        return
      }
    }
    throw `The grid should, but does not, contain a row with this data in it: FirstInput: ${window.trainingSummary.FirstInput} -- LastInput: ${window.trainingSummary.LastInput} -- LastResponse: ${window.trainingSummary.LastResponse}`
  })
}

export function CaptureAllChatMessages() 
{ 
  cy.WaitForStableDOM().then(() => { window.capturedAllChatMessages = editDialogModal.GetAllChatMessages() })
}

export function VerifyAllChatMessagesSameAsCaptured() 
{ 
  cy.WaitForStableDOM().then(() => 
  {
    var errorMessage = ''
    var allChatMessages = editDialogModal.GetAllChatMessages()  

    if (allChatMessages.length != window.capturedAllChatMessages.length) 
      errorMessage += `Original chat message count was ${window.capturedAllChatMessages.length}, current chat message count is ${allChatMessages.length}.`

    var length = Math.max(allChatMessages.length, window.capturedAllChatMessages.length)
    for (var i = 0; i < length; i++)
    {
      if (i >= allChatMessages.length)
        errorMessage += `-- [${i}] - Original: '${window.capturedAllChatMessages[i]}' is extra'`
      else if (i >= window.capturedAllChatMessages.length)
        errorMessage += `-- [${i}] - Current: '${allChatMessages[i]}' is extra'`
      else if (allChatMessages[i] != window.capturedAllChatMessages[i]) 
        errorMessage += `-- [${i}] - Original: '${window.capturedAllChatMessages[i]}' does not match current: '${allChatMessages[i]}'`
    }
    if (errorMessage.length > 0) throw errorMessage
  })
}


function ConLogTrainingSummary(message)
{
  helpers.ConLog(`######==> ${message}`, `FirstInput: ${window.trainingSummary.FirstInput} -- LastInput: ${window.trainingSummary.LastInput} -- LastResponse: ${window.trainingSummary.LastResponse} -- Turns: ${window.trainingSummary.Turns} -- LastModifiedDate: ${window.trainingSummary.LastModifiedDate} -- CreatedDate: ${window.trainingSummary.CreatedDate}`)
}