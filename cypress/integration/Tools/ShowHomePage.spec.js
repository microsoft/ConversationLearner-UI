/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as homePage from '../../support/components/HomePage'

describe('Tools', () => {
  it('Visit Home Page', () => {
    homePage.Visit()
    homePage.GetModelListRowCount()
    throw new Error('This is NOT an Error, however, to get a snapshot of the home screen we must throw an error.')
  })
})
