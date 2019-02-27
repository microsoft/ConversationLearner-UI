/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const helpers = require('../../support/Helpers')
const homePage = require('../../support/components/HomePage')
const modelPage = require('../../support/components/ModelPage')
const train = require('../../support/Train')
const trainDialogsGrid = require('../../support/components/TrainDialogsGrid')
const editDialogModal = require('../../support/components/EditDialogModal')

describe('zTemp', () => {
  it('Temporary Experimental Test', () => {
    cy.task('exists', './cypress/integration/Tools').then(fileExists => {console.log(`fileExists: ${fileExists}`)})
  })
})
