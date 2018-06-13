/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

function VerifyPageTitle(modelName) {
        // Verify: Ensure app page displays new application title
        cy.get('[data-testid="app-index-title"]')
        .should(el => {
          expect(el).to.contain(modelName)
        })
}

export {VerifyPageTitle}