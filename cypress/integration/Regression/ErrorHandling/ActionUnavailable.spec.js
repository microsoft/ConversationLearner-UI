/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../../support/Models'
import * as modelPage from '../../../support/components/ModelPage'
import * as chatPanel from '../../../support/components/ChatPanel'
import * as trainDialogsGrid from '../../../support/components/TrainDialogsGrid'
import * as train from '../../../support/Train'
import * as entityDetectionPanel from '../../../support/components/EntityDetectionPanel'
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
      modelPage.VerifyNoErrorTriangleOnPage()
      trainDialogsGrid.TdGrid.CreateNewTrainDialog()
    })

    it('Add user turn "Joe" and label it as the "name" entity', () => {
      train.TypeYourMessage('Joe')
      entityDetectionPanel.LabelTextAsEntity('Joe', 'name')
    })

    it('Score Actions to train the Bot to respond with "Hello Joe"', () => {
      train.ClickScoreActionsButton()
      train.SelectTextAction('Hello Joe')
    })

    it('Introduce an error in the Bot response by removing the entity label from "Joe"', () => {
      chatPanel.SelectChatTurnExactMatch('Joe')
      entityDetectionPanel.RemoveEntityLabel('Joe', 'name')
      train.ClickSubmitChangesButton()
    })

    it('Verify the general message appears and the chat turn is marked with error colors', () => {
      train.VerifyErrorMessage(common.trainDialogHasErrorsMessage)
      chatPanel.VerifyChatTurnHasError(1)
    })

    it('Verify the specifics of the error on the turn', () => {
      chatPanel.SelectChatTurnStartsWith('Hello')
      train.VerifyErrorMessage('Action is unavailable')
      chatPanel.VerifyChatTurnIsAnExactMatch('Hello [$name]', 2, 1)
    })

    it('Save the training with errors', () => {
      train.ClickSaveCloseButton()
      modelPage.VerifyErrorTriangleForTrainDialogs()
      trainDialogsGrid.VerifyIncidentTriangleFoundInTrainDialogsGrid(`Joe`, 'Joe', "Hello $name", '', '', 1)
    })
  })

  context('Edit Dialog - Validate Errors and Fix Them', () => {
    it('Edit the training and verify it has errors', () => {
      trainDialogsGrid.TdGrid.EditTrainingByChatInputs(`Joe`, 'Joe', "Hello $name")
      train.VerifyErrorMessage(common.trainDialogHasErrorsMessage)
      chatPanel.SelectChatTurnStartsWith('Hello')
      train.VerifyErrorMessage('Action is unavailable')
      chatPanel.VerifyChatTurnIsAnExactMatch('Hello [$name]', 2, 1)
    })

    it('Fix the user turn that caused the error', () => {
      chatPanel.SelectChatTurnExactMatch('Joe')
      entityDetectionPanel.LabelTextAsEntity('Joe', 'name')
      train.ClickSubmitChangesButton()
    })

    it('Verify that there are no more errors', () => {
      chatPanel.VerifyChatTurnHasNoError(1)
      train.VerifyNoErrorMessage()
      train.ClickSaveCloseButton()
      modelPage.VerifyNoErrorTriangleOnPage()
    })
  })
})