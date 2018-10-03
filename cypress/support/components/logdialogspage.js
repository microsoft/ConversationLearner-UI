/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

export function verifyPageTitle() { cy.Get('div[data-testid="logdialogs-title"]').contains('Log Dialogs') }
export function createNew() { cy.Get('[data-testid="logdialogs-button-create"]').Click() }
