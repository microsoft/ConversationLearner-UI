/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

import * as helpers from '../../support/Helpers'

export function VerifyPageTitle() { cy.Get('[data-testid="merge-modal-title"]').contains('Merge?').should('be.visible') }
export function IsVisible() { return Cypress.$(`[data-testid="merge-modal-title"]:contains('Merge?'):visible`).length === 1 }

export function ClickSaveAsButton() { cy.Get('[data-testid="merge-modal-save-as-is-button"]').Click() }
export function ClickMergeButton() { cy.Get('[data-testid="merge-modal-merge-button"]').Click() }