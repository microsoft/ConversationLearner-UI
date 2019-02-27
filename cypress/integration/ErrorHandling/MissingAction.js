/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const models = require('../../support/Models')
const modelPage = require('../../support/components/ModelPage')
const train = require('../../support/Train')
const editDialogModal = require('../../support/components/EditDialogModal')
const common = require('../../support/Common')
const actions = require('../../support/Actions')
const scorerModal = require('../../support/components/ScorerModal')

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
    train.VerifyErrorsFoundInTraining(`${String.fromCharCode(59412)}${common.gonnaDeleteAnAction}`, common.gonnaDeleteAnAction, undefined)

    train.EditTraining(`${String.fromCharCode(59412)}${common.gonnaDeleteAnAction}`, common.gonnaDeleteAnAction, undefined)

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