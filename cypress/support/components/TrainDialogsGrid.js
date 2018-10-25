/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

// Path to product code: ConversationLearner-UI\src\routes\Apps\App\TrainDialogs.tsx
export function VerifyPageTitle()                 { cy.Get('[data-testid="train-dialogs-title"]').contains('Train Dialogs') }
export function CreateNewTrainDialog()            { cy.Get('[data-testid="button-new-train-dialog"]').Click() }
export function FirstInput()                      { cy.Get('[data-testid="train-dialogs-first-input"]')}
export function LastInput()                       { cy.Get('[data-testid="train-dialogs-last-input"]')}
export function Turns()                           { cy.Get('[data-testid="train-dialogs-turns"]')}
export function LastModified()                    { cy.Get('[data-testid="train-dialogs-last-modified"]')}
export function Created()                         { cy.Get('[data-testid="train-dialogs-created"]')}
export function SearchBox()                       { cy.Get('label[for="traindialogs-input-search"]').contains('input.ms-SearchBox-field') }
export function EntityDropDownFilter()            { cy.Get('[data-testid="dropdown-filter-by-entity"]')}
export function ActionDropDownFilter()            { cy.Get('[data-testid="dropdown-filter-by-action"]')}