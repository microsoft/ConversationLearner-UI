/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

import * as helpers from '../../support/Helpers'

export function ClickRefreshScoreButton() { cy.Get('[data-testid="teach-session-admin-refresh-score-button"]').Click() }
export function SelectAnAction() { cy.Get('[data-testid="action-scorer-button-clickable"]').should("be.visible").Click() }
export function ClickAddActionButton() { cy.Get('[data-testid="action-scorer-add-action-button"]').Click() }
export function VerifyMissingActionNotice() { cy.Get('.cl-font--warning').ExactMatch('MISSING ACTION') }

//export function 
