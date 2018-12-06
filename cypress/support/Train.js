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
window.currentTrainingSummary = undefined

export function CreateNewTrainDialog()
{
  cy.Enqueue(() => 
  {
    var turns = trainDialogsGrid.GetTurns()
    window.currentTrainingSummary = 
    {
      FirstInput: undefined,
      LastInput: undefined,
      LastResponse: undefined,
      Turns: 0,
      MomentTrainingStarted: Cypress.moment(),
      MomentTrainingEnded: undefined,
      LastModifiedDate: undefined,
      CreatedDate: undefined,
      TrainGridRowCount: (turns ? turns.length : 0) + 1
    }
    window.isBranched = false
  })
  trainDialogsGrid.CreateNewTrainDialog()
}

export function EditTraining(firstInput, lastInput, lastResponse)
{
  cy.Enqueue(() => 
  {
    var turns = trainDialogsGrid.GetTurns()
    var firstInputs = trainDialogsGrid.GetFirstInputs()
    var lastInputs = trainDialogsGrid.GetLastInputs()
    var lastResponses = trainDialogsGrid.GetLastResponses()
    var lastModifiedDates = trainDialogsGrid.GetLastModifiedDates()
    var createdDates = trainDialogsGrid.GetCreatedDates()

    helpers.ConLog(`EditTraining(${firstInput}, ${lastInput}, ${lastResponse})`, `${turns.length}, ${lastInputs[0]}, ${lastInputs[1]}, ${lastInputs[2]}`)

    for (var i = 0; i < firstInputs.length; i++)
    {
      if (firstInputs[i] == firstInput && lastInputs[i] == lastInput && lastResponses[i] == lastResponse)
      {
        window.currentTrainingSummary = 
        {
          FirstInput: firstInputs[i],
          LastInput: lastInputs[i],
          LastResponse: lastResponses[i],
          Turns: turns[i],
          MomentTrainingStarted: Cypress.moment(),
          MomentTrainingEnded: undefined,
          LastModifiedDate: lastModifiedDates[i],
          CreatedDate: createdDates[i],
          TrainGridRowCount: (turns ? turns.length : 0)
        }    
        window.originalTrainingSummary = Object.create(window.currentTrainingSummary)
        window.isBranched = false

        helpers.ConLog(`EditTraining(${firstInput}, ${lastInput}, ${lastResponse})`, `ClickTraining for ${i} - ${turns[i]}, ${firstInputs[i]}, ${lastInputs[i]}, ${lastResponses[i]}`)
        trainDialogsGrid.ClickTraining(i)
        return
      }
    }
    throw `The grid should, but does not, contain a row with this data in it: FirstInput: ${firstInput} -- LastInput: ${lastInput} -- LastResponse: ${lastResponse}`
  })
}

export function TypeYourMessage(message)
{
  editDialogModal.TypeYourMessage(message)
  cy.Enqueue(() => 
  {
    if (!window.currentTrainingSummary.FirstInput) window.currentTrainingSummary.FirstInput = message
    window.currentTrainingSummary.LastInput = message
    window.currentTrainingSummary.Turns++
  })
}

// lastResponse parameter is optional. It is necessary only when there are $entities
// in the Action that produced the Bot's last response.
export function SelectAction(expectedResponse, lastResponse)
{
  scorerModal.ClickAction(expectedResponse)
  cy.Enqueue(() => 
  { 
    if (lastResponse) window.currentTrainingSummary.LastResponse = lastResponse
    else window.currentTrainingSummary.LastResponse = expectedResponse
  })
}

// This method is used to score AND AUTO-SELECT the action after branching.
export function ClickScoreActionsButton(lastResponse)
{
  editDialogModal.ClickScoreActionsButton()
  cy.Enqueue(() => 
  { 
    window.currentTrainingSummary.LastResponse = lastResponse
  })
}

export function Save()
{
  editDialogModal.ClickSaveCloseButton()
  trainDialogsGrid.VerifyPageTitle()
  cy.Enqueue(() => 
  { 
    window.currentTrainingSummary.MomentTrainingEnded = Cypress.moment()
    
    if (window.isBranched) VerifyTrainingSummaryIsInGrid(window.originalTrainingSummary)

    VerifyTrainingSummaryIsInGrid(window.currentTrainingSummary)
  })
}

