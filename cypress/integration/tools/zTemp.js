/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const homePage = require('../support/components/HomePage')

describe("Visit Home Page", () =>
{
  it('Visit Home Page', () => {
    homePage.Visit()

    homePage.ClickImportModelButton()

    cy.UploadFile('Model1.cl', '[data-testid=model-creator-import-file-picker] > div > input[type="file"]')
  })
})
