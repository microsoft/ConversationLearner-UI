/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

import * as entitiesGrid from '../../support/components/EntitiesGrid'
import * as deleteModelModal from '../../support/components/DeleteModelModal'
import * as models from '../Models'

export function VerifyPageTitle() { cy.Get('[data-testid="settings-title"]').contains('Settings').should('be.visible') }
export function ClickExportModelButton() { cy.Get('[data-testid="settings-export-model-button"]').Click() }
export function ClickCopyModelButton() { cy.Get('[data-testid="settings-copy-model-button"]').Click() }
export function ClickDeleteModelButton() { cy.Get('[data-testid="settings-delete-model-button"]').Click() }

export function TypeNewModelNameForCopy(modelName) { cy.Get('[data-testid="model-creator-input-name"]').type(`${modelName}{enter}`) }
export function ClickCopyConfirmButton() { cy.Get('[data-testid="model-creator-submit-button"]').Click() }

export function TypeNewModelNameForRename(modelName) { cy.Get('[data-testid="settings-input-model-name"]').type(`${modelName}{enter}`) }
export function ClickSaveButton() { cy.Get('[data-testid="settings-button-save"]').Click() }

export function CopyModel(modelNamePrefix) {
  const name = models.UniqueModelName.Get(modelNamePrefix)
  ClickCopyModelButton()
  TypeNewModelNameForCopy(name)
  return name
}

export function DeleteModel(modelName) {
  ClickDeleteModelButton()
  deleteModelModal.VerifyPageTitle()
  deleteModelModal.TypeModelNameToDelete(modelName)
}

export function RenameModel(modelNamePrefix) {
  const name = models.UniqueModelName.Get(modelNamePrefix)
  TypeNewModelNameForRename(name)
  ClickSaveButton()
  return name
}

