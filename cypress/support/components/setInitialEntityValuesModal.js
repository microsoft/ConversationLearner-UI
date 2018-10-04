/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

export function clickAddInitialValueButton(entityName)      { cy.Get('[data-testid="teach-session-add-initial-value"]').contains(entityName).Click() }
export function verifyEntityValue(expectedValue)            { cy.Get('[data-testid="teach-session-entity-name"]').contains(expectedValue) }
export function typeInitialValue(entityName, initialValue)  { cy.Get('[data-testid="teach-session-initial-value"]').contains(entityName).type(`${initialValue}{enter}`) }
export function clickDeleteButton(entityName)               { cy.Get('[data-testid="teach-session-delete-button"]').contains(entityName).Click() }

export function clickOkButton()                             { cy.Get('[data-testid="teach-session-ok-button"]').Click() }
export function clickCancelButton()                         { cy.Get('[data-testid="teach-session-cancel-button"]').Click() }