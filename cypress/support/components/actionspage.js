/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

export function VerifyPageTitle()       { cy.Get('[data-testid="create-an-action-title"]').contains('Create an Action') }
export function ClickNewAction()        { cy.Get('[data-testid="actions-button-create"]').Click() }
//What List? What Item? export function VerifyItemInList(name)  { cy.Get('.ms-DetailsRow-cell').should('contain', name) }

export function SelectTypeText() {
  cy.Get('[data-testid="dropdown-action-type"]')
    .should("be.visible")
    .Click()
    .Click()
}

export function TypeResponse(textToType) {
  cy.Get('.cl-modal_body').within(() => {
    cy.Get('div[data-slate-editor="true"]')
      .should("be.visible")
      .Click()
      .type(textToType)
      .trigger('keyup')
  })
}

export function TypeLetterResponse(letter) {
  //if (letter ==="$") letter = '{shift}4';  //TODO: cypress is not resolving shift^4 to trigger entity finder event.
  cy.Get('.cl-modal_body').within(() => {
    cy.Get('div[data-slate-editor="true"]')
      //.type(letter, { release: false })   //enable if the key combination works.
      .type(letter)
      .trigger('onChange')
  })
}

export function TypeExpectedEntity(entityName) {
  cy.Get('.cl-modal_body').within(() => {
    cy.Get('.cl-action-creator--expected-entities').within(() => {
      cy.Get('.ms-BasePicker-input')
        .type(`${entityName}{enter}`)
    })
  })
}

export function TypeRequiredEntities(entityName) {
  cy.Get('.cl-modal_body').within(() => {
    cy.Get('.cl-action-creator--required-entities').within(() => {
      cy.Get('.ms-BasePicker-input')
        .type(`${entityName}{enter}`)
    })
  })
}

export function TypeDisqualifyingEntities(entityName) {
  cy.Get('.cl-modal_body').within(() => {
    cy.Get('.cl-action-creator--disqualifying-entities').within(() => {
      cy.Get('.ms-BasePicker-input')
        .type(entityName)
        .type('{enter}')
    })
  })
}

export function ClickWaitForResponse() {
  cy.Get('.cl-modal_body').within(() => {
    cy.Get('.ms-Checkbox-text')
      .should("be.visible")
      .Click()
  })
}

export function ClickCreateButton() { cy.Get('[data-testid="actioncreator-button-create"]').Click() }
