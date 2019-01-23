/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const homePage = require('../support/components/HomePage')
const models = require('../support/Models')
const modelPage = require('../support/components/ModelPage')
const logDialogsGrid = require('../support/components/LogDialogsGrid')
const logDialogModal = require('../support/components/LogDialogModal')
const helpers = require('../support/Helpers')

export function WhatsYourName() {
  models.ImportModel('z-logMyName', 'z-nameTrained.cl')

  modelPage.NavigateToLogDialogs()
  cy.WaitForTrainingStatusCompleted()
  logDialogsGrid.CreateNewLogDialogButton()

  logDialogModal.TypeYourMessageValidateResponse("Hello", "What's your name?")

  logDialogModal.ClickDoneTestingButton()
}

// This Test Case generates the following error:
//    ObjectUnsubscribedError: object unsubscribed
// But it happens at exactly the same time as this error on the Bot:
//
// BotFrameworkAdapter.processActivity(): 500 ERROR - [object Object]
// (node:13900) UnhandledPromiseRejectionWarning: Error: [object Object]
// at BotFrameworkAdapter.<anonymous> (C:\repo\ConversationLearner-Samples\node_modules\botbuilder\lib\botFrameworkAdapter.js:492:23)
// at Generator.throw (<anonymous>)
// at rejected (C:\repo\ConversationLearner-Samples\node_modules\botbuilder\lib\botFrameworkAdapter.js:12:65)
// at process._tickCallback (internal/process/next_tick.js:68:7)
// (node:13900) UnhandledPromiseRejectionWarning: Unhandled promise rejection. This error originated either by throwing inside of an async function without a catch block, or by rejecting a promise which was not handled with .catch(). (rejection id: 8)
export function EndlessLoop() {
  models.ImportModel('z-endlessLoop', 'z-endlessLoop.cl')
  modelPage.NavigateToLogDialogs()
  cy.WaitForTrainingStatusCompleted()
  logDialogsGrid.CreateNewLogDialogButton()

  logDialogModal.TypeYourMessage(`ONE loopIndex: 0`)
  cy.wait(2000)
  // logDialogModal.TypeYourMessage(`TWO loopIndex: 0`)
  // cy.wait(2000)
  // logDialogModal.TypeYourMessage(`THREE loopIndex: 0`)
  // cy.wait(2000)

  logDialogModal.ClickDoneTestingButton()
  cy.wait(30000).then(() => {
    helpers.ConLog(`EndlessLoop()`, `Done waiting after test end.`)
  })
}

// This version of the test does not get very far before the Bot chokes.
// Once the Bot's errors are fixed then we can re-visit this test case.
export function EndlessLoopX() {
  cy.Enqueue(() => {
    return new Promise((resolve) => {
      var modelNames = new Array()
      //models.ImportModel('z-endlessLoop', 'z-endlessLoop.cl').then(modelName => {modelNames.push(modelName)})
      models.ImportModel('z-endlessLoop', 'z-endlessLoop.cl').then(modelName => {
        modelNames.push(modelName)
        helpers.ConLog(`EndlessLoop`, `Models: ${modelNames}`)

        var messages = ['one', 'two', 'three', 'ONE', 'TWO', 'THREE']
        //var modelIndex = 1
        var modelIndex = 0
        var loopIndex = 0
        function LogDialogChat() {
          helpers.ConLog(`EndlessLoop(modelIndex: ${modelIndex}, loopIndex: ${loopIndex})`, `Start`)
          modelPage.NavigateToLogDialogs()
          cy.WaitForTrainingStatusCompleted()
          logDialogsGrid.CreateNewLogDialogButton()

          for (var i = 0; i < 3; i++) {
            var message = messages[i + (modelIndex * 3)]
            logDialogModal.TypeYourMessage(`${message} loopIndex: ${loopIndex}`)
            cy.ConLog(`EndlessLoop(modelIndex: ${modelIndex}, loopIndex: ${loopIndex})`, `${message} loopIndex: ${loopIndex}`)
            cy.wait(2000)
          }
          logDialogModal.ClickDoneTestingButton()//.then(() =>
          cy.wait(30000).then(() => {
            helpers.ConLog(`EndlessLoop(modelIndex: ${modelIndex}, loopIndex: ${loopIndex})`, `Done waiting after test end.`)

            loopIndex++
            if (loopIndex >= 6) return resolve();

            modelIndex = (modelIndex + 1) % 2
            helpers.ConLog(`EndlessLoop(modelIndex: ${modelIndex}, loopIndex: ${loopIndex})`, `Flip Models`)
            homePage.Visit()
            cy.wait(10000)
            homePage.NavigateToModelPage(modelNames[modelIndex]).wait(5000).then(() => { setTimeout(LogDialogChat, 1) })
          })
        }
        LogDialogChat()
      })
    })
  })
}

