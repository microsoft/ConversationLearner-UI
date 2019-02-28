/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const models = require('../../support/Models')
const homePage = require('../../support/components/HomePage')

describe('Create Model', () => {
  it('Tools', () => {
    models.CreateNewModel('z-model')
    homePage.Visit()
    homePage.GetModelListRowCount()
  })
})

