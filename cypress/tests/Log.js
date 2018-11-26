/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const models = require('../support/Models')
const modelPage = require('../support/components/ModelPage')
const logDialogsGrid = require('../support/components/LogDialogsGrid')
const logDialogModal = require('../support/components/LogDialogModal')

export function WhatsYourName()
{
  var modelName = models.ImportModel('z-logMyName', 'z-nameTrained.cl')

  modelPage.NavigateToLogDialogs()
  cy.WaitForTrainingStatusCompleted()

  logDialogsGrid.CreateNewLogDialogButton()

  logDialogModal.TypeYourMessage("Hello", "What's your name?")

  logDialogModal.ClickDoneTestingButton()
}
