/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
export function selectAnAction()                        { cy.get('[data-testid="actionscorer-buttonClickable"]').should("be.visible").click() }
export function clickEntityDetectionToken(tokenValue)   { cy.Get('[data-testid="text-entity-value"]').contains(tokenValue).Click() }

export function clickAction(expectedActionResponse)
{
  cy.Get('[data-testid="actionscorer-responseText"]').contains(expectedActionResponse)
    .parents('div.ms-DetailsRow-fields').find('[data-testid="actionscorer-buttonClickable"]')
    .click()
}

export function verifyContainsDisabledAction(expectedActionResponse)
{
    cy.Get('[data-testid="actionscorer-responseText"]').contains(expectedActionResponse)
    .parents('div.ms-DetailsRow-fields').find('[data-testid="actionscorer-buttonNoClick"]')
    .should('be.disabled')
    // TODO: Probably should also validate Score, Entities, Wait & Type as well
}

export function verifyEntityInMemory(entityName, entityValue)
{
  cy.Get('[data-testid="entity-memory-name"]').contains(entityName)
  cy.Get('[data-testid="entity-memory-value"]').contains(entityValue)
}

