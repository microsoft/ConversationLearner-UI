/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

const entitiesPage = require('../../support/components/EntitiesPage')
const actionsPage = require('../../support/components/ActionsPage')
const trainDialogPage = require('../../support/components/TrainDialogsPage')
const logDialogPage = require('../../support/components/logdialogspage')
 
export function WaitForTrainingStatusCompleted()  { cy.Contains('.cl-training-status__icon-row--success', 'Completed', {timeout: 120000})}

export function VerifyModelName(name)     { cy.Get('[data-testid="app-index-model-name"]').should(el => { expect(el).to.contain(name) })}
export function VerifyPageTitle()         { cy.Get('[data-testid="dashboard-title"]').contains('Log Dialogs') }

export function NavigateToHome()          { cy.Get('[data-testid="app-index-nav-link-home"]').Click();          VerifyPageTitle() }
export function NavigateToEntities()      { cy.Get('[data-testid="app-index-nav-link-entities"]').Click();      entitiesPage.VerifyPageTitle() }
export function NavigateToActions()       { cy.Get('[data-testid="app-index-nav-link-actions"]').Click();       actionsPage.VerifyPageTitle() }
export function NavigateToTrainDialogs()  { cy.Get('[data-testid="app-index-nav-link-train-dialogs"]').Click(); trainDialogPage.VerifyPageTitle() }
export function NavigateToLogDialogs()    { cy.Get('[data-testid="app-index-nav-link-log-dialogs"]').Click();   logDialogPage.VerifyPageTitle() }