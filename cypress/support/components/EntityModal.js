/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as helpers from '../Helpers'

export function ClickEntityType(type) { cy.Get(`button.ms-Dropdown-item`).contains(type).Click() }
export function TypeEntityName(entityName) { cy.Get('[data-testid="entity-creator-entity-name-text"]').type(entityName) }
export function ClickEntityTypeDropdown() { cy.Get('[data-testid="entity-creator-entity-type-dropdown"]').Click() }
export function ClickCreateButton() { cy.Get('[data-testid="entity-creator-button-save"]').Click() }

export function ClickMultiValueCheckbox() { cy.Get('[data-testid="entity-creator-multi-valued-checkbox"] > button.cl-checkbox').Click() }
export function ClickNegatableCheckbox() { cy.Get('[data-testid="entity-creator-negatable-checkbox"] > button.cl-checkbox').Click() }

export function ClickOkButtonOnNoteAboutPreTrained() { return cy.Get('.ms-Dialog-main').contains('pre-trained Entity').parents('.ms-Dialog-main').contains('OK').Click() }

export function SelectResolverType(resolverType) {
    cy.Get('[data-testid="entity-creator-resolver-type-dropdown"]').Click()

    cy.Get('div[role="listbox"].ms-Dropdown-items > button.ms-Dropdown-item > div > div > span.clDropdown--normal')
        .ExactMatch(resolverType)
        .parents('button.ms-Dropdown-item')
        .Click()
}
