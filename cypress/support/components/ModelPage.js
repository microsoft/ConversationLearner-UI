/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

const entitiesGrid = require('../../support/components/EntitiesGrid')
const actionsGrid = require('../../support/components/ActionsGrid')
const trainDialogsGrid = require('./TrainDialogsGrid')
const logDialogsGrid = require('../../support/components/LogDialogsGrid')
const settings = require('../../support/components/Settings')
const helpers = require('../Helpers')

export function VerifyModelName(name) { cy.Get('[data-testid="app-index-model-name"]').should(el => { expect(el).to.contain(name) }) }
export function VerifyPageTitle() { cy.Get('[data-testid="dashboard-title"]').contains('Log Dialogs').should('be.visible') }

export function NavigateToHome() { cy.Get('[data-testid="app-index-nav-link-home"]').Click(); VerifyPageTitle() }
export function NavigateToEntities() { cy.Get('[data-testid="app-index-nav-link-entities"]').Click(); entitiesGrid.VerifyPageTitle() }
export function NavigateToActions() { cy.Get('[data-testid="app-index-nav-link-actions"]').Click(); actionsGrid.VerifyPageTitle() }
export function NavigateToTrainDialogs() { cy.Get('[data-testid="app-index-nav-link-train-dialogs"]').Click(); trainDialogsGrid.VerifyPageTitle() }
export function NavigateToLogDialogs() { cy.Get('[data-testid="app-index-nav-link-log-dialogs"]').Click(); logDialogsGrid.VerifyPageTitle() }
export function NavigateToSettings() { cy.Get('[data-testid="app-index-nav-link-settings"]').Click(); settings.VerifyPageTitle() }
export function VerifyNoErrorIconOnPage() { cy.DoesNotContain('i[data-icon-name="IncidentTriangle"].cl-color-error') }

// For the Left Pane "Train Dialogs" link.
export function VerifyErrorIconForTrainDialogs() { cy.Get('[data-testid="app-index-nav-link-train-dialogs"]').find('i[data-icon-name="IncidentTriangle"].cl-color-error') }

// To validate that this code works, search src\actions\appActions.ts for these and alter them:
//   fetchApplicationTrainingStatusThunkAsync
//   interval:
//   maxDuration:
let canRefreshTrainingStatusTime = 0
export function WaitForTrainingStatusCompleted() {
  let currentHtml = Cypress.$('html')[0].outerHTML
  let currentTime = new Date().getTime()
  if ((currentHtml.includes('data-testid="training-status-polling-stopped-warning"') ||
      currentHtml.includes('data-testid="training-status-failed"')) &&
      (currentTime > canRefreshTrainingStatusTime)) {
        
    // TODO: Remove this block of code after we have proof this function is working.
    if (currentHtml.includes('data-testid="training-status-failed"')) {
      helpers.ConLog('WaitForTrainingStatusCompleted', 'detected data-testid="training-status-failed"')
    }

    canRefreshTrainingStatusTime = currentTime + (2 * 1000)

    // When we get here it is possible there are two refresh buttons on the page, one that
    // is covered up by a popup dialog, so we need to click on the last one found.
    let elements = Cypress.$('[data-testid="training-status-refresh-button"]')
    Cypress.$(elements[elements.length - 1]).click()
  }
  expect(currentHtml.includes('data-testid="training-status-completed"')).to.be.true
}