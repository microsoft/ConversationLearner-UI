/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
export function verifyPageTitle() { cy.Get('div[data-testid="train-dialogs-title"]').contains('Train Dialogs') }

export function createNew()       { cy.get('[data-testid="button-new-train-dialog"]').Click() }

