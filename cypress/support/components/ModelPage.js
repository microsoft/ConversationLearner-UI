/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

import * as homePage from '../../support/components/HomePage'
import * as entitiesGrid from '../../support/components/EntitiesGrid'
import * as actionsGrid from '../../support/components/ActionsGrid'
import * as trainDialogsGrid from './TrainDialogsGrid'
import * as logDialogsGrid from '../../support/components/LogDialogsGrid'
import * as settings from '../../support/components/Settings'
import * as helpers from '../Helpers'

export function VerifyModelName(name) { cy.Get('[data-testid="app-index-model-name"]').contains(name) }
export function VerifyPageTitle() { cy.Get('[data-testid="dashboard-title"]').contains('Overview').should('be.visible') }
export function IsOverlaid() { return Cypress.$('div.ms-Modal > div.ms-Overlay').length > 0 }

export function NavigateToHome() { cy.Get('[data-testid="app-index-nav-link-home"]').Click(); VerifyPageTitle() }
export function NavigateToEntities() { cy.Get('[data-testid="app-index-nav-link-entities"]').Click(); entitiesGrid.VerifyPageTitle() }
export function NavigateToActions() { cy.Get('[data-testid="app-index-nav-link-actions"]').Click(); actionsGrid.VerifyPageTitle() }
export function NavigateToTrainDialogs() { cy.Get('[data-testid="app-index-nav-link-train-dialogs"]').Click(); trainDialogsGrid.VerifyPageTitle() }
export function NavigateToLogDialogs() { cy.Get('[data-testid="app-index-nav-link-log-dialogs"]').Click(); logDialogsGrid.VerifyPageTitle() }
export function NavigateToSettings() { cy.Get('[data-testid="app-index-nav-link-settings"]').Click(); settings.VerifyPageTitle() }
export function NavigateToMyModels() { cy.Get('[data-testid="app-index-nav-link-my-models"]').Click(); homePage.VerifyPageTitle() }

export function VerifyHomeLinkShowsIncidentTriangle() { cy.Get('[data-testid="app-index-nav-link-home"]').find('i[data-icon-name="IncidentTriangle"]') }
export function VerifyHomeLinkDoesNotShowIncidentTriangle() { cy.Get('[data-testid="app-index-nav-link-home"]').DoesNotContain('i[data-icon-name="IncidentTriangle"]') }

// These really should be in a file named '.\cypress\support\components\HomePanel.js' but it would be the only code in it
// so rather than create a 2 line .js file, we are putting them here.
export function HomePanel_VerifyErrorMessage(expectedMessage) { cy.Get('div.cl-errorpanel > div').ExactMatch(expectedMessage) }

// To validate that this code works, search src\actions\appActions.ts for these and alter them:
//   fetchApplicationTrainingStatusThunkAsync
//   interval:
//   maxDuration:
export class TrainingStatus {
  constructor() {
    this.canRefreshTrainingStatusTime = 0
    this.lastTrainingStatusElements = undefined
    
    const trainingStatusElements = Cypress.$('[data-testid^="training-status-"]')
    if (Cypress.$(trainingStatusElements).find('[data-testid="training-status-completed"]').length > 0) {
      this.waitForTrainingStatusNotCompleteTime = new Date().getTime() + 4000
    }
    this.DumpIfChanged(trainingStatusElements)
  }
  
  DumpIfChanged(trainingStatusElements) {
    let changed = false
    if (!this.lastTrainingStatusElements || trainingStatusElements.length != this.lastTrainingStatusElements.length) {
      changed = true
    } else {
      for (let i = 0; i < trainingStatusElements.length; i++) {
        if (trainingStatusElements[i].outerHTML != this.lastTrainingStatusElements[i].outerHTML) {
          changed = true
          break
        }
      }
    }
    
    if (changed) {
      for (let i = 0; i < trainingStatusElements.length; i++) {
        helpers.ConLog('TrainingStatus.DumpIfChanged', trainingStatusElements[i].outerHTML)
      }
      this.lastTrainingStatusElements = trainingStatusElements
    }
  }

