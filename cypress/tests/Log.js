/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const homePage = require('../support/components/HomePage')
const models = require('../support/Models')
const modelPage = require('../support/components/ModelPage')
const logDialogsGrid = require('../support/components/LogDialogsGrid')
const logDialogModal = require('../support/components/LogDialogModal')

export function WhatsYourName()
{
  models.ImportModel('z-logMyName', 'z-nameTrained.cl')

  modelPage.NavigateToLogDialogs()
  cy.WaitForTrainingStatusCompleted()
  logDialogsGrid.CreateNewLogDialogButton()

  logDialogModal.TypeYourMessageValidateResponse("Hello", "What's your name?")

  logDialogModal.ClickDoneTestingButton()
}

export function EndlessLoop()
{
  var modelName = new Array()
  modelName.push(models.ImportModel('z-endlessLoop', 'z-endlessLoop.cl'))
  modelName.push(models.ImportModel('z-endlessLoop', 'z-endlessLoop.cl'))

  var messages = ['one', 'two', 'three', 'ONE', 'TWO', 'THREE']
  var modelIndex = 1
  var loopIndex = 0
  while(true)
  {
    modelPage.NavigateToLogDialogs()
    cy.WaitForTrainingStatusCompleted()
    logDialogsGrid.CreateNewLogDialogButton()
  
    for (var i = 0; i < 3; i++)
    {
      var message = messages[i + (modelIndex * 3)]
      logDialogModal.TypeYourMessage(`${message} loopIndex: ${loopIndex}`)
    }
    logDialogModal.ClickDoneTestingButton()

    loopIndex ++
    if (loopIndex >= 6) break;

    modelIndex = (modelIndex + 1) % 2
    homePage.NavigateToModelPage(modelName[modelIndex])
  }

  
  homePage.NavigateToModelPage(modelName1)


}