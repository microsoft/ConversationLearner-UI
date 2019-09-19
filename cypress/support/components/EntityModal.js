/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

import * as popupModal from './PopupModal'
import * as helpers from '../Helpers'

export function ClickEntityType(type) { cy.Get(`button.ms-Dropdown-item`).contains(type).Click() }
export function TypeEntityName(entityName) { cy.Get('[data-testid="entity-creator-entity-name-text"]').type(entityName) }
export function ClickEntityTypeDropdown() { cy.Get('[data-testid="entity-creator-entity-type-dropdown"]').Click() }
export function VerifyEntityTypeDisabled() { cy.Get('[aria-disabled="true"][data-testid="entity-creator-entity-type-dropdown"]') }
export function ClickCreateButton() { cy.Get('[data-testid="entity-creator-button-save"]').Click() }
export function ClickDeleteButton() { cy.Get('[data-testid="entity-button-delete"]').Click() }
export function ClickTrainDialogFilterButton() { cy.Get('[data-testid="entity-creator-component-train-dialog-filter-button"]').Click() }
export function ClickCancelButton() { cy.Get('[data-testid="entity-button-cancel"]').Click() }

export function ClickMultiValueCheckbox() { cy.Get('[data-testid="entity-creator-multi-valued-checkbox"] i[data-icon-name="CheckMark"]').Click() }
export function ClickNegatableCheckbox() { cy.Get('[data-testid="entity-creator-negatable-checkbox"] i[data-icon-name="CheckMark"]').Click() }

export function ClickOkButtonOnNoteAboutPreTrained() { popupModal.VerifyContentAnyTitleClickButton('pre-trained Entity', '[data-testid="confirm-cancel-modal-ok"]') }

export function SelectRequiredForActionsTab() { cy.Get('button[data-content="Required For Actions"]').Click() }
export function SelectBlockedActionsTab() { cy.Get('button[data-content="Blocked Actions"]').Click() }

export function ClickConfirmButtonOnDeleteConfirmPopUp() { popupModal.VerifyExactTitleNoContentClickButton('Are you sure you want to delete this Entity?', '[data-testid="confirm-cancel-modal-accept"]') }
export function ClickCancelButtonOnDeleteConfirmPopUp() { popupModal.VerifyExactTitleNoContentClickButton('Are you sure you want to delete this Entity?', '[data-testid="confirm-cancel-modal-cancel"]') }
export function ClickConfirmButtonOnDeleteConfirmWithWarningPopUp() { popupModal.VerifyExactTitleAndContentContainsClickButton('Are you sure you want to delete this Entity?', 'This Entity is used by one or more Training Dialogs.', '[data-testid="confirm-cancel-modal-accept"]') }
export function ClickCancelButtonOnDeleteConfirmWithWarningPopUp() { popupModal.VerifyExactTitleAndContentContainsClickButton('Are you sure you want to delete this Entity?', 'This Entity is used by one or more Training Dialogs.', '[data-testid="confirm-cancel-modal-cancel"]') }
export function ClickCancelButtonOnUnableToDeletePopUp() { popupModal.VerifyExactTitleAndContentContainsClickButton('Unable to Delete this Entity', 'referenced within the bot response', '[data-testid="confirm-cancel-modal-cancel"]') }

export function SelectResolverType(resolverType) {
  cy.Get('[data-testid="entity-creator-resolver-type-dropdown"]').Click()

  cy.Get('div[role="listbox"].ms-Dropdown-items > button.ms-Dropdown-item > div > div > span.clDropdown--normal')
    .ExactMatch(resolverType)
    .parents('button.ms-Dropdown-item')
    .Click()
}

export function VerifyEmptyGrid() {
  cy.Enqueue(() => {
    const gridRowCount = Cypress.$('[data-testid="entity-creator-modal"]').parent().find('[data-automationid="ListCell"]').length
    helpers.ConLog('VerifyEmptyGrid', `gridRowCount: ${gridRowCount}`)
    if (gridRowCount != 0) {
      throw new Error(`Expecting the grid to be empty, instead we found ${gridRowCount} rows in it.`)
    }
  })
}

export function TypeEnumValues(enumValues) {
  cy.Get('[data-testid="entity-enum-value-value-name"]').then(elements => {
    for (let i = 0; i < enumValues.length; i++) {
      cy.wrap(elements[i]).type(`${enumValues[i]}{enter}`)
    }
  })
}

