/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

import * as modelPage from '../components/ModelPage'
import * as helpers from '../Helpers'

export function Visit() { return cy.visit('http://localhost:3000'); VerifyPageTitle() }
export function VerifyPageTitle() { return cy.Get('[data-testid="model-list-title"]').contains('Create and manage your Conversation Learner models').should('be.visible') }
export function ClickNewModelButton() { return cy.Get('[data-testid="model-list-create-new-button"]', {timeout: 10000}).Click() }
export function ClickImportModelButton() { return cy.Get('[data-testid="model-list-import-model-button"]', {timeout: 10000}).Click() }
export function TypeModelName(name) { return cy.Get('[data-testid="model-creator-input-name"]', {timeout: 10000}).type(name) }
export function ClickSubmitButton() { return cy.Get('[data-testid="model-creator-submit-button"]').Click() }

export function UploadImportModelFile(name) { return cy.UploadFile(name, 'input[type="file"]') }

export function ClickDeleteModelButton(row) { return cy.Get(`[data-list-index="${row}"] > .ms-FocusZone > .ms-DetailsRow-fields`).find('i[data-icon-name="Delete"]').Click() }

export function WaitForModelListToLoad() {
  let lastRowCount = 0
  cy.scrollTo('bottom') 
  cy.wrap(1, {timeout: 10000}).should(() => {
    // Subtract 1 because it includes the header row.
    const rowCount = +Cypress.$('[data-automationid="DetailsList"] > [role="grid"]').attr('aria-rowcount') - 1
    if (rowCount == 0) {
      throw new Error('RETRY - Model List Row Count is still ZERO.')
    }

    // We don't subtract 1 here since this count does not include the header row.
    const loadedRowCount = Cypress.$('[data-testid="model-list-model-name"]').length

    helpers.ConLog('WaitForModelListToLoad', `rowCount: ${rowCount} - loadedRowCount: ${loadedRowCount}`)

    if (rowCount != loadedRowCount) {
      // TODO: For some reason this is not working when there are a lot of rows (100+)
      //       Right now the solution is to delete the test models that have accumulated.
      //       This should not happen on CircleCI since we have a clean up process.
      window.scrollBy(0, -200)
      throw new Error('RETRY - Loaded Model List Row Count does not yet match the aria-rowcount.')
    }
  })
}

export function VerifyModelNameInList(modelName) { 
  WaitForModelListToLoad()
  cy.Get('[data-testid="model-list-model-name"]').ExactMatch(modelName) 
}

export function VerifyModelNameIsNotInList(modelName) { 
  WaitForModelListToLoad()
  cy.DoesNotContain('[data-testid="model-list-model-name"]', modelName) 
}

export function LoadModel(modelName) { 
  cy.Get('[data-testid="model-list-model-name"]', {timeout: 10000}).ExactMatch(modelName).Click()
  modelPage.VerifyModelName(modelName)
}

export function GetModelNameIdList() {
  cy.Enqueue(() => {
    let listToReturn = []
    const elements = Cypress.$('[data-testid="model-list-model-name"]')
    for (let i = 0; i < elements.length; i++) {
      const modelName = helpers.TextContentWithoutNewlines(elements[i])
      const modelId = elements[i].getAttribute('data-model-id')
      listToReturn.push({ name: modelName, id: modelId })
      helpers.ConLog('GetModelNameIdList', `modelName: ${modelName} - modelId: ${modelId}`)
    }
    helpers.ConLog('GetModelNameIdList', `Returning a list of ${listToReturn.length} models`)
    return listToReturn
  })
}