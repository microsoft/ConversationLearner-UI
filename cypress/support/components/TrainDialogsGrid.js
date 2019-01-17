/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

const helpers = require('../Helpers')

// Path to product code: ConversationLearner-UI\src\routes\Apps\App\TrainDialogs.tsx
export function VerifyPageTitle()                 { cy.get('[data-testid="train-dialogs-title"]').contains('Train Dialogs').should('be.visible') }
export function CreateNewTrainDialog()            { cy.get('[data-testid="button-new-train-dialog"]').Click()}
export function SearchBox()                       { cy.get('label[for="traindialogs-input-search"]').contains('input.ms-SearchBox-field') }
export function EntityDropDownFilter()            { cy.get('[data-testid="dropdown-filter-by-entity"]')}
export function ActionDropDownFilter()            { cy.get('[data-testid="dropdown-filter-by-action"]')}
export function ClickTraining(row)                { cy.get('[data-testid="train-dialogs-first-input"]').then(elements => { cy.wrap(elements[row]).Click() })}

export function WaitForGridReadyThen(expectedRowCount, functionToRunAfterGridIsReady)  
{ 
  cy.get('[data-testid="train-dialogs-turns"]')
    .should(elements => { expect(elements).to.have.length(expectedRowCount) })
    .then(() => { functionToRunAfterGridIsReady() }) 
}

// These functions circumvent the Cypress retry logic by using jQuery
export function GetFirstInputs()                  { return helpers.StringArrayFromInnerHtml('[data-testid="train-dialogs-first-input"]')}
export function GetLastInputs()                   { return helpers.StringArrayFromInnerHtml('[data-testid="train-dialogs-last-input"]')}
export function GetLastResponses()                { return helpers.StringArrayFromInnerHtml('[data-testid="train-dialogs-last-response"]')}
export function GetTurns()                        { return helpers.NumericArrayFromInnerHtml('[data-testid="train-dialogs-turns"]') }
export function GetLastModifiedDates()            { return helpers.StringArrayFromInnerHtml('[data-testid="train-dialogs-last-modified"]')}
export function GetCreatedDates()                 { return helpers.StringArrayFromInnerHtml('[data-testid="train-dialogs-created"]')}

export function VerifyErrorIconForTrainGridRow(rowIndex) { cy.get(`div.ms-List-cell[data-list-index="${rowIndex}"]`).find('i[data-icon-name="IncidentTriangle"].cl-color-error') }