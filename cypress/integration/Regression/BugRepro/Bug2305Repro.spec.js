/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../../support/Models'
import * as modelPage from '../../../support/components/ModelPage'
import * as trainDialogsGrid from '../../../support/components/TrainDialogsGrid'
import * as train from '../../../support/Train'
import * as helpers from '../../../support/Helpers'

describe('Bug 2305 Repro', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)

  context('Setup', () => {
    it('Should import a model to test against and navigate to Train Dialogs view', () => {
      models.ImportModel('z-bug2305Repro', 'z-bug2305Repro.cl')
      modelPage.NavigateToTrainDialogs()
    })
  })

  context('Attempt to reproduce Bug 2305', () => {
    it('Edit Train Dialog', () => {
      trainDialogsGrid.TdGrid.EditTrainingByChatInputs('The green frog jumped.', 'The green frog jumped.', 'The only response')
    })

    it('Add an additional turn', () => {
      train.TypeYourMessage('The brown dog ran.')
      train.ClickScoreActionsButton()
    })

    it('Save as is', () => {
      train.SaveAsIs()
    })

    // Bug 2305: "Save As Is" Fails with status code 404
    // Once this bug is fixed comment out this block of code and uncomment the next block
    // it('Verify that Bug 2305 reproduced', () => {
    //   helpers.VerifyErrorMessageContains('Request failed with status code 404')
    //   helpers.VerifyErrorMessageContains('{"errorMessages":["No such training dialog exists"]}')
    // })
    
    // Bug 2305: "Save As Is" Fails with status code 404
    // This code should work once this bug is fixed...
    // Uncomment this and comment out the above to detect a regression.
    it('Verify that Bug 2305 did not reproduce', () => {
      const expectedTrainDialogs = [
        { firstInput: 'The green frog jumped.', lastInput: 'The green frog jumped.', lastResponse: 'The only response' },
        { firstInput: 'The green frog jumped.', lastInput: 'The brown dog ran.', lastResponse: '' },
      ]
      trainDialogsGrid.VerifyListOfTrainDialogs(expectedTrainDialogs)
    })
  })
})

