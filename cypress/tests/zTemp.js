/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const helpers = require('../support/Helpers')
const homePage = require('../support/components/HomePage')
const modelPage = require('../support/components/ModelPage')
const train = require('../support/Train')
const trainDialogsGrid = require('../support/components/TrainDialogsGrid')
const editDialogModal = require('../support/components/EditDialogModal')

Cypress.TestCase('zTemp', 'Temporary Experimental Test', zTemp)
function zTemp() {
  cy.task('exists', 'C:/repo/ConversationLearner-UI/cypress/integration/tools').then(fileExists => {console.log(`fileExists: ${fileExists}`)})
}
