/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

import * as modelPage from './ModelPage'
import * as helpers from '../Helpers'
import { func } from 'prop-types'

// Path to product code: ConversationLearner-UI\src\routes\Apps\App\TrainDialogs.tsx
export function VerifyPageTitle() { 
  cy.Get('[data-testid="train-dialogs-title"]').contains('Train Dialogs')
  cy.Enqueue(() => {
    if (modelPage.IsOverlaid()) {
      helpers.ConLog('VerifyPageTitle', 'modelPage.IsOverlaid')
      throw new Error('Expecting to find the Train Dialog Grid but there is an overlay on top of it.')
    }
  })
}

export function IsVisible() { return Cypress.$(`[data-testid="train-dialogs-title"]:contains('Train Dialogs'):visible`).length === 1 && !modelPage.IsOverlaid() }

export function ClickNewTrainDialogButton() { cy.Get('[data-testid="button-new-train-dialog"]').Click() }
export function VerifyNewTrainDialogButtonIsDisabled() { cy.Get('[data-testid="button-new-train-dialog"]').should('be.disabled') }
export function VerifyNewTrainDialogButtonIsEnabled() { cy.Get('[data-testid="button-new-train-dialog"]').should('be.enabled') }
export function SearchBox() { cy.Get('label[for="traindialogs-input-search"]').contains('input.ms-SearchBox-field') }
export function EntityDropDownFilter() { cy.Get('[data-testid="dropdown-filter-by-entity"]') }
export function ActionDropDownFilter() { cy.Get('[data-testid="dropdown-filter-by-action"]') }
export function ClickTraining(row) { cy.Get('[data-testid="train-dialogs-description"]').then(elements => { cy.wrap(elements[row]).Click({force: true}) }) }

// TODO: Rework this as well
// TODO: Rework this as well
// TODO: Rework this as well
export function WaitForGridReadyThen(expectedRowCount, functionToRunAfterGridIsReady) {
  cy.Get('[data-testid="train-dialogs-turns"]', { timeout: 10000 })
    .should(elements => { expect(elements).to.have.length(expectedRowCount) })
    .then(() => { functionToRunAfterGridIsReady() })
}

// These functions circumvent the Cypress retry logic by using jQuery
export function GetFirstInputs() { return helpers.StringArrayFromElementText('[data-testid="train-dialogs-first-input"]') }
export function GetLastInputs() { return helpers.StringArrayFromElementText('[data-testid="train-dialogs-last-input"]') }
export function GetLastResponses() { return helpers.StringArrayFromElementText('[data-testid="train-dialogs-last-response"]') }
export function GetTurns() { return helpers.NumericArrayFromElementText('[data-testid="train-dialogs-turns"]') }
export function GetLastModifiedDates() { return helpers.StringArrayFromElementText('[data-testid="train-dialogs-last-modified"]') }
export function GetCreatedDates() { return helpers.StringArrayFromElementText('[data-testid="train-dialogs-created"]') }

export function GetTags() { return helpers.StringArrayFromElementText('[data-testid="train-dialogs-tags"]') }
export function GetDescription() { return helpers.StringArrayFromElementText('[data-testid="train-dialogs-description"]') }

export function VerifyErrorIconForTrainGridRow(rowIndex) { cy.Get(`div.ms-List-cell[data-list-index="${rowIndex}"]`).find('[data-testid="train-dialogs-validity-indicator"]') }

export function VerifyDescriptionForRow(row, description) { cy.Get(`div[data-item-index=${row}][data-automationid="DetailsRow"]`).find('span[data-testid="train-dialogs-description"]').contains(description) }

export class TdGrid {
  // 1) Start here. This is intended to be used from a cy.something().should(()=>{tdGridObj = tdGrid.GetTdGrid()})
  // .then(() =>{use the returned object to call FindGridRow})
  //
  // This was designed to be retried. It will throw an error until it we can validate that the Train Dialog Grid is stable
  // and then it will return a tdGrid object. (refer to existing code for usage examples)
  static GetTdGrid(expectedRowCount) {
    try {
      if (!TdGrid.monitorIsActivated) {
        helpers.ConLog(`GetTdGrid(${expectedRowCount})`, 'Start')
        TdGrid.expectedRowCount = expectedRowCount
        TdGrid.isStable = false
        TdGrid.renderingShouldBeCompleteTime = new Date().getTime()
        TdGrid.monitorIsActivated = true
        TdGrid.MonitorGrid()
      } else if (expectedRowCount != TdGrid.expectedRowCount) {
        throw new Error(`The monitor is active, but the expected row count (${TdGrid.expectedRowCount}) it is looking for is different than this request ${expectedRowCount}`)
      }
      
      if (TdGrid.isStable) {
        return new TdGrid()
      }
    } 
    catch (error) {
      helpers.ConLog(`GetTdGrid(${expectedRowCount})`, `Caught Errors: ${error.message}`)
    }
    
    throw new Error(`Train Dialog Grid is not stable yet.`)
  }

