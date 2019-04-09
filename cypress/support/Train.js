/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

import * as scorerModal from './components/ScorerModal'
import * as trainDialogsGrid from './components/TrainDialogsGrid'
import * as editDialogModal from './components/EditDialogModal'
import * as helpers from './Helpers'

let currentTrainingSummary
let originalTrainingSummary
let isBranched
let originalChatMessages
let editedChatMessages

function Today() { return Cypress.moment().format("MM/DD/YYYY") }

export function CreateNewTrainDialog() {
  cy.Enqueue(() => {
    const turns = trainDialogsGrid.GetTurns()
    currentTrainingSummary =
      {
        FirstInput: undefined,
        LastInput: undefined,
        LastResponse: undefined,
        Turns: 0,
        // FUDGING on the time - subtract 25 seconds because the time is set by the server
        // which is not exactly the same as our test machine.
        MomentTrainingStarted: Cypress.moment().subtract(25, 'seconds'),
        MomentTrainingEnded: undefined,
        LastModifiedDate: undefined,
        CreatedDate: undefined,
        TrainGridRowCount: (turns ? turns.length : 0) + 1
      }
    isBranched = false
  })
  trainDialogsGrid.CreateNewTrainDialog()
}

export function EditTraining(firstInput, lastInput, lastResponse) {
  cy.Enqueue(() => {
    const turns = trainDialogsGrid.GetTurns()
    const firstInputs = trainDialogsGrid.GetFirstInputs()
    const lastInputs = trainDialogsGrid.GetLastInputs()
    const lastResponses = trainDialogsGrid.GetLastResponses()
    const lastModifiedDates = trainDialogsGrid.GetLastModifiedDates()
    const createdDates = trainDialogsGrid.GetCreatedDates()

    helpers.ConLog(`EditTraining(${firstInput}, ${lastInput}, ${lastResponse})`, `${turns.length}, ${lastInputs[0]}, ${lastInputs[1]}, ${lastInputs[2]}`)

    for (let i = 0; i < firstInputs.length; i++) {
      if (firstInputs[i] == firstInput && lastInputs[i] == lastInput && lastResponses[i] == lastResponse) {
        currentTrainingSummary =
          {
            FirstInput: firstInputs[i],
            LastInput: lastInputs[i],
            LastResponse: lastResponses[i],
            Turns: turns[i],
            // FUDGING on the time - subtract 25 seconds because the time is set by the server
            // which is not exactly the same as our test machine.
            MomentTrainingStarted: Cypress.moment().subtract(25, 'seconds'),
            MomentTrainingEnded: undefined,
            LastModifiedDate: lastModifiedDates[i],
            CreatedDate: createdDates[i],
            TrainGridRowCount: (turns ? turns.length : 0)
          }
        originalTrainingSummary = Object.create(currentTrainingSummary)
        isBranched = false

        helpers.ConLog(`EditTraining(${firstInput}, ${lastInput}, ${lastResponse})`, `ClickTraining for ${i} - ${turns[i]}, ${firstInputs[i]}, ${lastInputs[i]}, ${lastResponses[i]}`)
        trainDialogsGrid.ClickTraining(i)
        return
      }
    }
    throw `Can't Find Training to Edit. The grid should, but does not, contain a row with this data in it: FirstInput: ${firstInput} -- LastInput: ${lastInput} -- LastResponse: ${lastResponse}`
  })
}

export function TypeYourMessage(message) {
  editDialogModal.TypeYourMessage(message)
  cy.Enqueue(() => {
    if (!currentTrainingSummary.FirstInput) currentTrainingSummary.FirstInput = message
    currentTrainingSummary.LastInput = message
    currentTrainingSummary.Turns++
  })
}

// lastResponse parameter is optional. It is necessary only when there are $entities
// in the Action that produced the Bot's last response.
export function SelectAction(expectedResponse, lastResponse) {
  scorerModal.ClickAction(expectedResponse)
  cy.Enqueue(() => {
    if (lastResponse) currentTrainingSummary.LastResponse = lastResponse
    else currentTrainingSummary.LastResponse = expectedResponse
  })
}

export function SelectEndSessionAction(expectedData, lastResponse) {
  scorerModal.ClickEndSessionAction(expectedData);
  cy.Enqueue(() => {
    if (lastResponse) currentTrainingSummary.LastResponse = lastResponse;
    else currentTrainingSummary.LastResponse = 'EndSession: ' + expectedData;
  })
}

