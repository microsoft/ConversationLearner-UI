/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../../support/Models'
import * as helpers from '../../support/Helpers'

describe('Bot Model Mismatch - ErrorHandling', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)

  context('Setup', () => {
    it('Should import a model to test against', () => {
      models.ImportModel('z-wrongBot', 'z-botModelMismatch.cl')
    })
  })

  context('Validation', () => {
    it('Should verify that an error message came up due to importing a model that is not supported by the Bot that is running', () => {
      cy.Get('div.cl-errorpanel > div').ExactMatch('Please check that the correct version of your Bot is running.')
    })
  })
})
