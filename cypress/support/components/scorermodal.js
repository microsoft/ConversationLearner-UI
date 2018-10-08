/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

// data-testid="teach-session-admin-train-status" (Running, Completed, Failed)
export function ClickRefreshScoreButton()       { cy.Get('[data-testid="teach-session-admin-refresh-score-button"]').Click() }
export function SelectAnAction()                { cy.Get('[data-testid="actionscorer-buttonClickable"]').should("be.visible").Click() }
export function ClickAddActionButton()          { cy.Get('[data-testid="action-scorer-add-action-button"]').Click() }

export function ClickAction(expectedActionResponse)
{
  cy.Get('[data-testid="actionscorer-responseText"]').contains(expectedActionResponse)
    .parents('div.ms-DetailsRow-fields').find('[data-testid="actionscorer-buttonClickable"]')
    .Click()
}

export function VerifyContainsDisabledAction(expectedActionResponse)
{
    cy.Get('[data-testid="actionscorer-responseText"]').contains(expectedActionResponse)
    .parents('div.ms-DetailsRow-fields').find('[data-testid="actionscorer-buttonNoClick"]')
    .should('be.disabled')
    // TODO: Probably should also validate Score, Entities, Wait & Type as well
}

export function VerifyEntityInMemory(entityName, entityValue)
{
  cy.Get('[data-testid="entity-memory-name"]').contains(entityName)
  cy.Get('[data-testid="entity-memory-value"]').contains(entityValue)
}

