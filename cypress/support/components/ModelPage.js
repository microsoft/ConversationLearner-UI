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

// To validate that this code works, search src\actions\appActions.ts for these and alter them:
//   fetchApplicationTrainingStatusThunkAsync
//   interval:
//   maxDuration:
export class TrainingStatus {
// PUBLIC:  
  constructor() {
    this.canRefreshTrainingStatusTime = 0
    this.trainingStatusElements = []
    this.trainingStatusHtml = ''
    this.queued = false
    this.running = false
    this.pollingStoppedWarning = false
    this.failed = false
    this.completed = false
    this.currentStatus = "unknown"
    
    this._GetTrainingStatus()

    if (this.completed) {
      // This is most likely due to the previous training. So we need to wait until we see a different
      // status, most likely queued or running, before we can accept a completed status, however
      // 4 seconds is the longest we will wait for that before we call it complete.
      this.waitForTrainingStatusQueuedOrRunningTime = new Date().getTime() + 4000
    } else {
      this.waitForTrainingStatusQueuedOrRunningTime = 0
    }
  }
  
  WaitForCompleted() { this._RetryWaitForRunning() }

// PRIVATE:
  // Wait retry loop for any state other than running. 
  // This loop can wait as long as 5 minutes.
  _RetryWaitForRunning() {
    cy.log('Training Status is NOT Running - Waiting for it Start Running')
    cy.wrap(1, { timeout: 5 * 60 * 1000 }).should(() => {
      if (this._MonitorTrainingStatus()) { 
        return // Because the status is now complete!
      }

      if (!this.running) { 
        throw new Error(`Stauts is ${this.currentStatus} - Still Waiting for Status == Running or Completed`) 
      }

      // The status is now Running so we need to wait a different 
      // amount of time for it to complete running.
      this._RetryWaitForCompleted()
    })
  }

  // Wait retry loop while in the running state. 
  // This loop can wait as long as 40 seconds.
  _RetryWaitForCompleted() {
    cy.log('Training Status is Running - Waiting for it to Complete')
    cy.wrap(1, { timeout: 40 * 1000 }).should(() => {
      if (this._MonitorTrainingStatus()) { 
        return // Because the status is now complete!
      }
      
      if (this.running) { 
        throw new Error(`Stauts is ${this.currentStatus} - Still Waiting for Status == Completed`)
      }

      // The status is no longer Running so we need to wait a different 
      // amount of time for it to start running again.
      this._RetryWaitForRunning()
    })
  }

  _GetTrainingStatus() {
    const funcName = '_GetTrainingStatus'
    const priorTrainingStatusElementsLength = this.trainingStatusElements.length
    const priorTraingStatusHtml = this.trainingStatusHtml

    // Get the Training Status Elements from the DOM
    this.trainingStatusElements = Cypress.$('[data-testid^="training-status-"]')
    
    // Turn the elements into a text string that can be searched and dumped to the log.
    this.trainingStatusHtml = ''
    for (let i = 0; i < this.trainingStatusElements.length; i++) {
      this.trainingStatusHtml += '\n' + this.trainingStatusElements[i].outerHTML
    }

    // Determine if anything changed.
    let changed = this.trainingStatusElements.length != priorTrainingStatusElementsLength || 
                  this.trainingStatusHtml.length != priorTraingStatusHtml.length || 
                  this.trainingStatusHtml != priorTraingStatusHtml

    if (changed) {
      helpers.ConLog(funcName, `Number of Training Status Elements Found: ${this.trainingStatusElements.length} - Elements: ${this.trainingStatusHtml}`)
      
      this.queued = this._TrainingStatusContains('queued')
      this.running = this._TrainingStatusContains('running')
      this.pollingStoppedWarning = this._TrainingStatusContains('polling-stopped-warning')
      this.failed = this._TrainingStatusContains('failed')
      this.completed = this._TrainingStatusContains('completed')
    }
  }

  _TrainingStatusContains(target) { 
    const returnValue = this.trainingStatusHtml.includes(`data-testid="training-status-${target}`)
    helpers.ConLog('_TrainingStatusContains', `'${target}': ${returnValue}`)
    if (returnValue) { this.currentStatus = target }
    return returnValue
  }

  _MonitorTrainingStatus() {
    const funcName = 'TrainingStatus._MonitorTrainingStatus'
    this._GetTrainingStatus()
    const currentTime = new Date().getTime()

    if (this.completed) {
      if (currentTime > this.waitForTrainingStatusQueuedOrRunningTime) {
        helpers.ConLog(funcName, 'Training Status IS COMPLETED!')
        return true
      }
      helpers.ConLog(funcName, 'Waiting to see queued or running before we can accept the current completed status')
      return false
    }
    this.waitForTrainingStatusQueuedOrRunningTime = 0

    if ((this.pollingStoppedWarning || this.failed) && (currentTime > this.canRefreshTrainingStatusTime)) {
      // Setting this allows the UI to do some work and change the status before we click the 
      // refresh button again too soon.
      this.canRefreshTrainingStatusTime = currentTime + 2000

      helpers.ConLog(funcName, 'Click the Refresh Button...')

      // When we get here it is possible there are two refresh buttons on the page, one that
      // is covered up by a popup dialog, so we need to click on the last one found.
      const elements = Cypress.$('button[data-testid="training-status-refresh-button"]')
      Cypress.$(elements[elements.length - 1]).click()
    }
    
    return false
  }
}


// Verify for just the Left Pane "Train Dialogs" link.
export function VerifyNoErrorTriangleOnPage() { VerifyIncidentIcon(false, 'cl-color-error') }
export function VerifyErrorTriangleForTrainDialogs() { VerifyIncidentIcon(true, 'cl-color-error') }
export function VerifyNoWarningTriangleOnPage() { VerifyIncidentIcon(false, 'cl-color-warning') }
export function VerifyWarningTriangleForTrainDialogs() { VerifyIncidentIcon(true, 'cl-color-warning') }

function VerifyIncidentIcon(errorIconExpected, colorClassSelector)
{
  let funcName = `VerifyErrorIcon(${errorIconExpected})`

  cy.WaitForStableDOM()
  cy.wrap({ countFound: -1, timesInARowAtThisCount: 0 }, { timeout: 10000 }).should(retryInfo => {
    const elements = Cypress.$(`i[data-icon-name="IncidentTriangle"].${colorClassSelector}`)
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
