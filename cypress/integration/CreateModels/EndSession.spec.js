/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../support/Models'
import * as modelPage from '../../support/components/ModelPage'
import * as actions from '../../support/Actions'
import * as train from '../../support/Train'
import * as trainDialogsGrid from '../../support/components/TrainDialogsGrid'
import * as helpers from '../../support/Helpers'

const preliminaryTrainingDescription = 'Preliminary Training to cause some expected behaviors in future Train Dialogs'

describe('End Session - Create Model', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)
  
  context('Should create a new model', () => {
    it('Create a model to test against', () => {
      models.CreateNewModel('z-EndSession')
    })

    it('Should create three Actions', () => {
      actions.CreateNewActionThenVerifyInGrid({ response: "Hello" })
      actions.CreateNewActionThenVerifyInGrid({ response: "Okay" })
      actions.CreateNewActionThenVerifyInGrid({ type: 'END_SESSION', response: "Goodbye" })
    })
  })

  context('1st Train Dialog', () => {
    it('Should create a new Train Dialog', () => {
      modelPage.NavigateToTrainDialogs()
      cy.WaitForTrainingStatusCompleted()
      train.CreateNewTrainDialog()
    })

    it('Should train model to respond to "Hi"', () => {
      train.TypeYourMessage('Hi')
      train.ClickScoreActionsButton()
      train.SelectAction('Hello')
    })

    it('Should train model to respond to "Yo"', () => {
      train.TypeYourMessage('Yo')
      train.ClickScoreActionsButton()
      train.SelectAction('Okay')
    })
    
    it('Should add a description and save the Train Dialog', () => {
      train.TypeDescription(preliminaryTrainingDescription)
      train.Save()
    })

    // IMPORTANT! - Keep this stage of the test here before we add in the End Session Bot response.
    // There was a bug where the End Session Bot response caused the edited TD to lose its description and be saved
    // as a second TD rather than overwriting the edited TD and retaining the description as it should have done.
    it('Should be able to edit the training that we just saved and find the description we gave it', () => {
      cy.WaitForTrainingStatusCompleted()
      train.EditTraining('Hi', 'Yo', 'Okay')
      train.VerifyDescription(preliminaryTrainingDescription)
    })

    it('Should train model to respond to "Bye"', () => {
      train.TypeYourMessage('Bye')
      train.ClickScoreActionsButton()
      train.SelectEndSessionAction('Goodbye')
    })

    it('Verify that selecting the EndSession Bot response did not remove the description', () => {
      train.VerifyDescription(preliminaryTrainingDescription)
    })

    it('Should save the Train Dialog and verifies that we still have only 1 Train Dialog and that the description persisted', () => {
      train.Save()
      trainDialogsGrid.VerifyDescriptionForRow(0, preliminaryTrainingDescription)
    })
  })

  context('2nd Train Dialog', () => {
    it('Should create another Train Dialog', () => {
      cy.WaitForTrainingStatusCompleted()
      train.CreateNewTrainDialog()
    })

    it('Should train model to respond to "Yo"', () => {
      train.TypeYourMessage('Yo')
      train.ClickScoreActionsButton()
      train.SelectAction('Okay')
    })
    
    it('Should train model to respond to "Bye"', () => {
      train.TypeYourMessage('Bye')
      train.ClickScoreActionsButton()
      train.SelectEndSessionAction('Goodbye')
    })

    it('Should save the Train Dialog', () => {
      train.Save()
    })
  })
})
