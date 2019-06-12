/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/
export function VerifyPageTitle() { cy.Get('[data-testid="create-an-action-title"]').contains('Create an Action').should('be.visible') }
export function CheckWaitForResponse() { throw 'CheckWaitForResponse is NOT supported' } // Since this is a button and not a real check box it is difficult/ugly to manage the state. This defaults to checked.
export function UncheckWaitForResponse() { cy.Get('.cl-modal_body').within(() => { cy.Get('.ms-Checkbox-text').click() }) }
export function ClickCreateButton() { cy.Get('[data-testid="action-creator-create-button"]').Click() }
export function ClickDeleteButton() { cy.Get('[data-testid="action-creator-delete-button"]').Click() }
export function ClickCancelButtom() { cy.Get('[data-testid="action-creator-cancel-button"]').Click() }
export function ClickConfirmButtom() { cy.Get('button > div > div > div').ExactMatch('Confirm').Click() }

export function TypeExpectedEntity(entityNames) { TypeMultipleEntities('.cl-action-creator--expected-entities', entityNames) }
export function TypeRequiredEntities(entityNames) { TypeMultipleEntities('.cl-action-creator--required-entities', entityNames) }
export function TypeDisqualifyingEntities(entityNames) { TypeMultipleEntities('.cl-action-creator--disqualifying-entities', entityNames) }
export function SelectType(type) { SelectFromDropdown('[data-testid="dropdown-action-type"]', type) }
export function SelectApi(apiName) { SelectFromDropdown('[data-testid="dropdown-api-option"]', apiName) }

export function VerifyErrorMessage(expectedMessage) { cy.Get('[data-testid="action-creator-editor-error-callback"]').ExactMatch(expectedMessage) }

function SelectFromDropdown(selector, option)
{
  cy.Get(selector).Click()
  cy.Get('button.ms-Dropdown-item').ExactMatch(option).Click()
}

export function TypeResponse(textToType) {
  cy.Get('.cl-modal_body').within(() => {
    cy.Get('div[data-slate-editor="true"]')
      .clear()
      .type(textToType)
  })
}

export function TypeApiLogicArgs(args) { TypeApiArgs('Logic Arguments', args) }
export function TypeApiRenderArgs(args) { TypeApiArgs('Render Arguments', args) }

function TypeApiArgs(apiArgLabel, args) {
  cy.Get('label')
    .contains(apiArgLabel)
    .siblings('div.editor-container')
    .find('div[data-slate-editor="true"]')
    .then(elements => {
      if (elements.length != args.length) {
        throw new Error(`Test Code Error: The API ${apiArgLabel} takes ${elements.length} arguments, but test code supplied ${args.length}`)
      }

      cy.DumpHtmlOnDomChange(true)
      for (let i = 0; i < args.length; i++) {
        cy.wrap(elements[i]).type(args[i]).wait(1000)
      }
      cy.DumpHtmlOnDomChange(false)
    })
}

// function TypeApiArgs(apiArgLabel, args) {
//   cy.DumpHtmlOnDomChange(true)
//   for (let i = 0; i < args.length; i++) {
//   //for (let i = args.length - 1; i >= 0; i--) {
//     cy.Get('label')
//       .contains(apiArgLabel)
//       .siblings('div.editor-container')
//       .find('div[data-slate-editor="true"]')
//       .then(elements => {
//         if (elements.length != args.length) {
//           throw new Error(`Test Code Error: The API ${apiArgLabel} takes ${elements.length} arguments, but test code supplied ${args.length}`)
//         }

//         //cy.wrap(elements[i]).click().type(args[i]).wait(3000)
//         cy.wrap(elements[i]).type('$').wait(1000).type(args[i]).wait(1000).type('{enter}').wait(3000)
//       })
//   }
//   cy.DumpHtmlOnDomChange(false)
// }


// Pass in an undefined 'entityNames' to just clear the field
function TypeMultipleEntities(selector, entityNames) {
  cy.Get('.cl-modal_body').within(() => {
    cy.Get(selector).within(() => {
      cy.Get('.ms-BasePicker-input')
        .then((element) => {
          entityNames.forEach(entityName => cy.wrap(element).type(`$${entityName}`).wait(1000).type('{enter}'))
        })
    })
  })
}
