/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const models = require('../../support/Models')
const modelPage = require('../../support/components/ModelPage')
const logDialogPage = require('../../support/components/logdialogspage')

/// Description: Simple validation of log dialog starting where "My Name Is" training test left off.
/// Verifications: Log Dialog
describe("What's your name", () =>
{
  it('Chat up the bot', () => {
    var modelName = models.ImportModel('Model1-chat', 'Model1-mni.cl')

    modelPage.NavigateToLogDialogs()
    modelPage.WaitForTrainingStatusCompleted()

    logDialogPage.CreateNewLogDialogButton()

    logDialogPage.TypeYourMessage("Hello", "What's your name?")

    logDialogPage.ClickDoneTestingButton()
  })
})
