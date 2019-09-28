/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

import * as modelPage from './ModelPage'
import * as helpers from '../Helpers'

export function VerifyPageTitle() { cy.Get('[data-testid="log-dialogs-title"]').contains('Log Dialogs').should('be.visible') }
export function CreateNewLogDialogButton() { cy.Get('[data-testid="log-dialogs-new-button"]').Click() }
export function VerifyNewLogDialogButtonIsDisabled() { cy.Get('[data-testid="log-dialogs-new-button"]').should('be.disabled') }
export function VerifyNewLogDialogButtonIsEnabled() { cy.Get('[data-testid="log-dialogs-new-button"]').should('be.enabled') }
export function ClickRefreshButton() { cy.Get('[data-testid="logdialogs-button-refresh"]').Click() }
export function Edit(userInputs) { cy.Get('[data-testid="log-dialogs-description"]').ExactMatch(userInputs).Click() }

export function GetUserInputs() { return helpers.StringArrayFromElementText('[data-testid="log-dialogs-description"]') }
export function GetTurnCounts() { return helpers.StringArrayFromElementText('[data-testid="log-dialogs-turns"]') }

export function WaitForLogDialoGridUpdateToComplete(expectedLogDialogCount) {
  const funcName = 'WaitForLogDialoGridUpdateToComplete'
  cy.log(funcName, expectedLogDialogCount)
  
  cy.WaitForStableDOM()
  
  let renderingShouldBeCompleteTime = new Date().getTime()
  cy.Get('[data-testid="log-dialogs-turns"]', {timeout: 10000})
    .should(elements => { 
      if (modelPage.IsOverlaid()) {
        helpers.ConLog(funcName, 'modalPage.IsOverlaid')
        renderingShouldBeCompleteTime = new Date().getTime() + 1000
        throw new Error('Overlay found thus Train Dialog Grid is not stable...retry until it is')
      } else if (new Date().getTime() < renderingShouldBeCompleteTime) {
        helpers.ConLog(funcName, 'Wait for no overlays for at least 1 second')
        throw new Error(`Waiting till no overlays show up for at least 1 second...retry '${funcName}'`)
      }

      if (elements.length != expectedLogDialogCount) { 
        const errorMessage = `${elements.length} rows found in the training grid, however we were expecting ${expectedLogDialogCount}`
        helpers.ConLog(funcName, errorMessage)
        throw new Error(errorMessage)
      }

      helpers.ConLog(funcName, `Found the expected row count: ${elements.length}`)
    })
}

export function VerifyListOfLogDialogs(expectedLogDialogs) {
  WaitForLogDialoGridUpdateToComplete(expectedLogDialogs.length)

  const funcName = 'VerifyListOfLogDialogs'
  cy.log(funcName, expectedLogDialogs)
  cy.Enqueue(() => {
    // This data comes from the grid.
    const userInputs = GetUserInputs()
    const turnCounts = GetTurnCounts()

    let errors = false
    expectedLogDialogs.forEach(logDialog => {
      helpers.ConLog(funcName, `Find - "${logDialog.userInputs}", "${logDialog.turnCount}"`)
      let found = false
      for (let i = 0; i < userInputs.length; i++) {
        if (userInputs[i] == logDialog.userInputs && turnCounts[i] == logDialog.turnCount) {
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