function VerifyTrainingSummaryIsInGrid(trainingSummary)
{
  trainDialogsGrid.WaitForGridReadyThen(trainingSummary.TrainGridRowCount, () =>
  {
    helpers.ConLog(`VerifyTrainingSummaryIsInGrid`, `LastModifiedDate: ${trainingSummary.LastModifiedDate}`)
    helpers.ConLog(`VerifyTrainingSummaryIsInGrid`, `CreatedDate: ${trainingSummary.CreatedDate}`)
    helpers.ConLog(`VerifyTrainingSummaryIsInGrid`, `MomentTrainingStarted: ${trainingSummary.MomentTrainingStarted.format()}`)
    helpers.ConLog(`VerifyTrainingSummaryIsInGrid`, `MomentTrainingEnded: ${trainingSummary.MomentTrainingEnded.format()}`)

    var turns = trainDialogsGrid.GetTurns()
    var firstInputs = trainDialogsGrid.GetFirstInputs()
    var lastInputs = trainDialogsGrid.GetLastInputs()
    var lastResponses = trainDialogsGrid.GetLastResponses()
    var lastModifiedDates = trainDialogsGrid.GetLastModifiedDates()
    var createdDates = trainDialogsGrid.GetCreatedDates()
    
    for (var i = 0; i < trainingSummary.TrainGridRowCount; i++)
    { // TODO: This needs to be tested at edge cases, like starting before midnight, ending after midnight, etc...
      helpers.ConLog(`VerifyTrainingSummaryIsInGrid`, `LastModifiedDates[${i}]: ${lastModifiedDates[i]}`)
      helpers.ConLog(`VerifyTrainingSummaryIsInGrid`, `CreatedDates[${i}]: ${createdDates[i]}`)
      if (((trainingSummary.LastModifiedDate && lastModifiedDates[i] == trainingSummary.LastModifiedDate) ||
          helpers.Moment(lastModifiedDates[i]).isBetween(trainingSummary.MomentTrainingStarted, trainingSummary.MomentTrainingEnded)) && 
          turns[i] == trainingSummary.Turns &&
          ((trainingSummary.CreatedDate && createdDates[i] == trainingSummary.CreatedDate) ||
          helpers.Moment(createdDates[i]).isBetween(trainingSummary.MomentTrainingStarted, trainingSummary.MomentTrainingEnded)) && 
          firstInputs[i] == trainingSummary.FirstInput &&
          lastInputs[i] == trainingSummary.LastInput &&
          lastResponses[i] == trainingSummary.LastResponse)
        return
    }
    throw `The grid should, but does not, contain a row with this data in it: FirstInput: ${trainingSummary.FirstInput} -- LastInput: ${trainingSummary.LastInput} -- LastResponse: ${trainingSummary.LastResponse} -- Turns: ${trainingSummary.Turns} -- LastModifiedDate: ${trainingSummary.LastModifiedDate} -- CreatedDate: ${trainingSummary.CreatedDate}`
  })
}

export function CaptureOriginalChatMessages() 
{ 
  cy.WaitForStableDOM().then(() => { window.originalChatMessages = editDialogModal.GetAllChatMessages() })
}

export function VerifyOriginalChatMessages() 
{ 
  VerifyAllChatMessages(() => { return window.originalChatMessages })
}

export function CaptureEditedChatMessages() 
{ 
  cy.WaitForStableDOM().then(() => { window.editedChatMessages = editDialogModal.GetAllChatMessages() })
}

export function VerifyEditedChatMessages() 
{ 
  VerifyAllChatMessages(() => { return window.editedChatMessages })
}

function VerifyAllChatMessages(functionGetChatMessagesToBeVerified) 
{ 
  cy.WaitForStableDOM().then(() => 
  {
    var errorMessage = ''
    var chatMessagesToBeVerified = functionGetChatMessagesToBeVerified()
    var allChatMessages = editDialogModal.GetAllChatMessages()  

    if (allChatMessages.length != chatMessagesToBeVerified.length) 
      errorMessage += `Original chat message count was ${chatMessagesToBeVerified.length}, current chat message count is ${allChatMessages.length}.`

    var length = Math.max(allChatMessages.length, chatMessagesToBeVerified.length)
    for (var i = 0; i < length; i++)
    {
      if (i >= allChatMessages.length)
        errorMessage += `-- [${i}] - Original: '${chatMessagesToBeVerified[i]}' is extra'`
      else if (i >= chatMessagesToBeVerified.length)
        errorMessage += `-- [${i}] - Current: '${allChatMessages[i]}' is extra'`
      else if (allChatMessages[i] != chatMessagesToBeVerified[i]) 
        errorMessage += `-- [${i}] - Original: '${chatMessagesToBeVerified[i]}' does not match current: '${allChatMessages[i]}'`
    }
    if (errorMessage.length > 0) throw errorMessage
  })
}

export function BranchChatTurn(originalMessage, newMessage, originalIndex = 0)
{
  cy.Enqueue(() =>
  {
    originalMessage = originalMessage.replace(/'/g, "’")

    editDialogModal.SelectChatTurn(originalMessage, originalIndex)

    editDialogModal.VerifyBranchButtonIsInSameControlGroupAsMessage(originalMessage)

    // Capture the list of messages currently in the chat, truncate it at the point of branching, then add the new message to it.
    // This array will be used later to validate that the changed chat is persisted.
    var branchedChatMessages
    cy.WaitForStableDOM().then(() => 
    { 
      branchedChatMessages = editDialogModal.GetAllChatMessages()
      for (var i = 0; i < branchedChatMessages.length; i++)
      {
        if (branchedChatMessages[i] == originalMessage)
        {
          branchedChatMessages.length = i + 1
          branchedChatMessages[i] = newMessage
        }
      }
    })

    editDialogModal.BranchChatTurn(newMessage)
    window.isBranched = true
    window.originalTrainingSummary.TrainGridRowCount ++
    window.currentTrainingSummary.TrainGridRowCount ++

    VerifyAllChatMessages(() => { return branchedChatMessages })
  })
}

export function SelectAndVerifyEachChatTurn(index = 0)
{
  if (index == 0) editDialogModal.GetAllChatTurns()
  cy.Get('@allChatTurns').then(elements => 
  {
    if (index < elements.length)
    {
      cy.wrap(elements[index]).Click().then(() =>
      {
        editDialogModal.VerifyChatTurnControls(elements[index], index)
        SelectAndVerifyEachChatTurn(index + 1)
      })
    }
  })
}
