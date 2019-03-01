/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as homePage from '../../support/components/HomePage'
import * as models from '../../support/Models'
import * as modelPage from '../../support/components/ModelPage'
import * as logDialogsGrid from '../../support/components/LogDialogsGrid'
import * as logDialogModal from '../../support/components/LogDialogModal'
import * as helpers from '../../support/Helpers'

describe('Log', () => {
  it('Endless Loop', () => {
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
  })
})

// This version of the test does not get very far before the Bot chokes.
// Once the Bot's errors are fixed then we can re-visit this test case.
function EndlessLoopX() {
  cy.Enqueue(() =>
  {
    return new Promise((resolve) => {
      let modelNames = []
      //models.ImportModel('z-endlessLoop', 'z-endlessLoop.cl').then(modelName => {modelNames.push(modelName)})
      models.ImportModel('z-endlessLoop', 'z-endlessLoop.cl').then(modelName => {
        modelNames.push(modelName)
        helpers.ConLog(`EndlessLoop`, `Models: ${modelNames}`)

        let messages = ['one', 'two', 'three', 'ONE', 'TWO', 'THREE']
        let modelIndex = 0
        let loopIndex = 0
        function LogDialogChat() {
          helpers.ConLog(`EndlessLoop(modelIndex: ${modelIndex}, loopIndex: ${loopIndex})`, `Start`)
          modelPage.NavigateToLogDialogs()
          cy.WaitForTrainingStatusCompleted()
          logDialogsGrid.CreateNewLogDialogButton()

          for (let i = 0; i < 3; i++) {
            let message = messages[i + (modelIndex * 3)]
            logDialogModal.TypeYourMessage(`${message} loopIndex: ${loopIndex}`)
            cy.ConLog(`EndlessLoop(modelIndex: ${modelIndex}, loopIndex: ${loopIndex})`, `${message} loopIndex: ${loopIndex}`)
            cy.wait(2000)
          }
          logDialogModal.ClickDoneTestingButton()//.then(() =>
          cy.wait(30000).then(() => {
            helpers.ConLog(`EndlessLoop(modelIndex: ${modelIndex}, loopIndex: ${loopIndex})`, `Done waiting after test end.`)

            loopIndex++
            if (loopIndex >= 6) return resolve()

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

