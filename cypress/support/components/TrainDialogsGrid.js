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
export function GetDescriptions() { return helpers.StringArrayFromElementText('[data-testid="train-dialogs-description"]') }

export function VerifyErrorIconForTrainGridRow(rowIndex) { cy.Get(`div.ms-List-cell[data-list-index="${rowIndex}"]`).find('[data-testid="train-dialogs-validity-indicator"]') }

export function VerifyDescriptionForRow(row, description) { cy.Get(`div[data-item-index=${row}][data-automationid="DetailsRow"]`).find('span[data-testid="train-dialogs-description"]').contains(description) }

// The purpose of the TdGrid class is to find a specific row in the Train Dialog Grid and to wait till the 
// Train Dialog Grid is ready before attempting to perform the find operation.
export class TdGrid {
// Public:
  // 1) Start here, do not call the constructor. This will construct an instance for you AFTER this class has determined
  //    that the Train Dialog Grid is ready and done rendering.
  //
  // RETURNS: an instance of TdGrid. 
  //
  // This is intended to be used from a cy.something().should(()=>{tdGridObj = TdGrid.GetTdGrid()})
  // .then(() =>{use the returned object to call one of the FindGridRow* functions or properties of the grid rows})
  //
  // This was designed to be retried. It will throw an error until we can validate that the Train Dialog Grid is stable
  // and then it will return a TdGrid object. (refer to existing code for usage examples)
  //
  // If you do not know what the "expectedRowCount" should be, pass in -1...but if you do that this will not wait for
  // the row count to be right. Either the UI or the logs will tell you what this value should be, you can always
  // change it later. It is best if you pass in a value that is >= 0 since it is one more signal that the UI is ready
  // for the next step. This feature was included to allow tests that already existed before this class was created to
  // pass un-modified. If any of test starts failing related to timing of the grid rendering, then fix them to include 
  // the actual row count.
  static GetTdGrid(expectedRowCount) {
    const funcName = `TdGrid.GetTdGrid(${expectedRowCount})`
    try {
      if (!TdGrid.monitorIsActivated) {
        helpers.ConLog(funcName, 'Activate the Monitor')
        TdGrid.expectedRowCount = expectedRowCount
        TdGrid.isStable = false
        TdGrid.noMoreOverlaysExpectedTime = new Date().getTime()
        TdGrid.monitorIsActivated = true
        TdGrid.MonitorGrid()
      } else if (expectedRowCount != TdGrid.expectedRowCount) {
        throw new Error(`The monitor is active, but the expected row count (${TdGrid.expectedRowCount}) it is looking for is different than this request ${expectedRowCount}`)
      }
      
      if (TdGrid.isStable) {
        helpers.ConLog(funcName, 'The Train Dialog Grid IS STABLE!')
        TdGrid.monitorIsActivated = false
        return new TdGrid()
      }
    } 
    catch (error) {
      helpers.ConLog(funcName, `Caught Errors: ${error.message}`)
    }
    
    helpers.ConLog(funcName, 'Failed attempt, the Train Dialog Grid is not stable yet.')
    throw new Error(`Train Dialog Grid is not stable yet.`)
  }

  // 2) this should be called from an object returned from TdGrid.GetTdGrid
  // Returns the index of the row that was found or -1 if not found
  FindGridRowByChatInputs(firstInput, lastInput, lastResponse){
    const funcName = `TdGrid.FindGridRowByChatInputs("${firstInput}", "${lastInput}", "${lastResponse}")`
    helpers.ConLog(funcName, this.feedback)

    if (this.expectedRowCount >= 0 && (this.expectedRowCount != this.firstInputs.length || this.expectedRowCount != this.lastInputs.length || this.expectedRowCount != this.lastResponses.length)) {
      throw new Error(`Somethings wrong in TdGrid.FindGridRowByChatInputs - ${this.feedback}`)
    }

    for (let i = 0; i < this.firstInputs.length; i++) {
      if (this.firstInputs[i] == firstInput && this.lastInputs[i] == lastInput && this.lastResponses[i] == lastResponse) {
        helpers.ConLog(funcName, `Found on row ${i}`)
        return i
      }
    }
    
    helpers.ConLog(funcName, 'Not Found')
    return -1
  }

  // 2) this should be called from an object returned from TdGrid.GetTdGrid
  // Returns the index of the row that was found or -1 if not found
  // You may provide both description and tags or just one of them.
  FindGridRowByDescriptionAndOrTags(description, tags){
    const funcName = `TdGrid.FindGridRowByDescriptionAndOrTags("${description}", "${tags}")`
    helpers.ConLog(funcName, this.feedback)

    if (this.expectedRowCount >= 0 && ((description && this.expectedRowCount != this.desciptions.length) || (tags && this.expectedRowCount != this.tags.length))) {
      throw new Error(`Somethings wrong in TdGrid.FindGridRowByDescriptionAndOrTags - ${this.feedback}`)
    }
    
    const length = description ? this.descriptions.length : (tags ? this.tags : undefined)
    for (let i = 0; i < length; i++) {
      if ((!description || this.descriptions[i] === description) && (!tags || this.tags[i] == tags)) {
        helpers.ConLog(funcName, `Found on row ${i}`)
        return i
      }
    }
    
    helpers.ConLog(funcName, 'Not Found')
    return -1
  }

  get firstInputs() { 
    if (!this._firstInputs) { 
      this._firstInputs = GetFirstInputs()
      this.feedback += ` - Length First Inputs: ${this._firstInputs.length}`
    } 
    return this._firstInputs
  }

  get lastInputs() { 
    if (!this._lastInputs) { 
      this._lastInputs = GetLastInputs()
      this.feedback += ` - Length Last Inputs: ${this._lastInputs.length}`
    } 
    return this._lastInputs
  }

