/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

/** Selects Action Type = Text */
function selectTypeText() {
  cy.get('[data-testid="dropdown-action-type"]')
    .click()
    .click();
  // TODO: implement a more robust way to select an specific action type.
}
/** Enter action response phrase */
function setPhrase(actionPhrase: string) {
  cy.get('div[data-slate-editor="true"]')
    .type(actionPhrase);
}
/** Click on create action button */
function save() {
  cy.get('[data-testid="actioncreator-button-create"]')
    .click();
}

export { selectTypeText, setPhrase, save };