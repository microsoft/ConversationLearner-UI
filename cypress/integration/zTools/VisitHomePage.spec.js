/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as homePage from '../../support/components/HomePage'

describe('Tools', () => {
  it('Visit Home Page', () => {
    homePage.Visit()
    homePage.GetModelListRowCount()
  })
})
