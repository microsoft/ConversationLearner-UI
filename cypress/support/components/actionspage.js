/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
const testLog = require('../utils/testlog')

/** Click on create a new action button */
function createNew() {
  cy
    .get('[data-testid="actions-button-create"]')
    .then(function (response) {
      testLog.logStep("Create a New Action")
    })
    .click();
}
export {createNew};