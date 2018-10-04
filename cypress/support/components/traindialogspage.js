/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

// Path to product code: ConversationLearner-UI\src\routes\Apps\App\TrainDialogs.tsx
export function verifyPageTitle()       { cy.Get('div[data-testid="train-dialogs-title"]').contains('Train Dialogs') }
export function createNewTrainDialog()  { cy.Get('[data-testid="button-new-train-dialog"]').Click() }
export function firstInput()            { cy.Get('[data-testid="train-dialogs-first-input"]')}
export function lastInput()             { cy.Get('[data-testid="train-dialogs-last-input"]')}
export function turns()                 { cy.Get('[data-testid="train-dialogs-turns"]')}
export function lastModified()          { cy.Get('[data-testid="train-dialogs-last-modified"]')}
export function created()               { cy.Get('[data-testid="train-dialogs-created"]')}
export function searchBox()             { cy.Get('label[for="traindialogs-input-search"]').contains('input.ms-SearchBox-field') }
export function entityDropDownFilter()  { cy.Get('[data-testid="dropdown-filter-by-entity"]')}
export function actionDropDownFilter()  { cy.Get('[data-testid="dropdown-filter-by-action"]')}