// This method is used to score AND AUTO-SELECT the action after branching.
export function ClickScoreActionsButton(lastResponse) {
  editDialogModal.ClickScoreActionsButton()
  cy.Enqueue(() => {
    currentTrainingSummary.LastResponse = lastResponse
  })
}

export function Save() {
  editDialogModal.ClickSaveCloseButton()
  trainDialogsGrid.VerifyPageTitle()
  cy.Enqueue(() => {
    // FUDGING on the time - adding 25 seconds because the time is set by the server
    // which is not exactly the same as our test machine.
    currentTrainingSummary.MomentTrainingEnded = Cypress.moment().add(25, 'seconds')

    if (isBranched) VerifyTrainingSummaryIsInGrid(originalTrainingSummary)

    VerifyTrainingSummaryIsInGrid(currentTrainingSummary)
  })
}

function VerifyTrainingSummaryIsInGrid(trainingSummary) {
  const funcName = 'VerifyTrainingSummaryIsInGrid'
  // Keep these lines of logging code in this method, they come in handy when things go bad.
  helpers.ConLog(funcName, `CreatedDate: ${trainingSummary.CreatedDate}`)
  helpers.ConLog(funcName, `LastModifiedDate: ${trainingSummary.LastModifiedDate}`)
  helpers.ConLog(funcName, `MomentTrainingStarted: ${trainingSummary.MomentTrainingStarted.format()}`)
  helpers.ConLog(funcName, `MomentTrainingEnded: ${trainingSummary.MomentTrainingEnded.format()}`)

  cy.Get('[data-testid="train-dialogs-turns"]', {timeout: 10000})
    .should(elements => { 
      if (elements.length != trainingSummary.TrainGridRowCount) { 
        helpers.ConLog(funcName, `Did NOT find the expected row count: ${elements.length}.`)
        throw new Error(`${elements.length} rows found in the training grid, however we were expecting ${trainingSummary.TrainGridRowCount}`)
      }

      helpers.ConLog(funcName, `Found the expected row count: ${elements.length}`)

      const turns = trainDialogsGrid.GetTurns()
      const firstInputs = trainDialogsGrid.GetFirstInputs()
      const lastInputs = trainDialogsGrid.GetLastInputs()
      const lastResponses = trainDialogsGrid.GetLastResponses()
      const lastModifiedDates = trainDialogsGrid.GetLastModifiedDates()
      const createdDates = trainDialogsGrid.GetCreatedDates()
  
      for (let i = 0; i < trainingSummary.TrainGridRowCount; i++) {
        // Keep these lines of logging code in this method, they come in handy when things go bad.
        helpers.ConLog(funcName, `CreatedDates[${i}]: ${createdDates[i]} --- ${helpers.Moment(createdDates[i]).isBetween(trainingSummary.MomentTrainingStarted, trainingSummary.MomentTrainingEnded)}`)
        helpers.ConLog(funcName, `LastModifiedDates[${i}]: ${lastModifiedDates[i]} --- ${helpers.Moment(lastModifiedDates[i]).isBetween(trainingSummary.MomentTrainingStarted, trainingSummary.MomentTrainingEnded)}`)
        helpers.ConLog(funcName, `Turns[${i}]: ${turns[i]}`)
  
        if (((trainingSummary.LastModifiedDate && lastModifiedDates[i] == trainingSummary.LastModifiedDate) ||
          helpers.Moment(lastModifiedDates[i]).isBetween(trainingSummary.MomentTrainingStarted, trainingSummary.MomentTrainingEnded)) &&
          turns[i] == trainingSummary.Turns &&
          ((trainingSummary.CreatedDate && createdDates[i] == trainingSummary.CreatedDate) ||
            helpers.Moment(createdDates[i]).isBetween(trainingSummary.MomentTrainingStarted, trainingSummary.MomentTrainingEnded)) &&
          firstInputs[i] == trainingSummary.FirstInput &&
          lastInputs[i] == trainingSummary.LastInput &&
          lastResponses[i] == trainingSummary.LastResponse)
          
          helpers.ConLog(funcName, 'Found all of the expected data. Validation PASSES!')

          return; // Fully VALIDATED! We found what we expected.
      }
      throw new Error(`The grid should, but does not, contain a row with this data in it: FirstInput: ${trainingSummary.FirstInput} -- LastInput: ${trainingSummary.LastInput} -- LastResponse: ${trainingSummary.LastResponse} -- Turns: ${trainingSummary.Turns} -- LastModifiedDate: ${trainingSummary.LastModifiedDate} -- CreatedDate: ${trainingSummary.CreatedDate}`)
    })
}

