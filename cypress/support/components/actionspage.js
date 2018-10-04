/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

export function ClickNewAction()        { cy.Get('[data-testid="actions-button-create"]').Click() }
export function VerifyItemInList(name)  { cy.Get('.ms-DetailsRow-cell').should('contain', name) }
