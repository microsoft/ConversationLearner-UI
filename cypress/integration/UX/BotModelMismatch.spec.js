/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../support/Models'
import * as helpers from '../../support/Helpers'

describe('UX', () => {
  it('Bot Model Mismatch', () => {
    models.ImportModel('z-wrongBot', 'z-botModelMismatch.cl') // 'z-botModelMismatch' is too long of a name.
    cy.Get('div.cl-errorpanel > div').ExactMatch('Please check that the correct version of your Bot is running.')
  })
})
