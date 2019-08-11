/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../../support/Models'
import * as modelPage from '../../../support/components/ModelPage'
import * as scorerModal from '../../../support/components/ScorerModal'
import * as actions from '../../../support/Actions'
import * as train from '../../../support/Train'
import * as helpers from '../../../support/Helpers'

it.GENERATE = (testTitle, testFunction) => {
  //it(testTitle, testFunction)
}

describe('Review Existing - Score Actions', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)

  context('Setup', () => {
    it('Should import a model to test against', () => {
      models.ImportModel('z-reviewExisting', 'z-scoreActions.cl')
      modelPage.NavigateToTrainDialogs()
      cy.WaitForTrainingStatusCompleted()
    })
  })

  context('Review Existing Score Actions', () => {
    it('Should edit an existing Train Dialog', () => {
      train.EditTraining('Hello', 'I love oranges!', 'Oranges are petty amazing!')
    })
    
    it('Select a chat turn to be verified', () => {
      train.SelectChatTurnExactMatch('What fruits do you like?')
    })

    it.GENERATE('GENERATE the test data and persist to a JSON file', () => {
      cy.WaitForStableDOM().then(() => {
        const scoreActionsData = scorerModal.GenerateScoreActionsDataFromGrid()
        cy.writeFile('cypress/fixtures/scoreActions/scoreActions.json', scoreActionsData)
      })      
    })
  
    it('VERIFY the test data', () => {
      cy.readFile('cypress/fixtures/scoreActions/scoreActions.json').then(scoreActionsData => {
        scorerModal.VerifyScoreActions(scoreActionsData)
      })
    })
  })
})
