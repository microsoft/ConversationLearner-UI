/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../support/Models'
import * as modelPage from '../../support/components/ModelPage'
import * as memoryTableComponent from '../../support/components/MemoryTableComponent'
import * as scorerModal from '../../support/components/ScorerModal'
import * as train from '../../support/Train'
import * as editDialogModal from '../../support/components/EditDialogModal'
import * as common from '../../support/Common'

describe('Train', () => {
  it('Whats Your Name', () => {
    models.ImportModel('z-whatsYourName', 'z-whatsYourName.cl')

    modelPage.NavigateToTrainDialogs()
    cy.WaitForTrainingStatusCompleted()
    train.CreateNewTrainDialog()

    train.TypeYourMessage('Hello')
    editDialogModal.ClickScoreActionsButton()
    scorerModal.VerifyContainsEnabledAction(common.whatsYourName)
    scorerModal.VerifyContainsDisabledAction('Hello $name')
    train.SelectAction(common.whatsYourName)

    train.TypeYourMessage('David')
    editDialogModal.VerifyEntityLabel('David', 'name')
    editDialogModal.ClickScoreActionsButton()
    memoryTableComponent.VerifyEntityInMemory('name', ['David'])
    scorerModal.VerifyContainsDisabledAction(common.whatsYourName)
    scorerModal.VerifyContainsEnabledAction('Hello David')
    train.SelectAction('Hello David', 'Hello $name')

    train.Save()

    // Manually EXPORT this to fixtures folder and name it 'z-myNameIs.cl'
  })
})