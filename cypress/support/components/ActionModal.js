/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as popupModal from './PopupModal'

export function VerifyPageTitle() { cy.Get('[data-testid="create-an-action-title"]').contains('Create an Action').should('be.visible') }
export function CheckWaitForResponse() { throw new Error('CheckWaitForResponse is NOT supported') } // Since this is a button and not a real check box it is difficult/ugly to manage the state. This defaults to checked.
export function UncheckWaitForResponse() { cy.Get('[data-testid="action-creator-wait-checkbox"] .ms-Checkbox').Click() }
export function ClickAddEntityButton() { cy.Get('[data-testid="action-button-create-entity"]').Click() }
export function ClickCreateButton() { cy.Get('[data-testid="action-creator-create-button"]').Click() }
export function ClickDeleteButton() { cy.Get('[data-testid="action-creator-delete-button"]').Click() }
export function ClickCancelButton() { cy.Get('[data-testid="action-creator-cancel-button"]').Click() }

export function ClickConfirmDeleteButton() { popupModal.VerifyExactTitleNoContentClickButton('Are you sure you want to delete this Action?', '[data-testid="confirm-cancel-modal-accept"]') }
export function ClickCancelDeleteButton() { popupModal.VerifyExactTitleNoContentClickButton('Are you sure you want to delete this Action?', '[data-testid="confirm-cancel-modal-cancel"]') }

// TODO: VERIFY EVERY TEST THAT USES THIS...AND THEN FIX THE CANCEL VERSION AS WELL!!!
export function ClickConfirmDeleteWithWarningButton() { popupModal.VerifyExactTitleAndContentContainsClickButton('Are you sure you want to delete this Action?', 'This Action is used by one or more Training Dialogs.', '[data-testid="action-delete-confirm"]') }
  //popupModal.VerifyContentAnyTitleClickButton('This Action is used by one or more Training Dialogs.', '[data-testid="confirm-cancel-modal-accept"]') }
export function ClickCancelDeleteWithWarningButton() { popupModal.VerifyContentAnyTitleClickButton('This Action is used by one or more Training Dialogs.', '[data-testid="confirm-cancel-modal-cancel"]') }

export function ClickTrainDialogFilterButton() { cy.Get('[data-testid="action-creator-editor-train-dialog-filter-button"]').Click() }

export function TypeExpectedEntity(entityName) { TypeMultipleEntities('.cl-action-creator--expected-entity', [entityName]) }
export function TypeRequiredEntities(entityNames) { TypeMultipleEntities('.cl-action-creator--required-entities', entityNames) }
export function TypeDisqualifyingEntities(entityNames) { TypeMultipleEntities('.cl-action-creator--disqualifying-entities', entityNames) }

export function SelectType(type) { SelectFromDropdown('[data-testid="dropdown-action-type"]', type) }
export function SelectApi(apiName) { SelectFromDropdown('[data-testid="dropdown-api-option"]', apiName) }
export function SelectCard(cardName) { SelectFromDropdown('[data-testid="action-card-template"]', cardName) }

export function TypeCardTitle(title) { TypeInField('[data-testid="action-card-argument-title"] div[data-slate-editor="true"]', title) }
export function TypeCardImage(image) { TypeInField('[data-testid="action-card-argument-image"] div[data-slate-editor="true"]', image) }
export function TypeCardLine1(line) { TypeInField('[data-testid="action-card-argument-line1"] div[data-slate-editor="true"]', line) }
export function TypeCardLine2(line) { TypeInField('[data-testid="action-card-argument-line2"] div[data-slate-editor="true"]', line) }
export function TypeCardLine3(line) { TypeInField('[data-testid="action-card-argument-line3"] div[data-slate-editor="true"]', line) }
export function TypeCardButton1(buttonText) { TypeInField('[data-testid="action-card-argument-button1"] div[data-slate-editor="true"]', buttonText) }
export function TypeCardButton2(buttonText) { TypeInField('[data-testid="action-card-argument-button2"] div[data-slate-editor="true"]', buttonText) }

function TypeInField(fieldSelector, text) { 
  cy.Get(fieldSelector).clear().type(text)
  ClickOnNoOpHack()
}

export function VerifyActionTypeEnabled() { cy.Get('[aria-disabled="false"][data-testid="dropdown-action-type"]') }
export function VerifyActionTypeDisabled() { cy.Get('[aria-disabled="true"][data-testid="dropdown-action-type"]') }

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

function ClickOnNoOpHack() { 
  // This has no effect on the data in this Action Modal but it some how
  // resets something in the UI that enables picking an entity.
  // Bug 2132: TEST BLOCKER: Automation cannot trigger 2nd Entity picker in API Action arguments
  cy.get('[data-testid="action-creator-wait-checkbox"]').click() 
}

function TypeApiArgs(apiArgLabel, args) {
  cy.Get('label')
    .contains(apiArgLabel)
    .siblings('div.editor-container')
    .find('div[data-slate-editor="true"]')
    .then(elements => {
      if (elements.length != args.length) {
        throw new Error(`Test Code Error: The API ${apiArgLabel} takes ${elements.length} arguments, but test code supplied ${args.length}`)
      }

      for (let i = 0; i < args.length; i++) {
        cy.wrap(elements[i]).type(`${args[i]}{enter}`)
        ClickOnNoOpHack()
      }
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
          entityNames.forEach(entityName => cy.wrap(element).type(`$${entityName}`).wait(1000).type('{enter}{esc}'))
        })
    })
  })
}
