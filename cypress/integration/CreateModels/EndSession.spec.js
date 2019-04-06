/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../support/Models'
import * as modelPage from '../../support/components/ModelPage'
import * as actions from '../../support/Actions'
import * as editDialogModal from '../../support/components/EditDialogModal'
import * as train from '../../support/Train'
import * as helpers from '../../support/Helpers'

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
      editDialogModal.ClickScoreActionsButton()
      train.SelectAction('Hello')
    })

    it('Should train model to respond to "Yo"', () => {
      train.TypeYourMessage('Yo')
      editDialogModal.ClickScoreActionsButton()
      train.SelectAction('Okay')
    })
    
    it('Should train model to respond to "Bye"', () => {
      train.TypeYourMessage('Bye')
      editDialogModal.ClickScoreActionsButton()
      train.SelectEndSessionAction('Goodbye')
    })

    it('Should add a description and save the Train Dialog', () => {
      editDialogModal.TypeDescription('Preliminary Training to cause some expected behaviors in future Train Dialogs')
      train.Save()
    })
  })

  context('2nd Train Dialog', () => {
    it('Should create another Train Dialog', () => {
      cy.WaitForTrainingStatusCompleted()
      train.CreateNewTrainDialog()
    })

    it('Should train model to respond to "Yo"', () => {
      train.TypeYourMessage('Yo')
      editDialogModal.ClickScoreActionsButton()
      train.SelectAction('Okay')
    })
    
    it('Should train model to respond to "Bye"', () => {
      train.TypeYourMessage('Bye')
      editDialogModal.ClickScoreActionsButton()
      train.SelectEndSessionAction('Goodbye')
    })

    it('Should save the Train Dialog', () => {
      train.Save()
    })
  })
})
