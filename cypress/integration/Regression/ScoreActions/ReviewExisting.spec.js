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
    
    it('Should Verify Scored Actions', () => {
      train.SelectChatTurnExactMatch('What fruits do you like?')
      scorerModal.VerifyScoreActions( [
        {
          response: 'Required and Disqualifying',
          type: 'TEXT',
          state: scorerModal.stateEnum.disqualified,
          entities: [
            { name: 'required1', qualifierState: scorerModal.entityQualifierStateEnum.green },
            { name: 'required2', qualifierState: scorerModal.entityQualifierStateEnum.red },
            { name: 'disqualifying1', qualifierState: scorerModal.entityQualifierStateEnum.redStrikeout },
            { name: 'disqualifying2', qualifierState: scorerModal.entityQualifierStateEnum.greenStrikeout },
          ],
          wait: true,
        },
      ])
    })
  })
})
