/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

import * as modelPage from './ModelPage'
import * as helpers from '../Helpers'

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

export function VerifyIncidentTriangleFoundInTrainDialogsGrid(firstInput, lastInput, lastResponse) {
  const funcName = `VerifyIncidentTriangleFoundInTrainDialogsGrid(${firstInput}, ${lastInput}, ${lastResponse})`
  cy.Enqueue(() => {
    const firstInputs = GetFirstInputs()
    const lastInputs = GetLastInputs()
    const lastResponses = GetLastResponses()

    helpers.ConLog(funcName, `Before Loop of ${firstInputs.length}, ${lastInputs[0]}, ${lastInputs[1]}, ${lastInputs[2]}`)

    for (let i = 0; i < firstInputs.length; i++) {
      if (firstInputs[i] == firstInput && lastInputs[i] == lastInput && lastResponses[i] == lastResponse) {
        helpers.ConLog(funcName, `Found it at Index: ${i} - ${firstInputs[i]}, ${lastInputs[i]}, ${lastResponses[i]}`)
        VerifyErrorIconForTrainGridRow(i)
        return
      }
    }
    throw new Error(`Can't Find Training to Verify it contains errors. The grid should, but does not, contain a row with this data in it: FirstInput: ${firstInput} -- LastInput: ${lastInput} -- LastResponse: ${lastResponse}`)
  })
}

export class tdGrid {
  constructor() {
  }

  static ExpectGridChange(expectedRowCount) {
    tdGrid.expectedRowCount = expectedRowCount
    tdGrid.isStable = false
    tdGrid.renderingShouldBeCompleteTime = new Date().getTime() + 1000
    setTimeout(() => MonitorGrid, 50) 
  }

  static MonitorGrid() {
    const funcName = 'tdGrid.MonitorGrid'
    if (modelPage.IsOverlaid()) {
      helpers.ConLog(funcName, 'Overlay found thus Train Dialog Grid is not stable yet')
      tdGrid.renderingShouldBeCompleteTime = new Date().getTime() + 1000
      setTimeout(() => MonitorGrid, 50)
      return
    }
    
    if (new Date().getTime() < renderingShouldBeCompleteTime) {
      helpers.ConLog(funcName, 'No Overlay this time, but we are still watching to make sure no overlay shows up for at least 1 second')
      setTimeout(() => MonitorGrid, 50)
      return
    }

    const elements = Cypress.$('[data-testid="train-dialogs-turns"]')
    if (elements.length != tdGrid.expectedRowCount) { 
      helpers.ConLog(funcName, `Expected Row Count: ${tdGrid.expectedRowCount} - Actual Row Count: ${elements.length}`)
      setTimeout(() => MonitorGrid, 50)
      return
    }

    helpers.ConLog(funcName, `Found the expected row count: ${elements.length}`)
    tdGrid.isStable = true
  }

  static GetTdGrid(expectedRowCount) {
    if (expectedRowCount != tdGrid.expectedRowCount) {
      // TODO: come up with a better more understandable message
      throw new Error(`tdGrid.GetTdGrid is not being used correctly. It was called with Expected Row Count: ${expectedRowCount}, but was tdGid.ExpectGridChange was called with Expected Row Count: ${tdGrid.expectedRowCount}`)
    }
    
    if (tdGrid.isStable) {
      return new tdGrid()
    }
    
    throw new Error(`Train Dialog Grid is not stable yet.`)
  }

  // Returns the index of the row that was found or undefined if not found
  FindGridRow(firstInput, lastInput, lastResponse){
    this.firstInputs = trainDialogsGrid.GetFirstInputs()
    this.lastInputs = trainDialogsGrid.GetLastInputs()
    this.lastResponses = trainDialogsGrid.GetLastResponses()

    if (this.expectedRowCount != this.firstInputs.length || this.expectedRowCount != this.lastInputs.length || this.expectedRowCount != this.lastResponses.length) {
      throw new Error(`Somethings wrong in this.FindGridRow - Expected Row Count: ${tdGrid.expectedRowCount} - other counts: ${this.firstInputs.length}, ${this.lastInputs.length}, ${this.lastResponses.length}`)
    }

    for (let i = 0; i < firstInputs.length; i++) {
      if (this.firstInputs[i] == firstInput && this.lastInputs[i] == lastInput && this.lastResponses[i] == lastResponse) {
        return i
      }
    }
    return undefined
  }
}

tdGrid.expectedRowCount = undefined
tdGrid.isStable = false
tdGrid.renderingShouldBeCompleteTime = undefined