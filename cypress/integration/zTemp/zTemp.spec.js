/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as helpers from '../../support/Helpers'
import * as homePage from '../../support/components/HomePage'
import * as modelPage from '../../support/components/ModelPage'
import * as train from '../../support/Train'
import * as trainDialogsGrid from '../../support/components/TrainDialogsGrid'
import * as editDialogModal from '../../support/components/EditDialogModal'

describe('zTemp', () => {
  it('Temporary Experimental Test', () => {
    cy.task('exists', './cypress/integration/Tools').then(fileExists => {console.log(`fileExists: ${fileExists}`)})
  })
})
