/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../../support/Models'
import * as modelPage from '../../../support/components/ModelPage'
import * as train from '../../../support/Train'
import * as trainDialogsGrid from '../../../support/components/TrainDialogsGrid'
import * as common from '../../../support/Common'
import * as helpers from '../../../support/Helpers'

describe('Action Unavailable - ErrorHandling', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)

  context('Setup', () => {
    it('Create a model to test against', () => {
      models.ImportModel('z-actionUnavail', 'z-whatsYourName.cl')
      modelPage.NavigateToTrainDialogs()
      cy.WaitForTrainingStatusCompleted()
    })
  })

  context('Train Dialog - Create Errors', () => {
    it('Verify there are no Incident Triangles on the page and should create a new Train Dialog', () => {
      modelPage.VerifyNoIncidentTriangleOnPage()
      train.CreateNewTrainDialog()
    })

    it('Should add user turn "Joe" and label it as the "name" entity', () => {
      train.TypeYourMessage('Joe')
      train.LabelTextAsEntity('Joe', 'name')
    })

    it('Should Score Actions to train the Bot to respond with "Hello Joe"', () => {
      train.ClickScoreActionsButton()
      train.SelectTextAction('Hello Joe')
    })

    it('Should introduce an error in the Bot response by removing the entity label from "Joe"', () => {
      train.SelectChatTurnExactMatch('Joe')
      train.RemoveEntityLabel('Joe', 'name')
      train.ClickSubmitChangesButton()
      train.VerifyErrorMessage(common.trainDialogHasErrorsMessage)
    })

    it('Should verify the specifics of the error', () => {
      train.SelectChatTurnStartsWith('Hello')
      train.VerifyErrorMessage('Action is unavailable')
      train.VerifyChatTurnIsAnExactMatch('Hello [$name]', 2, 1)
    })

    it('Should save the training with errors', () => {
      train.ClickSaveCloseButton()
      modelPage.VerifyIncidentTriangleForTrainDialogs()
      trainDialogsGrid.VerifyIncidentTriangleFoundInTrainDialogsGrid(`Joe`, 'Joe', "Hello $name")
    })
  })

  context('Edit Dialog - Validate Errors and Fix Them', () => {
    it('Should edit the training and verify it has errors', () => {
      train.EditTraining(`Joe`, 'Joe', "Hello $name")
      train.VerifyErrorMessage(common.trainDialogHasErrorsMessage)
      train.SelectChatTurnStartsWith('Hello')
      train.VerifyErrorMessage('Action is unavailable')
      train.VerifyChatTurnIsAnExactMatch('Hello [$name]', 2, 1)
    })

    it('Should fix the user turn that caused the error', () => {
      train.SelectChatTurnExactMatch('Joe')
      train.LabelTextAsEntity('Joe', 'name')
      train.ClickSubmitChangesButton()
    })

    it('Should verify that there are no more errors', () => {
      train.VerifyNoErrorMessage()
      train.ClickSaveCloseButton()
      modelPage.VerifyNoIncidentTriangleOnPage()
    })
  })
})