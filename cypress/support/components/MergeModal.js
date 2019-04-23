/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

import * as helpers from '../../support/Helpers'

export function VerifyPageTitle() { cy.Get('[data-testid="merge-modal-title"]').contains('Merge?').should('be.visible') }

//export function 
//data-testid="merge-modal-title"
//data-testid="traindialog-title"
//data-testid="train-dialogs-title"

