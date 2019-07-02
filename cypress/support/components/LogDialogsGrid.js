/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

import * as helpers from '../Helpers'

export function VerifyPageTitle() { cy.Get('[data-testid="log-dialogs-title"]').contains('Log Dialogs').should('be.visible') }
export function CreateNewLogDialogButton() { cy.Get('[data-testid="log-dialogs-new-button"]').Click() }
export function VerifyNewLogDialogButtonIsDisabled() { cy.Get('[data-testid="log-dialogs-new-button"]').should('be.disabled') }
export function VerifyNewLogDialogButtonIsEnabled() { cy.Get('[data-testid="log-dialogs-new-button"]').should('be.enabled') }

export function GetUserInputs() { return helpers.StringArrayFromElementText('[data-testid="log-dialogs-description"]') }
export function GetTurnCounts() { return helpers.StringArrayFromElementText('[data-testid="log-dialogs-turns"]') }

export function VerifyListOfLogDialogs(expectedLogDialogs) {
  const funcName = 'VerifyListOfLogDialogs'
  cy.log('Verify List of Log Dialogs', expectedLogDialogs)
  cy.Enqueue(() => {
    const userInputs = GetUserInputs()
    const turnCounts = GetTurnCounts()

    let errors = false
    expectedLogDialogs.forEach(logDialog => {
      helpers.ConLog(funcName, `Find - "${logDialog.userInputs}", "${logDialog.turnCount}"`)
      let found = false
      for (let i = 0; i < userInputs.length; i++) {
        if (userInputs[i] == logDialog.userInput && turnCounts[i] == logDialog.turnCount) {
          found = true
          helpers.ConLog(funcName, `Found on row ${i}`)
          break;
        }
      }
      
      if (!found) {
        helpers.ConLog(funcName, 'ERROR - NOT Found')
        errors = true
      }
    })
    
    if (errors) {
      throw new Error('Did not find 1 or more of the expected Log Dialogs in the grid. Refer to the log file for details.')
    }
    
    if (userInputs.length > expectedLogDialogs.length) {
      throw new Error(`Found all of the expected Train Dialogs, however there are an additional ${userInputs.length - expectedLogDialogs.length} Log Dialogs in the grid that we were not expecting. Refer to the log file for details.`)
    }
  })
}
