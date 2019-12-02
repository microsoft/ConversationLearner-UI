/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../support/Models'
import * as modelPage from '../../support/components/ModelPage'
import * as trainDialogsGrid from '../../support/components/TrainDialogsGrid'
import * as train from '../../support/train'
import * as helpers from '../../support/Helpers'

describe('Verify User Turn in Entity Detection', () => {
  //afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)

  context('Setup', () => {
    it('Should import a model to test against', () => {
      models.CreateNewModel('z-verifyUserTurn')
      modelPage.NavigateToTrainDialogs()
    })
  })

  context('Tests', () => {
    it('Simple', () => {
      trainDialogsGrid.TdGrid.CreateNewTrainDialog()
      train.TypeYourMessage('This can be an entityError')
    })

    it('Quotes', () => {
      train.AbandonDialog()
      trainDialogsGrid.TdGrid.CreateNewTrainDialog()
      train.TypeYourMessage(`"This" contains 'both' types of quotes`)
    })

    it('Spaces and Periods', () => {
      train.AbandonDialog()
      trainDialogsGrid.TdGrid.CreateNewTrainDialog()
      train.TypeYourMessage('This is a test -  two  spaces. Period before and after.   Last sentence after 3 spaces. ')
    })
  })
})