/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

const entitiesGrid = require('../../support/components/EntitiesGrid')

export function VerifyPageTitle()         { cy.Get('[data-testid="settings-title"]').contains('Settings').should('be.visible') }

export function DeleteModel(modelName)       
{ 
  cy.Get('[data-testId="settings-delete-model-button"]').Click() 
  cy.Get('[data-testid="user-input-modal-new-message-input"]').type(`${modelName}{enter}`)
}

