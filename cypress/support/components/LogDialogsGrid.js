/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

export function VerifyPageTitle()           { cy.Get('[data-testid="log-dialogs-title"]').contains('Log Dialogs') }
export function CreateNewLogDialogButton()  { cy.Get('[data-testid="log-dialogs-new-button"]').Click() }
