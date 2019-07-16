/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

import * as entitiesGrid from '../../support/components/EntitiesGrid'
import * as models from '../Models'

export function VerifyPageTitle() { cy.Get('[data-testid="settings-title"]').contains('Settings').should('be.visible') }
export function ClickExportModelButton() { cy.Get('[data-testid="settings-export-model-button"]').Click() }
export function ClickCopyModelButton() { cy.Get('[data-testid="settings-copy-model-button"]').Click() }
export function ClickDeleteModelButton() { cy.Get('[data-testid="settings-delete-model-button"]').Click() }

export function TypeNewModelName(modelName) { cy.Get('[data-testid="model-creator-input-name"]').type(`${modelName}{enter}`) }
export function ClickCopyConfirmButton() { cy.Get('[data-testid="model-creator-submit-button"]').Click() }

export function CopyModel(modelNamePrefix) {
    const name = models.UniqueModelName.Get(modelNamePrefix)
    ClickCopyModelButton()
    TypeNewModelName(name)
    //ClickCopyConfirmButton()
    return name
}

export function DeleteModel(modelName) {
    cy.visit('http://localhost:3000')
    // cy.Get('[data-testid="settings-delete-model-button"]').Click() 
    // cy.Get('[data-testid="user-input-modal-new-message-input"]').type(`${modelName}{enter}`)
}

