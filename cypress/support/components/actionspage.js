/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

/** Navigate to Actions Page */
function NavigateTo() {
  cy.get('a[href$="/actions"]')
    .click();
}
/** Click on create a new action button */
function CreateNew() {
  cy
    .get('[data-testid="actions-button-create"]')
    .click();
}
/** Selects Action Type = Text */
function SelectTypeText() {
  cy.get('[data-testid="dropdown-action-type"]')
    .click()
    .click();
  // TODO: implement a more robust way to select an specific action type.
}
/** Enter action response phrase */
function SetPhrase(actionPhrase) {
  cy.get('div[data-slate-editor="true"]')
    .type(actionPhrase);
}
/** Click on create action button */
function Save() {
  cy.get('[data-testid="actioncreator-button-create"]')
    .click();
}

export {NavigateTo, CreateNew, SelectTypeText, SetPhrase, Save};