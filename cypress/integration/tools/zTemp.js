/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const homePage = require('../../support/components/HomePage')

/// Description: A temporary workspace for experimental code
describe('zTemp test', () =>
{
  it.skip('zTemp test', () => 
  {
    homePage.Visit()
    cy.pause()
  })
})
