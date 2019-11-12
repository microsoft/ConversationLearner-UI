/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

import * as helpers from '../Helpers'

// There is a test case that can help to test and debug this code.
//    test case: Tools/TrainingStatus.spec.js
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
      this.confirmedCompleted = false
      this.currentStatus = "unknown"
      this.startTime = new Date().getTime()

      this._GetTrainingStatus()
  
      if (this.completed) {
        // This is most likely due to the previous training. So we need to wait until we see a different
        // status, most likely queued or running, before we can accept a completed status, however
        // 4 seconds is the longest we will wait for that before we call it complete.
        this.waitForTrainingStatusQueuedOrRunningTime = this.startTime + 4000
      } else {
        this.waitForTrainingStatusQueuedOrRunningTime = 0
      }
    }
    
    WaitForCompleted() { this._RetryWaitForRunning() }
  
  // PRIVATE:
    // Wait retry loop while in any state except running (usually Queued state). 
    // This loop can wait as long as 5 minutes.
    _RetryWaitForRunning() {
      const startTime = new Date().getTime()
      cy.log('Training Status is NOT Running - Waiting for it to Start Running')
      cy.wrap(1, { timeout: 5 * 60 * 1000 }).should(() => {

        if (this._EvaluateTrainingStatus()) { 
          return // Because the status is now complete!
        }
  
        if (!this.running) {
          const currentTime = new Date().getTime()
          const totalWaitTime = Math.floor((currentTime - this.startTime) / 1000)
          const queuedWaitTime = Math.floor((currentTime - startTime) / 1000)
          throw new Error(`Stauts is ${this.currentStatus} - Still Waiting for Status == Running or Completed - Queued Wait Time: ${queuedWaitTime} - Total Wait Time: ${totalWaitTime}`)
        }
  
        // The status is now Running so we need to wait a different 
        // amount of time for it to complete running.
        this._RetryWaitForCompleted()
      })
    }
  
    // Wait retry loop while in the running state. 
    // This loop can wait as long as 2 minutes.
    _RetryWaitForCompleted() {
      const startTime = new Date().getTime()
      cy.log('Training Status is Running - Waiting for it to Complete')
      cy.wrap(1, { timeout: 2 * 60 * 1000 }).should(() => {
        if (this._EvaluateTrainingStatus()) { 
          return // Because the status is now complete!
        }
        
        if (this.running) {
          const currentTime = new Date().getTime()
          const totalWaitTime = Math.floor((currentTime - this.startTime) / 1000)
          const runningWaitTime = Math.floor((currentTime - startTime) / 1000)
          throw new Error(`Stauts is ${this.currentStatus} - Still Waiting for Status == Completed - Running Wait Time: ${runningWaitTime} - Total Wait Time: ${totalWaitTime}`)
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
  
    // Returns true when the training status is complete
    _EvaluateTrainingStatus() {
      if (this.confirmedCompleted) { return true }

      const funcName = 'TrainingStatus._MonitorTrainingStatus'
      this._GetTrainingStatus()
      const currentTime = new Date().getTime()
  
      if (this.completed) {
        if (currentTime > this.waitForTrainingStatusQueuedOrRunningTime) {
          helpers.ConLog(funcName, `Training Status IS COMPLETED! - Total wait time: ${Math.floor((currentTime - this.startTime) / 1000)} seconds`)
          this.confirmedCompleted = true
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
  