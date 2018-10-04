/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

// data-testid="teach-session-admin-train-status" (Running, Completed, Failed)
export function clickRefreshScoreButton()       { cy.Get('[data-testid="teach-session-admin-refresh-score-button"]').Click() }
export function selectAnAction()                { cy.Get('[data-testid="actionscorer-buttonClickable"]').should("be.visible").Click() }
export function clickAddActionButton()          { cy.Get('[data-testid="action-scorer-add-action-button"]').Click() }

export function clickAction(expectedActionResponse)
{
  cy.Get('[data-testid="actionscorer-responseText"]').contains(expectedActionResponse)
    .parents('div.ms-DetailsRow-fields').find('[data-testid="actionscorer-buttonClickable"]')
    .Click()
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

