import * as helpers from './Helpers.js'
import * as modelPage from './components/ModelPage'

declare global {
  namespace Cypress {
    interface Chainable {
      UploadFile: typeof uploadFile
      ConLog: () => Chainable
      WaitForStableDOM: () => Chainable
      WaitForTrainingStatusCompleted: () => Chainable
      Enqueue: typeof enqueue
    }
  }
}

// **********************************************************************************************
// OTHER cy.* COMMANDS are defined in MonitorDocumentChanges.js
// They are defined there so as to have access to the correct instance 
// of the MillisecondsSinceLastChange function.
// **********************************************************************************************


// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

Cypress.Commands.add("ConLog", (funcName, message) => { helpers.ConLog(funcName, message) })

// fileName must exist with cypress\fixtures folder
const uploadFile = (fileName: string, selector: string) => {
  cy.get(selector).then(elements => {
    cy.fixture(fileName).then((content) => {
      const element = elements[0] as HTMLInputElement
      const testFile = new File([content], fileName)
      const dataTransfer = new DataTransfer()

      dataTransfer.items.add(testFile)
      element.files = dataTransfer.files
      
      // https://github.com/cypress-io/cypress/issues/3730
      // Deal with Chrome v73 issue that was not uploading the files until we add the following line of code.
      // Also needed to force the trigger since Cypress won't normally do that on an element that is not visible.
      // Also the {force: true} part fails on the Electron Browser, so do this for Chrome only.
      if (Cypress.browser.name === 'chrome') { cy.wrap(elements).trigger('change', {force: true}) }
    })
  })
}

Cypress.Commands.add('UploadFile', uploadFile)

// These functions operates similar to the "cy.contains" command except that it expects
// the text content of the elements to contain an EXACT MATCH to the expected text.
Cypress.Commands.add('ExactMatch', { prevSubject: 'element' }, (elements, expectedText) => { 
  const matchingElements = helpers.ExactMatch(elements, expectedText)
  if (matchingElements.length == 0) { throw new Error(`Exact Match '${expectedText}' NOT Found`) }
  return matchingElements
})

Cypress.Commands.add('ExactMatches', { prevSubject: 'element' }, (elements, expectedText) => { return helpers.ExactMatches(elements, expectedText) })

Cypress.Commands.add("WaitForTrainingStatusCompleted", () => {
  cy.log('WaitForTrainingStatusCompleted')
  cy.Enqueue(() => {
    let trainingStatus = new modelPage.TrainingStatus()
    cy.wrap(1, { timeout: 120000 }).should(() => { return trainingStatus.WaitForCompleted() })
  })
})

Cypress.Commands.add("Alert", message => { alert(message) })

// Use this to enqueue regular JavaScript code into the Cypress process queue.
// This causes your JavaScript code to execute in the same time frame as all of cy.*commands*
const enqueue = (functionToRun: Function) => { return functionToRun() }
Cypress.Commands.add("Enqueue", enqueue)
