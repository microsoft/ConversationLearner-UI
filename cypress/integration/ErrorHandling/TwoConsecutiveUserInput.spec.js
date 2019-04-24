/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../support/Models'
import * as modelPage from '../../support/components/ModelPage'
import * as train from '../../support/Train'
import * as trainDialogsGrid from '../../support/components/TrainDialogsGrid'
import * as common from '../../support/Common'

describe('ErrorHandling', () => {
  it('Two Consecutive User Input', () => {
    models.ImportModel('z-2UserInputs', 'z-disqualifyngEnt.Trained.cl')
    modelPage.NavigateToTrainDialogs()
    cy.WaitForTrainingStatusCompleted()

    modelPage.VerifyNoIncidentTriangleOnPage()

    train.EditTraining('Hey', 'world peace', "Sorry $name, I can't help you get $want")
    train.InsertUserInputAfter('Sam', 'InsertedText')
    train.VerifyErrorMessage(common.trainDialogHasErrorsMessage)
    train.SelectChatTurnExactMatch('Sam')
    train.VerifyErrorMessage('Two consecutive User Inputs')

    train.ClickSaveCloseButton()

    modelPage.VerifyIncidentTriangleForTrainDialogs()
    trainDialogsGrid.VerifyIncidentTriangleFoundInTrainDialogsGrid(`Hey`, 'world peace', "Sorry $name, I can't help you get $want")

    // - - - Open the same Train Dialog, validate and fix the errors. - - -

    train.EditTraining(`Hey`, 'world peace', "Sorry $name, I can't help you get $want")
    train.VerifyErrorMessage(common.trainDialogHasErrorsMessage)
    train.SelectChatTurnExactMatch('Sam')
    train.VerifyErrorMessage('Two consecutive User Inputs')
    train.SelectChatTurnExactMatch('InsertedText')
    train.ClickDeleteChatTurn()
    train.VerifyNoErrorMessage()

    train.ClickSaveCloseButton()
    modelPage.VerifyNoIncidentTriangleOnPage()
  })
})