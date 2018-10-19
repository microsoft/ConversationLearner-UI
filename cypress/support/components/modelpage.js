/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

const entitiesPage = require('../../support/components/EntitiesPage')
const actionsGrid  = require('../../support/components/ActionsGrid')
const trainDialogPage = require('../../support/components/TrainDialogsPage')
const logDialogPage = require('../../support/components/logdialogspage')
 
//export function WaitForTrainingStatusCompleted()  { cy.Contains('.cl-training-status__icon-row--success', 'Completed', {timeout: 120000})}

export function VerifyModelName(name)     { cy.Get('[data-testid="app-index-model-name"]').should(el => { expect(el).to.contain(name) })}
export function VerifyPageTitle()         { cy.Get('[data-testid="dashboard-title"]').contains('Log Dialogs') }

export function NavigateToHome()          { cy.Get('[data-testid="app-index-nav-link-home"]').Click();          VerifyPageTitle() }
export function NavigateToEntities()      { cy.Get('[data-testid="app-index-nav-link-entities"]').Click();      entitiesPage.VerifyPageTitle() }
export function NavigateToActions()       { cy.Get('[data-testid="app-index-nav-link-actions"]').Click();       actionsGrid.VerifyPageTitle() }
export function NavigateToTrainDialogs()  { cy.Get('[data-testid="app-index-nav-link-train-dialogs"]').Click(); trainDialogPage.VerifyPageTitle() }
export function NavigateToLogDialogs()    { cy.Get('[data-testid="app-index-nav-link-log-dialogs"]').Click();   logDialogPage.VerifyPageTitle() }

// To test this code search src/action/appActions.ts for these and alter them:
//   fetchApplicationTrainingStatusThunkAsync
//   interval:
//   maxDuration:
var canRefreshTrainingStatusTime = 0
export function WaitForTrainingStatusCompleted()  
{
  var currentHtml = Cypress.$('html')[0].outerHTML
  var currentTime = new Date().getTime()
  if (currentHtml.includes('data-testid="training-status-polling-stopped-warning"') &&
     (currentTime > canRefreshTrainingStatusTime))
  {    
    canRefreshTrainingStatusTime = currentTime + (2 * 1000)
    cy.get('[data-testid="training-status-refresh-button"]').click()
  
    // The reason we need to call this method once again using cy.WaitForTrainingStatusCompleted()
    // is because the .click() function causes the time out to change to a default of 4 seconds
    cy.WaitForTrainingStatusCompleted()
  }
  expect(currentHtml.includes('data-testid="training-status-completed"')).to.equal(true)
}