  WaitForCompleted() {
    const trainingStatusElements = Cypress.$('[data-testid^="training-status-"]')
    const currentTime = new Date().getTime()
    
    this.DumpIfChanged(trainingStatusElements)

    const completed = Cypress.$(trainingStatusElements).find('[data-testid="training-status-completed"]').length > 0
    if (completed) {
      if (currentTime > this.waitForTrainingStatusNotCompleteTime) {
        helpers.ConLog('TrainingStatus.WaitForCompleted', 'Training Status IS COMPLETED!')
        return
      }
      throw new Error('Retry - Waiting for Training Status to become queued or running before we accept complete for the status')
    }
    this.waitForTrainingStatusNotCompleteTime = 0

    const pollingStoppedWarning = Cypress.$(trainingStatusElements).find('[data-testid="training-status-polling-stopped-warning"]').length > 0
    const failed = Cypress.$(trainingStatusElements).find('[data-testid="training-status-failed"]').length > 0

    if ((pollingStoppedWarning || failed) && (currentTime > canRefreshTrainingStatusTime)) {
      canRefreshTrainingStatusTime = currentTime + 2000

      helpers.ConLog('TrainingStatus.WaitForCompleted', 'Click the Refresh Button...')

      // When we get here it is possible there are two refresh buttons on the page, one that
      // is covered up by a popup dialog, so we need to click on the last one found.
      const elements = Cypress.$(trainingStatusElements).find('[data-testid="training-status-refresh-button"]')
      Cypress.$(elements[elements.length - 1]).click()
    }
    throw new Error('Retry - Training Status is NOT yet complete')
  }
}

export function VerifyNoIncidentTriangleOnPage() { VerifyErrorIcon(false) }

// Verify for just the Left Pane "Train Dialogs" link.
export function VerifyIncidentTriangleForTrainDialogs() { VerifyErrorIcon(true) }

function VerifyErrorIcon(errorIconExpected)
{
  let funcName = `VerifyErrorIcon(${errorIconExpected})`

  cy.WaitForStableDOM()
  cy.wrap({ countFound: -1, timesInARowAtThisCount: 0 }, { timeout: 10000 }).should(retryInfo => {
    const elements = Cypress.$('i[data-icon-name="IncidentTriangle"].cl-color-error')
    if(elements.length === retryInfo.countFound) { retryInfo.timesInARowAtThisCount ++ }
    else {
      // The count changed since the last time we looked at this.
      retryInfo.countFound = elements.length
      retryInfo.timesInARowAtThisCount = 0
    }

    helpers.ConLog(funcName, `Number of Incident Triangles found on page: ${retryInfo.countFound} - Number of times in a row it was found: ${retryInfo.timesInARowAtThisCount}`)
    if(retryInfo.timesInARowAtThisCount < 15) {
      throw new Error(`${retryInfo.timesInARowAtThisCount} times in a row we have seen ${retryInfo.countFound} incident triangles on the page, need to see it there 15 times before we can trust it won't change again.`)
    }
    
    // At this point we know that we have seen the same number of incident triangles many times in a row.
    // Now we need to verify that it is in the state we expect, and if this next part fails, it will retry
    // up to the time out setting to see if it changes to what we expect.

    if(!errorIconExpected) {
      if(elements.length > 0) {
        throw new Error(`Expected to find no Incident Triangles on the page, yet ${elements.length} were found`)
      }
    } else {
      const parents = Cypress.$(elements).parents('[data-testid="app-index-nav-link-train-dialogs"]')
      helpers.ConLog(funcName, `Found ${parents.length} parents`)
      if (parents.length !== 1) {
        throw new Error('Expected to find an Incident Triangle for Train Dialogs, but did not.')
      }
    }
  })
}