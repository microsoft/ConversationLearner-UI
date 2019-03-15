/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as homePage from '../../support/components/HomePage'

describe('Tools', () => {
  it('Visit Home Page', () => {
    homePage.Visit()
    cy.WaitForStableDOM()
    cy.wait(5000).then(() => {
      throw new Error('This is NOT an Error, however, to get a snapshot of the home screen and recording of run we must throw an error.')
    })
  })
})
