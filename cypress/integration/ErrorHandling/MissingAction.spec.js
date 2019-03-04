/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../support/Models'
import * as modelPage from '../../support/components/ModelPage'
import * as train from '../../support/Train'
import * as editDialogModal from '../../support/components/EditDialogModal'
import * as common from '../../support/Common'
import * as actions from '../../support/Actions'
import * as scorerModal from '../../support/components/ScorerModal'

describe('ErrorHandling', () => {
  it('Missing Action', () => {
    models.ImportModel('z-missingAction', 'z-whatsYourName.cl')
    modelPage.NavigateToTrainDialogs()
    cy.WaitForTrainingStatusCompleted()

    modelPage.VerifyNoErrorIconOnPage()

    train.CreateNewTrainDialog()

    train.TypeYourMessage(common.gonnaDeleteAnAction)
    editDialogModal.ClickScoreActionsButton()
    train.SelectAction(common.whatsYourName)
    
    train.Save()

    modelPage.NavigateToActions()
    actions.DeleteAction(common.whatsYourName)
    modelPage.NavigateToTrainDialogs()

    modelPage.VerifyErrorIconForTrainDialogs()
    train.VerifyErrorsFoundInTraining(`${common.errorIconCharacter}${common.gonnaDeleteAnAction}`, common.gonnaDeleteAnAction, undefined)

    train.EditTraining(`${common.errorIconCharacter}${common.gonnaDeleteAnAction}`, common.gonnaDeleteAnAction, undefined)

    editDialogModal.VerifyErrorMessage(trainDialogHasErrorsMessage)

    editDialogModal.SelectChatTurnStartsWith('ERROR: Can’t find Action Id')
    editDialogModal.VerifyErrorMessage('Action does not exist')
    scorerModal.VerifyMissingActionNotice()

    scorerModal.ClickAddActionButton()
    actions.CreateNewAction({ response: common.whatsYourName, expectedEntities: 'name' })

    editDialogModal.VerifyNoErrorMessage()

    editDialogModal.ClickSaveCloseButton()
    modelPage.VerifyNoErrorIconOnPage()
  })
})