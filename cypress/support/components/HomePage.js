/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

import * as modelPage from '../components/ModelPage'
import * as settings from '../components/Settings'
import * as helpers from '../Helpers'

export function Visit() { return cy.visit('http://localhost:5050'); VerifyPageTitle() }
export function VerifyPageTitle() { return cy.Get('[data-testid="model-list-title"]').contains('Create and manage your Conversation Learner models').should('be.visible') }
export function NavigateToModelPage(name) { return cy.Get('[data-testid="model-list-model-name"]').ExactMatch(`${name}`).Click() }
export function ClickNewModelButton() { return cy.Get('[data-testid="model-list-create-new-button"]').Click() }
export function ClickImportModelButton() { return cy.Get('[data-testid="model-list-import-model-button"]').Click() }
export function TypeModelName(name) { return cy.Get('[data-testid="model-creator-input-name"]').type(name) }
export function ClickSubmitButton() { return cy.Get('[data-testid="model-creator-submit-button"]').Click() }

export function UploadImportModelFile(name) { return cy.UploadFile(name, `[data-testid=model-creator-import-file-picker] > div > input[type="file"]`) }

export function ClickDeleteModelButton(row) { return cy.Get(`[data-list-index="${row}"] > .ms-FocusZone > .ms-DetailsRow-fields`).find('i[data-icon-name="Delete"]').Click() }
export function ClickConfirmButton() { return cy.Get('.ms-Dialog-main').contains('Confirm').Click() }

export function GetModelListRowCount() {
  return cy.Get('[data-automationid="DetailsList"] > [role="grid"]')
    .then(gridElement => { 
      let rowCount = +gridElement.attr('aria-rowcount') - 1
      return rowCount 
    })
}

export function GetModelNameIdList() {
  cy.Enqueue(() => {
    let listToReturn = []
    let elements = Cypress.$('[data-testid="model-list-model-name"]')
    for (let i = 0; i < elements.length; i++) {
      let modelName = elements[i].textContent
      let modelId = elements[i].getAttribute('data-model-id')
      listToReturn.push({ name: modelName, id: modelId })
      helpers.ConLog('GetModelNameIdList', `modelName: ${modelName} - modelId: ${modelId}`)
    }
    helpers.ConLog('GetModelNameIdList', `Returning a list of ${listToReturn.length} models`)
    return listToReturn
  })
}