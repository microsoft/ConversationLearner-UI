/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

const actionsPage = require('../support/components/ActionsPage')
const modelPage = require('../support/components/ModelPage')

export function CreateNewAction({response, expectedEntity, requiredEntities, disqualifyingEntities, type = 'TEXT' })
{
  modelPage.NavigateToActions()
  actionsPage.ClickNewAction()
  // TODO: this is the default but we need to get this working... actionsModal.selectTypeText()
  actionsModal.TypeResponse(response)
  if (expectedEntity) actionsModal.TypeExpectedEntity(expectedEntity)
  if (requiredEntities) actionsModal.TypeRequiredEntities(requiredEntities)
  if (disqualifyingEntities) actionsModal.TypeDisqualifyingEntities(disqualifyingEntities)
  actionsModal.ClickCreateButton()
}

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

export function TypeDisqualifyingEntities(entityNames) 
{
  if (!Array.isArray(entityNames)) entityNames = [entityNames]

  cy.Get('.cl-modal_body').within(() => {
    cy.Get('.cl-action-creator--disqualifying-entities').within(() => {
      cy.Get('.ms-BasePicker-input')
        .then((element) =>
        {
          for(var i = 0; i < entityNames.length; i++) { cy.wrap(element).type(entityNames[i]).type('{enter}') }
        })
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
