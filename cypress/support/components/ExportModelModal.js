/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

export function VerifyPageTitle() { cy.Get('[data-testid="export-choice-title"]').contains('Export Model').should('be.visible') }
export function ClickExportButton() { cy.Get('[data-testid="model-creator-submit-button"]').Click() }
export function ClickCancelButton() { cy.Get('[data-testid="model-creator-cancel-button"]').Click() }

