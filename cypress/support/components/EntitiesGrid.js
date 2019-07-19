/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as helpers from '../../support/Helpers'

export function VerifyPageTitle() { cy.Get('[data-testid="entities-title"]').contains('Entities').should('be.visible') }
export function ClickButtonNewEntity() { cy.Get('[data-testid="entities-button-create"]').Click() }
export function EditEntity(name) { new Row(name).EditEntity() }
export function VerifyEntityNotInGrid(name) { cy.DoesNotContainExact('[data-testid="entities-name"]', name) }

export class Row {
  constructor(entityName) {
    cy.Get('[data-testid="entities-name"]')
      .ExactMatch(entityName)
      .parents('div.ms-DetailsRow-fields')
      .as('entityDetailsRow')
  }

  EditEntity() { cy.Get('@entityDetailsRow').Click() }
  
  VerifyType(type) { cy.Get('@entityDetailsRow').find('[data-testid="entities-type"]').contains(type) }
  
  VerifyResolverType(resolverType) { 
    if (resolverType) { cy.Get('@entityDetailsRow').find('[data-testid="entities-resolver"]').ExactMatch(resolverType) }
    else { cy.Get('@entityDetailsRow').find('[data-testid="entities-resolver-none"]') }
  }
  
  VerifyMultiValue(checked) { cy.Get('@entityDetailsRow').find(`i[data-icon-name="${checked ? 'CheckMark' : 'Remove'}"][data-testid="entities-multi-value"]`) }
  VerifyNegatable(checked) { cy.Get('@entityDetailsRow').find(`i[data-icon-name="${checked ? 'CheckMark' : 'Remove'}"][data-testid="entities-negatable"]`) }
}

export function VerifyEntityRow(name, type, resolverType, multiValue, negatable) {
  cy.Enqueue(() => {
    helpers.ConLog('VerifyEntityRow', `${name}, ${type}, ${resolverType}, ${multiValue}, ${negatable}`)
    let entityGridRow = new Row(name)
    entityGridRow.VerifyType(type)
    entityGridRow.VerifyResolverType(resolverType)
    entityGridRow.VerifyMultiValue(multiValue)
    entityGridRow.VerifyNegatable(negatable)
  })
}

export function VerifyAllEntityRows(rows) {
  cy.WaitForStableDOM()
  cy.Enqueue(() => {
    rows.forEach(row => {
      helpers.ConLog('VerifyAllEntityRows', `${row.name}, ${row.type}, ${row.resolverType}, ${row.multiValue}, ${row.negatable}`)
      VerifyEntityRow(row.name, row.type, row.resolverType, row.multiValue, row.negatable)
    })
    
    const gridRowCount = Cypress.$('div[role="presentation"].ms-List-cell').length
    if (gridRowCount > rows.length) {
      throw new Error(`Found all of the expected Action Rows, however there are an additional ${gridRowCount - rows.length} Action Rows in the grid that we were not expecting.`)
    }
  })
}


export function GetAllRows() { 
  helpers.ConLog('GetAllRows', 'start')

  let allRowData = []

  const allRowElements = Cypress.$('div[role="presentation"].ms-List-cell')

  for (let i = 0; i < allRowElements.length; i++) {
    let name = helpers.TextContentWithoutNewlines(Cypress.$(allRowElements[i]).find('[data-testid="entities-name"]')[0])
    let type = helpers.TextContentWithoutNewlines(Cypress.$(allRowElements[i]).find('[data-testid="entities-type"]')[0])
    let resolverType = helpers.TextContentWithoutNewlines(Cypress.$(allRowElements[i]).find('[data-testid="entities-resolver"]')[0])
    let multiValue = Cypress.$(allRowElements[i]).find('[data-icon-name="CheckMark"][data-testid="entities-multi-value"]').length == 1
    let negatable = Cypress.$(allRowElements[i]).find('[data-icon-name="CheckMark"][data-testid="entities-negatable"]').length == 1

    allRowData.push({
      name: name,
      type: type,
      resolverType: resolverType,
      multiValue: multiValue,
      negatable: negatable,
    })

    helpers.ConLog('GetAllRows', `${name}, ${type}, ${resolverType}, ${multiValue}, ${negatable}`)
  }
  
  return allRowData
}

