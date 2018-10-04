/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

export function VerifyPageTitle(name)     { cy.Get('[data-testid="app-index-title"]').should(el => { expect(el).to.contain(name) })}

export function NavigateToHomepage()      { cy.Get('[data-testid="app-index-nav-link-home"]').Click() }
export function NavigateToEntities()      { cy.Get('[data-testid="app-index-nav-link-entities"]').Click() }
export function NavigateToActions()       { cy.Get('[data-testid="app-index-nav-link-actions"]').Click() }
export function NavigateToTrainDialogs()  { cy.Get('[data-testid="app-index-nav-link-train-dialogs"]').Click() }
export function NavigateToLogDialogs()    { cy.Get('[data-testid="app-index-nav-link-log-dialogs"]').Click() }