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
  LastModified: undefined,
  Created: undefined,
}

export var trainingSummary = newTrainingSummary
export var trainGridRowCount = 0

export function CreateNewTrainDialog()
{
  var firstInputs = trainDialogsGrid.GetFirstInput()
  trainGridRowCount = firstInputs.length
  
  trainDialogsGrid.CreateNewTrainDialog()
  trainingSummary = newTrainingSummary
}

export function TypeYourMessage(message)
{
  editDialogModal.TypeYourMessage(message)
  if (!trainingSummary.FirstInput) trainingSummary.FirstInput = message
  trainingSummary.LastInput = message
  trainingSummary.Turns++
}

export function SelectAnAction(expectedResponse, lastResponse)
{
  scorerModal.ClickAction(expectedResponse)
  
  if (lastResponse) trainingSummary.LastResponse = lastResponse
  else trainingSummary.LastResponse = expectedResponse // NOTE: This is ONLY correct if the response contains no entities that have been replaced.
}

export function Save()
{
  editDialogModal.ClickSaveButton()
  trainingSummary.Created = trainingSummary.LastModified = Today()
  trainDialogsGrid.VerifyPageTitle()
  VerifyTrainingSummaryIsInGrid()
}

export function VerifyTrainingSummaryIsInGrid()
{
  var firstInputs = trainDialogsGrid.GetFirstInput()
  var lastInputs = trainDialogsGrid.GetLastInput()
  var lastResponse = trainDialogsGrid.GetLastResponse()
  var turns = trainDialogsGrid.GetTurns()
  var LastModified = trainDialogsGrid.GetLastModified()
  var created = trainDialogsGrid.GetCreated()


}