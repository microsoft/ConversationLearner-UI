/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/
export function VerifyPageTitle()         { cy.Get('[data-testid="create-an-action-title"]').contains('Create an Action').should('be.visible') }
export function ClickNewAction()          { cy.Get('[data-testid="actions-button-create"]').Click() }
export function ClickCreateButton()       { cy.Get('[data-testid="actioncreator-button-create"]').Click() }
export function CheckWaitForResponse()    { throw 'CheckWaitForResponse is NOT supported'} // Since this is a button and not a real check box it is difficult/ugly to manage the state. This defaults to checked.
export function UncheckWaitForResponse()  { cy.Get('.cl-modal_body').within(() => { cy.Get('.ms-Checkbox-text').click() })}

export function TypeExpectedEntity(entityNames)         { TypeMultipleEntities('.cl-action-creator--expected-entities', entityNames) }
export function TypeRequiredEntities(entityNames)       { TypeMultipleEntities('.cl-action-creator--required-entities', entityNames) }
export function TypeDisqualifyingEntities(entityNames)  { TypeMultipleEntities('.cl-action-creator--disqualifying-entities', entityNames) }

export function TypeResponse(textToType) 
{
  cy.Get('.cl-modal_body').within(() => 
  {
    cy.Get('div[data-slate-editor="true"]')
      .clear()
      .type(textToType)
  })
}

// Pass in an undefined 'entityNames' to just clear the field
function TypeMultipleEntities(selector, entityNames)
{
  if (!entityNames) entityNames = new Array()
  else if (!Array.isArray(entityNames)) entityNames = [entityNames]

  cy.Get('.cl-modal_body').within(() => 
  {
    cy.Get(selector).within(() => 
    {
      cy.Get('.ms-BasePicker-input')
        .then((element) =>
        {
          for(var i = 0; i < entityNames.length; i++) { cy.wrap(element).type(`$${entityNames[i]}`).wait(1000).type('{enter}') }
        })
    })
  })
}

export function SelectTypeText() 
{
  cy.Get('[data-testid="dropdown-action-type"]')
    .should("be.visible")
    .Click()
    .Click()
}

export function TypeLetterResponse(letter) 
{
  //if (letter ==="$") letter = '{shift}4';  //TODO: cypress is not resolving shift^4 to trigger entity finder event.
  cy.Get('.cl-modal_body').within(() => 
  {
    cy.Get('div[data-slate-editor="true"]')
      //.type(letter, { release: false })   //enable if the key combination works.
      .clear()
      .type(letter)
      .trigger('onChange')
  })
}
