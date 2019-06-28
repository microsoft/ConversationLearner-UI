/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../support/Models'
import * as modelPage from '../../support/components/ModelPage'
import * as train from '../../support/Train'
import * as trainDialogsGrid from '../../support/components/TrainDialogsGrid'
import * as common from '../../support/Common'
import * as helpers from '../../support/Helpers'

describe('Entity Action Missing User Turn', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)
  
  context('Setup', () => {
    it('Imports a model to test against', () => {
      models.ImportModel('z-eaMissUserTurn', 'z-eaMissUserTurn.cl')
      modelPage.NavigateToTrainDialogs()
      cy.WaitForTrainingStatusCompleted()
    })
  })

  context('Train Dialog', () => {
    it('Create an error in an existing Train Dialog', () => {
      train.EditTraining('My entity: XXYYZZ', 'My entity: XXYYZZ', 'Your entity contains: $entity')
      train.TypeYourMessage('xxx')
      train.ClickScoreActionsButton()
      train.SelectTextAction('Something extra')
      train.SelectChatTurnExactMatch('xxx')
      train.ClickDeleteChatTurn()
    })

    // This is where the bug in the UI occured...
    // Bug 2191: CRASH: Modifying Train Dialog to contain an error causes UI to throw an error
    it('Save Train Dialog and verify it is in the grid.', () => {
      train.SaveAsIsVerifyInGrid()
    })
  })
})
