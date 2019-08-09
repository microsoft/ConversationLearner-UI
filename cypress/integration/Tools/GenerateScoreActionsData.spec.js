/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../support/Models'
import * as modelPage from '../../support/components/ModelPage'
import * as scorerModal from '../../support/components/ScorerModal'
import * as actions from '../../support/Actions'
import * as train from '../../support/Train'
import * as helpers from '../../support/Helpers'

describe('Generate Score Actions Data - Tools', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)

  context('Setup', () => {
    it('Should import a model to test against', () => {
      models.ImportModel('z-generateSAData', 'z-scoreActions.cl')
      modelPage.NavigateToTrainDialogs()
      cy.WaitForTrainingStatusCompleted()
    })
  })

  context('Using Existing Score Actions', () => {
    it('Should edit an existing Train Dialog', () => {
      train.EditTraining('Hello', 'I love oranges!', 'Oranges are petty amazing!')
    })
    
    it('Should Generate Scored Actions Data', () => {
      train.SelectChatTurnExactMatch('What fruits do you like?')
      scorerModal.GenerateScoreActionsDataFromGrid()
    })
  })
})
