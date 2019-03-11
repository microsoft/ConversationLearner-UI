/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../support/Models'
import * as modelPage from '../../support/components/ModelPage'
import * as scorerModal from '../../support/components/ScorerModal'
import * as train from '../../support/Train'
import * as editDialogModal from '../../support/components/EditDialogModal'

describe('EditAndBranching', () => {
  it('Branching', () => {
    models.ImportModel('z-branching', 'z-nameTrained.cl')
    modelPage.NavigateToTrainDialogs()
    cy.WaitForTrainingStatusCompleted()

    train.EditTraining('My name is David.', 'My name is Susan.', 'Hello $name')
    train.CaptureOriginalChatMessages()

    train.BranchChatTurn('My name is Susan.', 'My name is Joseph.')
    cy.wait(5000)
    editDialogModal.ClickScoreActionsButton('Hello $name')
    scorerModal.VerifyChatMessage('Hello Joseph')
    train.CaptureEditedChatMessages()
    cy.wait(30000)
    train.Save()

    train.EditTraining('My name is David.', 'My name is Susan.', 'Hello $name')
    train.VerifyOriginalChatMessages()
    editDialogModal.ClickSaveCloseButton()

    train.EditTraining('My name is David.', 'My name is Joseph.', 'Hello $name')
    train.VerifyEditedChatMessages()
    editDialogModal.ClickSaveCloseButton()
  })
})