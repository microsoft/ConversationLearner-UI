/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const models = require('../../support/Models')
const modelPage = require('../../support/components/ModelPage')
const logDialogsGrid = require('../../support/components/LogDialogsGrid')
const logDialogModal = require('../../support/components/LogDialogModal')
const common = require('../../support/Common')

describe('Log', () => {
  it(common.whatsYourName, () => {
    models.ImportModel('z-logMyName', 'z-nameTrained.cl')

    modelPage.NavigateToLogDialogs()
    cy.WaitForTrainingStatusCompleted()
    logDialogsGrid.CreateNewLogDialogButton()

    logDialogModal.TypeYourMessageValidateResponse("Hello", common.whatsYourName)

    logDialogModal.ClickDoneTestingButton()
  })
})