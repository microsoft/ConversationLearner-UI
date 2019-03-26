/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as helpers from '../../support/Helpers'
import * as models from '../../support/Models'
import * as modelPage from '../../support/components/ModelPage'
import * as logDialogsGrid from '../../support/components/LogDialogsGrid'
import * as logDialogModal from '../../support/components/LogDialogModal'
import * as common from '../../support/Common'

let names = ['Joseph', 'Maria', 'Arjuna', 'Sam', 'Tina', 'Peter', 'Jeevan', 'Nikita', 'Alex', 'Lisa', 'Antonio', 'Anitha', 'Carmen', 'Sheila', 'Pablo', 'Martha', 'Diego', 'Tanya', 'Sasha', 'Aditya', 'Deepak']

describe("Loop What's Your Name - Log", () => {
  const maxIterationsToRun = 50
  context('Setup', () => {
    it('Should import model, navigate to Log Dialogs and wait for training status to complete', () => {
      models.ImportModel('z-logMyName', 'z-nameTrained.cl')
      modelPage.NavigateToLogDialogs()
      cy.WaitForTrainingStatusCompleted()
    })
  })

  context(`Repeat Test ${maxIterationsToRun} Times`, () => {
    for(let i = 0; i < maxIterationsToRun; i ++) {
      context(`Iteration #${i + 1}`, () => {
        // If one of these fails, we need to reload the page so we are at a good starting point again.
        afterEach(function() { if (this.currentTest.state === 'failed') { cy.reload() } })
        afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)

        it('Should create a new log dialog', () => {
          logDialogsGrid.CreateNewLogDialogButton()
        })

        it('Should say Hello and receive simple Bot response', () => {
          logDialogModal.TypeYourMessageValidateResponse('Hello', common.whatsYourName)
        })

        const name = names[i % names.length]
        const userUtterance = `My name is ${name}`
        const botResponse = `Hello ${name}`

        it(`Should say, "${userUtterance}" and receive Bot response, "${botResponse}"`, () => {
          logDialogModal.TypeYourMessageValidateResponse(userUtterance, botResponse)
        })
        
        it('Should complete the log dialog', () => {
          logDialogModal.ClickDoneTestingButton()
        })
      })
    }
  })
})