export function CaptureOriginalChatMessages() {
  cy.WaitForStableDOM().then(() => { originalChatMessages = editDialogModal.GetAllChatMessages() })
}

export function VerifyOriginalChatMessages() {
  VerifyAllChatMessages(() => { return originalChatMessages })
}

export function CaptureEditedChatMessages() {
  cy.WaitForStableDOM().then(() => { editedChatMessages = editDialogModal.GetAllChatMessages() })
}

export function VerifyEditedChatMessages() {
  VerifyAllChatMessages(() => { return editedChatMessages })
}

function VerifyAllChatMessages(functionGetChatMessagesToBeVerified) {
  cy.WaitForStableDOM().then(() => {
    let errorMessage = ''
    const chatMessagesToBeVerified = functionGetChatMessagesToBeVerified()
    const allChatMessages = editDialogModal.GetAllChatMessages()

    if (allChatMessages.length != chatMessagesToBeVerified.length)
      errorMessage += `Original chat message count was ${chatMessagesToBeVerified.length}, current chat message count is ${allChatMessages.length}.`

    const length = Math.max(allChatMessages.length, chatMessagesToBeVerified.length)
    for (let i = 0; i < length; i++) {
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

export function BranchChatTurn(originalMessage, newMessage, originalIndex = 0) {
  cy.Enqueue(() => {
    originalMessage = originalMessage.replace(/'/g, "’")

    editDialogModal.SelectChatTurnExactMatch(originalMessage, originalIndex)

    editDialogModal.VerifyBranchButtonIsInSameControlGroupAsMessage(originalMessage)

    // Capture the list of messages currently in the chat, truncate it at the point of branching, then add the new message to it.
    // This array will be used later to validate that the changed chat is persisted.
    let branchedChatMessages
    cy.WaitForStableDOM().then(() => {
      branchedChatMessages = editDialogModal.GetAllChatMessages()
      for (let i = 0; i < branchedChatMessages.length; i++) {
        if (branchedChatMessages[i] == originalMessage) {
          branchedChatMessages.length = i + 1
          branchedChatMessages[i] = newMessage
        }
      }
    })

    editDialogModal.BranchChatTurn(newMessage)
    isBranched = true
    originalTrainingSummary.TrainGridRowCount++
    currentTrainingSummary.TrainGridRowCount++

    VerifyAllChatMessages(() => { return branchedChatMessages })
  })
}

export function SelectAndVerifyEachChatTurn(index = 0) {
  if (index == 0) { 
    editDialogModal.CreateAliasForAllChatTurns() 
  }

  cy.Get('@allChatTurns').then(elements => {
    if (index < elements.length) {
      cy.wrap(elements[index]).Click().then(() => {
        editDialogModal.VerifyChatTurnControls(elements[index], index)
        SelectAndVerifyEachChatTurn(index + 1)
      })
    }
  })
}

export function AbandonDialog() {
  editDialogModal.ClickAbandonDeleteButton()
  editDialogModal.ClickConfirmAbandonDialogButton()
}

export function EditTrainingNEW(scenario, tags) {
  const funcName = `EditTrainingNEW(${scenario}, ${tags})`
  cy.Enqueue(() => {
    const tagsFromGrid = trainDialogsGrid.GetTags()
    const scenarios = trainDialogsGrid.GetDescription()

    helpers.ConLog(funcName, `Row Count: ${scenarios.length}`)

    for (let i = 0; i < scenarios.length; i++) {
      if (scenarios[i] === scenario && tagsFromGrid[i] == tags) {
        helpers.ConLog(funcName, `ClickTraining for row: ${i}`)
        trainDialogsGrid.ClickTraining(i)
        return
      }
    }
    throw `Can't Find Training to Edit. The grid should, but does not, contain a row with this data in it: scenario: '${scenario}' -- tags: ${tags}`
  })
}
