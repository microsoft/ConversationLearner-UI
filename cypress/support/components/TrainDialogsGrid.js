/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

import * as helpers from '../Helpers'

// Path to product code: ConversationLearner-UI\src\routes\Apps\App\TrainDialogs.tsx
export function VerifyPageTitle() { cy.Get('[data-testid="train-dialogs-title"]').contains('Train Dialogs').should('be.visible') }
export function CreateNewTrainDialog() { cy.Get('[data-testid="button-new-train-dialog"]').Click() }
export function SearchBox() { cy.Get('label[for="traindialogs-input-search"]').contains('input.ms-SearchBox-field') }
export function EntityDropDownFilter() { cy.Get('[data-testid="dropdown-filter-by-entity"]') }
export function ActionDropDownFilter() { cy.Get('[data-testid="dropdown-filter-by-action"]') }
export function ClickTraining(row) { cy.Get('[data-testid="train-dialogs-description"]').then(elements => { cy.wrap(elements[row]).Click() }) }

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