/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const models = require('../support/Models')
const helpers = require('../support/Helpers')

Cypress.TestCase('UX', 'Bot Model Mismatch', BotModelMismatch)
export function BotModelMismatch() {
  models.ImportModel('BotModelMismatch', 'z-botmodelmismatch.cl')
  assert(Cypress.$(".cl-errorpanel").length < 1, "Bot/Model mismatch should display error msg!")
}
