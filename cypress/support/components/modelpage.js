/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

export function verifyPageTitle(modelName) { cy.Get('[data-testid="app-index-title"]').should(el => { expect(el).to.contain(modelName) })}

export function navigateToHomepage()      { cy.Get('[data-testid="app-index-nav-link-home"]').Click() }
export function navigateToEntities()      { cy.Get('[data-testid="app-index-nav-link-entities"]').Click() }
export function navigateToActions()       { cy.Get('[data-testid="app-index-nav-link-actions"]').Click() }
export function navigateToTrainDialogs()  { cy.Get('[data-testid="app-index-nav-link-train-dialogs"]').Click() }
export function navigateToLogDialogs()    { cy.get('[data-testid="app-index-nav-link-log-dialogs"]').Click() }