/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../support/Models'
import * as modelPage from '../../support/components/ModelPage'
import * as train from '../../support/Train'
import * as editDialogModal from '../../support/components/EditDialogModal'

describe('EditAndBranching', () => {
  it('Add End Session Action', () => {
    models.ImportModel('z-sydneyFlight', 'z-sydneyFlight.cl')

    modelPage.NavigateToTrainDialogs()

    cy.WaitForTrainingStatusCompleted()

    train.EditTraining('fly to sydney', 'coach', "enjoy your trip. you are booked on Qantas")
    editDialogModal.ClickScoreActionsButton()
    editDialogModal.SelectChatTurnExactMatch('enjoy your trip. you are booked on Qantas', 1)
    train.SelectEndSessionAction('0')

    editDialogModal.VerifyScoreActionsButtonIsMissing()
    editDialogModal.VerifyTypeYourMessageIsMissing()
    editDialogModal.ClickSaveCloseButton()
  })
})