/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

const entitiesGrid = require('../../support/components/EntitiesGrid')
const actionsGrid  = require('../../support/components/ActionsGrid')
const trainDialogsGrid = require('./TrainDialogsGrid')
const logDialogsGrid = require('../../support/components/LogDialogsGrid')
 
export function VerifyModelName(name)     { cy.Get('[data-testid="app-index-model-name"]').should(el => { expect(el).to.contain(name) })}
export function VerifyPageTitle()         { cy.Get('[data-testid="dashboard-title"]').contains('Log Dialogs').should('be.visible') }

export function NavigateToHome()          { cy.Get('[data-testid="app-index-nav-link-home"]').Click();          VerifyPageTitle() }
export function NavigateToEntities()      { cy.Get('[data-testid="app-index-nav-link-entities"]').Click();      entitiesGrid.VerifyPageTitle() }
export function NavigateToActions()       { cy.Get('[data-testid="app-index-nav-link-actions"]').Click();       actionsGrid.VerifyPageTitle() }
export function NavigateToTrainDialogs()  { cy.Get('[data-testid="app-index-nav-link-train-dialogs"]').Click(); trainDialogsGrid.VerifyPageTitle() }
export function NavigateToLogDialogs()    { cy.Get('[data-testid="app-index-nav-link-log-dialogs"]').Click();   logDialogsGrid.VerifyPageTitle() }

// To validate that this code works, search src/action/appActions.ts for these and alter them:
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