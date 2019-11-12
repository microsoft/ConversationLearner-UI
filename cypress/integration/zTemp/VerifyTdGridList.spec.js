/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../../support/Models'
import * as modelPage from '../../../support/components/ModelPage'
import * as trainDialogsGrid from '../../../support/components/TrainDialogsGrid'
import * as helpers from '../../../support/Helpers'

describe('Entities Edit and Delete - EntitiesActions', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)

  context('Setup', () => {
    it('Should import a model to test against', () => {
      models.ImportModel('z-testVerification', 'z-entityTests.cl')
    })
  })

  let trainDialogs
  context('Verify Test Functions GetAllRows and VerifyListOfTrainDialogs', () => {
    it('Capture Train Dialog Grid data', () => {
      modelPage.NavigateToTrainDialogs()
      cy.Enqueue(() => { return trainDialogsGrid.TdGrid.GetAllRows() }).then(returnValue => trainDialogs = returnValue)
    })

    it('Verify the list of Train Dialog Grid data', () => {
      trainDialogsGrid.VerifyListOfTrainDialogs(trainDialogs)
    })
  })
})