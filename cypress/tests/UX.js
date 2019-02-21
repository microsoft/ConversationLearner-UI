/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const models = require('../support/Models')
const helpers = require('../support/Helpers')

Cypress.TestCase('UX', 'Bot Model Mismatch', BotModelMismatch)
export function BotModelMismatch() {
  models.ImportModel('z-wrongBot', 'z-botModelMismatch.cl') // 'z-botModelMismatch' is too long of a name.
  cy.Get('div.cl-errorpanel > div').ExactMatch('Please check that the correct version of your Bot is running.')
}
