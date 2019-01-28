/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

export function VerifyPageTitle() { cy.Get('[data-testid="entities-title"]').contains('Entities').should('be.visible') }
export function ClickButtonNewEntity() { cy.Get('[data-testid="entities-button-create"]').Click() }
export function VerifyItemInList(name) { cy.Get('.ms-DetailsRow-cell').should('contain', name) }