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
function setPhrase(actionPhrase) {
  cy.get('div[data-slate-editor="true"]')
    .type(actionPhrase);
}

function clickWaitForResponse() {
  cy.get('.ms-Checkbox-text')
    .click({force: true});
}

/** Click on create action button */
function clickCreateButton() {
  cy.get('[data-testid="actioncreator-button-create"]')
    .click({force: true});
}

export { clickWaitForResponse, selectTypeText, setPhrase, clickCreateButton };