/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../../support/Models'
import * as modelPage from '../../../support/components/ModelPage'
import * as actions from '../../../support/Actions'
import * as train from '../../../support/Train'
import * as helpers from '../../../support/Helpers'

describe('Wait vs. Non Wait Actions - CreateModels', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)

  context('Setup', () => {
    it('Should create a model to test against', () => {
      models.CreateNewModel('z-waitNoWait')
    })
  })

  context('Create Actions', () => {
    it('Should create 1 Wait Action', () => {
      actions.CreateNewActionThenVerifyInGrid({ response: 'Which animal would you like?' })
    })

    it('Should create 3 Non-Wait Actions', () => {
      actions.CreateNewActionThenVerifyInGrid({ response: 'Cows say moo!', uncheckWaitForResponse: true })
      actions.CreateNewActionThenVerifyInGrid({ response: 'Ducks say quack!', uncheckWaitForResponse: true })
      actions.CreateNewActionThenVerifyInGrid({ response: 'Fish just swim.', uncheckWaitForResponse: true })
    })

    it('Should create 1 END_SESSION Action, try to make it a Non-Wait Action, verify that UI overrides and creates it as a Wait Action', () => {
      actions.CreateNewActionThenVerifyInGrid({ type: 'END_SESSION', response: "That's All Folks.", uncheckWaitForResponse: true })
    })
  })

  context('Train Dialog', () => {
    it('Should create a new Train Dialog', () => {
      modelPage.NavigateToTrainDialogs()
      cy.WaitForTrainingStatusCompleted()
      train.CreateNewTrainDialog()
    })

    it('Should be able to select a Wait action after selecting a Non-Wait Action', () => {
      train.TypeYourMessage('Duck')
      train.ClickScoreActionsButton()
      train.SelectAction('Ducks say quack!')
      train.SelectAction('Which animal would you like?')
    })

    it('Should be able to select a Wait action after selecting a different Non-Wait Action', () => {
      train.TypeYourMessage('Fish')
      train.ClickScoreActionsButton()
      train.SelectAction('Fish just swim.')
      train.SelectAction('Which animal would you like?')
    })

    it('Should be able save the Train Dialog and find it in the grid', () => {
      train.Save()
    })

    // Manually EXPORT this to fixtures folder and name it 'z-waitNoWait.cl'
  })
})