/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

export function ClickAddInitialValueButton(entityName)      { cy.Get('[data-testid="teach-session-add-initial-value"]').contains(entityName).Click() }
export function VerifyEntityValue(expectedValue)            { cy.Get('[data-testid="teach-session-entity-name"]').contains(expectedValue) }
export function TypeInitialValue(entityName, initialValue)  { cy.Get('[data-testid="teach-session-initial-value"]').contains(entityName).type(`${initialValue}{enter}`) }
export function ClickDeleteButton(entityName)               { cy.Get('[data-testid="teach-session-delete-button"]').contains(entityName).Click() }

export function ClickOkButton()                             { cy.Get('[data-testid="teach-session-ok-button"]').Click() }
export function ClickCancelButton()                         { cy.Get('[data-testid="teach-session-cancel-button"]').Click() }