  get lastResponses() { 
    if (!this._lastResponses) { 
      this._lastResponses = GetLastResponses()
      this.feedback += ` - Length Last Responses: ${this._lastResponses.length}`
    } 
    return this._lastResponses
  }

  get descriptions() { 
    if (!this._descriptions) { 
      this._descriptions = GetDescriptions()
      this.feedback += ` - Length Descriptions: ${this._descriptions.length}`
    } 
    return this._descriptions
  }

  get tags() { 
    if (!this._tags) { 
      this._tags = GetTags()
      this.feedback += ` - Length Tags: ${this._tags.length}`
    }
    return this._tags
  }

// Private:
  // You should not be calling this directly unless you really know what you are doing.
  constructor() {
    this._firstInputs = undefined
    this._lastInputs = undefined
    this._lastResponses = undefined
    this._descriptions = undefined
    this._tags = undefined

    this.expectedRowCount = TdGrid.expectedRowCount
    this.feedback = `Expected Row Count: ${TdGrid.expectedRowCount}`
    helpers.ConLog('TdGrid.constructor()', this.feedback)
  }

  // You should not be calling this directly unless you really know what you are doing.
  // This monitors the grid looking for it to stabilize.
  // If it is not stable it will use setTimeout to retry by calling itself again ~50ms later.
  static MonitorGrid() {
    const funcName = 'TdGrid.MonitorGrid'
    if (modelPage.IsOverlaid()) {
      helpers.ConLog(funcName, 'Overlay found thus Train Dialog Grid is not stable yet')
      TdGrid.noMoreOverlaysExpectedTime = new Date().getTime() + 1000
      setTimeout(TdGrid.MonitorGrid, 50)
      return
    }
    
    if (new Date().getTime() < TdGrid.noMoreOverlaysExpectedTime) {
      helpers.ConLog(funcName, 'No Overlay this time, but we are still watching to make sure no other overlay shows up for at least 1 second')
      setTimeout(TdGrid.MonitorGrid, 50)
      return
    }

    const elements = Cypress.$('[data-testid="train-dialogs-turns"]')
    const rowCountsMessage = `Expected Row Count: ${TdGrid.expectedRowCount} - Actual Row Count: ${elements.length}`

    if (this.expectedRowCount >= 0 && elements.length != TdGrid.expectedRowCount) { 
      helpers.ConLog(funcName, rowCountsMessage)
      setTimeout(TdGrid.MonitorGrid, 50)
      return
    }

    helpers.ConLog(funcName, `Train Dialog Grid is Stable - Monitoring is complete - ${rowCountsMessage}`)
    TdGrid.isStable = true
    // Do NOT reset this - TdGrid.monitorIsActivated = false
    // Once GetTdGrid also detects stability, this will be reset to false.
  }
}
// Define and Initialize Static Member data for the TdGrid class
TdGrid.expectedRowCount = undefined
TdGrid.isStable = false
TdGrid.monitorIsActivated = false
TdGrid.noMoreOverlaysExpectedTime = undefined


export function VerifyIncidentTriangleFoundInTrainDialogsGrid(firstInput, lastInput, lastResponse, expectedRowCount = -1) {
  const funcName = `VerifyIncidentTriangleFoundInTrainDialogsGrid(${firstInput}, ${lastInput}, ${lastResponse})`
  helpers.ConLog(funcName, 'Start')

  let tdGrid
  cy.wrap(1).should(() => {
    tdGrid = TdGrid.GetTdGrid(expectedRowCount)
  }).then(() => {
    let iRow = tdGrid.FindGridRowByChatInputs(firstInput, lastInput, lastResponse)
    if (iRow >= 0) { 
      VerifyErrorIconForTrainGridRow(iRow)
      return
    }
    throw new Error(`Can't Find Training to Verify it contains errors. The grid should, but does not, contain a row with this data in it: FirstInput: ${firstInput} -- LastInput: ${lastInput} -- LastResponse: ${lastResponse}`)
  })
}

export function VerifyListOfTrainDialogs(expectedTrainDialogs) {
  const expectedRowCount = expectedTrainDialogs.length
  helpers.ConLog(`VerifyListOfTrainDialogs(expectedRowCount: ${expectedRowCount})`, 'Start')
  cy.log('Verify List of Train Dialogs', expectedRowCount)

  let tdGrid
  cy.wrap(1).should(() => {
    tdGrid = TdGrid.GetTdGrid(expectedRowCount)
  }).then(() => {
    let errors = false
    expectedTrainDialogs.forEach(trainDialog => {
      let iRow = tdGrid.FindGridRowByChatInputs(trainDialog.firstInput, trainDialog.lastInput, trainDialog.lastResponse)
      if (iRow < 0) { errors = true }
    })
  
    if (errors) {
      throw new Error('Did not find 1 or more of the expected Train Dialogs in the grid. Refer to the log file for details.')
    }
  })
}

export function GetAllTrainDialogGridRows(expectedRowCount = undefined) { 
  helpers.ConLog('GetAllTrainDialogGridRows', 'start')

  let tdGrid
  cy.wrap(1).should(() => {
    tdGrid = TdGrid.GetTdGrid(expectedRowCount)
  }).then(() => {
    const firstInputs = GetFirstInputs()
    const lastInputs = GetLastInputs()
    const lastResponses = GetLastResponses()

    let allRowData = []

    for (let i = 0; i < firstInputs.length; i++) {
      allRowData.push({
        firstInput: firstInputs[i],
        lastInput: lastInputs[i],
        lastResponse: lastResponses[i],
      })

      helpers.ConLog('GetAllTrainDialogGridRows', `${allRowData.firstInput}, ${allRowData.lastInput}, ${allRowData.lastResponse}`)
    }
    
    return allRowData
  })
}

