/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const testListManager = require('../support/TestListManager')

for (let i = 0; i < Cypress.loopCount; i ++) {
  testListManager.AddToCypressTestList(Cypress.testList)
}
