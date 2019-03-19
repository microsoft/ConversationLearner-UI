/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as homePage from '../../support/components/HomePage'

describe('Visit Home Page - Tools', () => {
  it('test', () => {
    homePage.Visit()
    homePage.GetModelListRowCount()
  })
})
