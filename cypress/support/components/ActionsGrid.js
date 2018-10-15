/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

export function VerifyPageTitle()       { cy.Get('[data-testid="actions-title"]').contains('Actions') }


