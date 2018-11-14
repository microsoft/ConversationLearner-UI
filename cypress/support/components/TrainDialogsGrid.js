/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

const helpers = require('../Helpers')

// Path to product code: ConversationLearner-UI\src\routes\Apps\App\TrainDialogs.tsx
export function VerifyPageTitle()                 { cy.Get('[data-testid="train-dialogs-title"]').contains('Train Dialogs') }
export function CreateNewTrainDialog()            { cy.Get('[data-testid="button-new-train-dialog"]').Click()}
export function SearchBox()                       { cy.Get('label[for="traindialogs-input-search"]').contains('input.ms-SearchBox-field') }
export function EntityDropDownFilter()            { cy.Get('[data-testid="dropdown-filter-by-entity"]')}
export function ActionDropDownFilter()            { cy.Get('[data-testid="dropdown-filter-by-action"]')}
export function ClickTraining(row)                { cy.Get('[data-testid="train-dialogs-first-input"]').then(elements => { cy.wrap(elements[row]).Click() })}

export function WaitForGridReadyThen(functionToRunAfterGridIsReady)  
{ 
  cy.Get('[data-testid="train-dialogs-turns"]')
    .should(elements => { expect(elements).to.have.length(window.expectedTrainGridRowCount)})
    .then(() => { functionToRunAfterGridIsReady() }) 
}

// These functions circumvent the Cypress retry logic by using jQuery
export function GetFirstInputs()                  { return helpers.StringArrayFromInnerHtml('[data-testid="train-dialogs-first-input"]')}
export function GetLastInputs()                   { return helpers.StringArrayFromInnerHtml('[data-testid="train-dialogs-last-input"]')}
export function GetLastResponses()                { return helpers.StringArrayFromInnerHtml('[data-testid="train-dialogs-last-response"]')}
export function GetTurns()                        { return helpers.NumericArrayFromInnerHtml('[data-testid="train-dialogs-turns"]') }
export function GetLastModifiedDates()            { return helpers.StringArrayFromInnerHtml('[data-testid="train-dialogs-last-modified"]')}
export function GetCreatedDates()                 { return helpers.StringArrayFromInnerHtml('[data-testid="train-dialogs-created"]')}

