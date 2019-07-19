/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

export function VerifyPageTitle() { cy.Get('[data-testid="settings-delete-model-title"]').contains('Deletion is irreversible.').should('be.visible') }
export function ClickExportButton() { cy.Get('[data-testid="model-creator-submit-button"]').Click() }
export function TypeModelNameToDelete(modelName) { cy.Get('[data-testid="user-input-modal-new-message-input"]').type(`${modelName}{enter}`) }
