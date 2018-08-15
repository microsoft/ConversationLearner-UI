/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/
export function clickNewAction() {
  cy.get('[data-testid="actions-button-create"]')
    .click()
}

export function verifyItemInList(name) {
  cy.get('.ms-DetailsRow-cell')
      .should('contain', name)
}
