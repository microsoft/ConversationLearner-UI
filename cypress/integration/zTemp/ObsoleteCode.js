/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

import * as trainDialogsGrid from '../../support/components/TrainDialogsGrid'

// This came from train.js prior to 11/5/2019
// It is being saved because we may want to reinstate validation of training times, 
// but on the above date it was removed.
// NOTE that these values had been set at the appropriate time like this:
//  MomentTrainingStarted = Cypress.moment().subtract(25, 'seconds')
//  MomentTrainingEnded = Cypress.moment().add(25, 'seconds')
function VerifyTrainingSummaryIsInGrid(trainingSummary) {
  const funcName = 'VerifyTrainingSummaryIsInGrid'
  // Keep these lines of logging code in this method, they come in handy when things go bad.
  helpers.ConLog(funcName, `FirstInput: ${trainingSummary.FirstInput}`)
  helpers.ConLog(funcName, `LastInput: ${trainingSummary.LastInput}`)
  helpers.ConLog(funcName, `LastResponse: ${trainingSummary.LastResponse}`)
  helpers.ConLog(funcName, `CreatedDate: ${trainingSummary.CreatedDate}`)
  helpers.ConLog(funcName, `LastModifiedDate: ${trainingSummary.LastModifiedDate}`)
  helpers.ConLog(funcName, `MomentTrainingStarted: ${trainingSummary.MomentTrainingStarted.format()}`)
  helpers.ConLog(funcName, `MomentTrainingEnded: ${trainingSummary.MomentTrainingEnded.format()}`)

  let tdGrid
  cy.wrap(1, {timeout: 60000}).should(() => {
    tdGrid = trainDialogsGrid.TdGrid.GetTdGrid(trainingSummary.TrainGridRowCount)
  }).then(() => {
    let iRow = tdGrid.FindGridRowByChatInputs(trainingSummary.FirstInput, trainingSummary.LastInput, trainingSummary.LastResponse)
    if (iRow >= 0) {
      const turns = trainDialogsGrid.GetTurns()
      const lastModifiedDates = trainDialogsGrid.GetLastModifiedDates()
      const createdDates = trainDialogsGrid.GetCreatedDates()
      
      // Keep these lines of logging code in this method, they come in handy when things go bad.
      helpers.ConLog(funcName, `CreatedDates[${iRow}]: ${createdDates[iRow]} --- ${helpers.Moment(createdDates[iRow]).isBetween(trainingSummary.MomentTrainingStarted, trainingSummary.MomentTrainingEnded)}`)
      helpers.ConLog(funcName, `LastModifiedDates[${iRow}]: ${lastModifiedDates[iRow]} --- ${helpers.Moment(lastModifiedDates[iRow]).isBetween(trainingSummary.MomentTrainingStarted, trainingSummary.MomentTrainingEnded)}`)
      helpers.ConLog(funcName, `Turns[${iRow}]: ${turns[iRow]}`)

      if (((trainingSummary.LastModifiedDate && lastModifiedDates[iRow] == trainingSummary.LastModifiedDate) ||
          helpers.Moment(lastModifiedDates[iRow]).isBetween(trainingSummary.MomentTrainingStarted, trainingSummary.MomentTrainingEnded)) &&
          turns[iRow] == trainingSummary.Turns &&
          ((trainingSummary.CreatedDate && createdDates[iRow] == trainingSummary.CreatedDate) ||
            helpers.Moment(createdDates[iRow]).isBetween(trainingSummary.MomentTrainingStarted, trainingSummary.MomentTrainingEnded))) {

        helpers.ConLog(funcName, 'Found all of the expected data. Validation PASSES!')
        return // Fully VALIDATED! We found what we expected.
      }
    }
    throw new Error(`The grid should, but does not, contain a row with this data in it: FirstInput: ${trainingSummary.FirstInput} -- LastInput: ${trainingSummary.LastInput} -- LastResponse: ${trainingSummary.LastResponse} -- Turns: ${trainingSummary.Turns} -- LastModifiedDate: ${trainingSummary.LastModifiedDate} -- CreatedDate: ${trainingSummary.CreatedDate}`)
  })
}