  // 2) this should be called from an object returned from tdGrid.GetTdGrid
  // Returns the index of the row that was found or -1 if not found
  FindGridRow(firstInput, lastInput, lastResponse){
    helpers.ConLog(`tdGrid.FindGridRow("${firstInput}", "${lastInput}", "${lastResponse}")`, this.feedback)

    if (this.expectedRowCount >= 0 && (this.expectedRowCount != this.firstInputs.length || this.expectedRowCount != this.lastInputs.length || this.expectedRowCount != this.lastResponses.length)) {
      throw new Error(`Somethings wrong in tdGrid.FindGridRow - ${this.feedback}`)
    }

    for (let i = 0; i < this.firstInputs.length; i++) {
      if (this.firstInputs[i] == firstInput && this.lastInputs[i] == lastInput && this.lastResponses[i] == lastResponse) {
        helpers.ConLog('tdGrid.FindGridRow', `Found on row ${i}`)
        return i
      }
    }
    
    helpers.ConLog('tdGrid.FindGridRow', 'Not Found')
    return -1
  }

  // You should not be calling this directly unless you really know what you are doing.
  constructor() {
    this.expectedRowCount = TdGrid.expectedRowCount
    this.firstInputs = GetFirstInputs()
    this.lastInputs = GetLastInputs()
    this.lastResponses = GetLastResponses()
    this.feedback = `Expected Row Count: ${TdGrid.expectedRowCount} - Current Row Counts: ${this.firstInputs.length}, ${this.lastInputs.length}, ${this.lastResponses.length}`
    helpers.ConLog('tdGrid.constructor()', this.feedback)
  }

  // You should not be calling this directly unless you really know what you are doing.
  // This monitors the grid looking for it to stabilize.
  static MonitorGrid() {
    const funcName = 'tdGrid.MonitorGrid'
    if (modelPage.IsOverlaid()) {
      helpers.ConLog(funcName, 'Overlay found thus Train Dialog Grid is not stable yet')
      TdGrid.renderingShouldBeCompleteTime = new Date().getTime() + 1000
      setTimeout(() => TdGrid.MonitorGrid, 50)
      return
    }
    
    if (new Date().getTime() < TdGrid.renderingShouldBeCompleteTime) {
      helpers.ConLog(funcName, 'No Overlay this time, but we are still watching to make sure no overlay shows up for at least 1 second')
      setTimeout(() => TdGrid.MonitorGrid, 50)
      return
    }

    const elements = Cypress.$('[data-testid="train-dialogs-turns"]')
    if (this.expectedRowCount >= 0 && elements.length != TdGrid.expectedRowCount) { 
      helpers.ConLog(funcName, `Expected Row Count: ${TdGrid.expectedRowCount} - Actual Row Count: ${elements.length}`)
      setTimeout(() => TdGrid.MonitorGrid, 50)
      return
    }

    helpers.ConLog(funcName, `Found the expected row count: ${elements.length}`)
    TdGrid.isStable = true
    TdGrid.monitorIsActivated = false
  }
}

TdGrid.expectedRowCount = undefined
TdGrid.isStable = false
TdGrid.monitorIsActivated = false
TdGrid.renderingShouldBeCompleteTime = undefined


export function VerifyIncidentTriangleFoundInTrainDialogsGrid(expectedRowCount, firstInput, lastInput, lastResponse) {
  const funcName = `VerifyIncidentTriangleFoundInTrainDialogsGrid(${firstInput}, ${lastInput}, ${lastResponse})`
  helpers.ConLog(funcName, 'Start')

  let tdGrid
  cy.wrap(1).should(() => {
    tdGrid = TdGrid.GetTdGrid(expectedRowCount)
  }).then(() => {
    let iRow = tdGrid.FindGridRow(firstInput, lastInput, lastResponse)
    if (iRow >= 0) { 
      VerifyErrorIconForTrainGridRow(iRow)
      return
    }
    throw new Error(`Can't Find Training to Verify it contains errors. The grid should, but does not, contain a row with this data in it: FirstInput: ${firstInput} -- LastInput: ${lastInput} -- LastResponse: ${lastResponse}`)
  })
}
