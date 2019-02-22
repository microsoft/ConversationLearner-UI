const helpers = require('./Helpers.js')
const modelPage = require('./components/ModelPage')

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
Cypress.Commands.add('UploadFile', (fileName, selector) => {
  cy.get(selector).then(elements => {
    cy.fixture(fileName).then((content) => {
      const element = elements[0]
      const testFile = new File([content], fileName)
      const dataTransfer = new DataTransfer()

      dataTransfer.items.add(testFile)
      element.files = dataTransfer.files
    })
  })
})

// This function operates similar to the "cy.contains" command except that it expects
// the text content of the elements to contain an EXACT MATCH to the expected text.
Cypress.Commands.add('ExactMatch', { prevSubject: 'element' }, (elements, expectedText) => {
  helpers.ConLog(`ExactMatch('${expectedText}')`, `Start`)
  for (let i = 0; i < elements.length; i++) {
    let elementText = elements[i].textContent
    helpers.ConLog(`ExactMatch('${expectedText}')`, `elementText: '${elementText}'`)
    if (elementText === expectedText) return elements[i]
  }
  throw `Exact Match '${expectedText}' NOT Found`
})

Cypress.Commands.add('ExactMatches', { prevSubject: 'element' }, (elements, expectedText) => {
  helpers.ConLog(`ExactMatches('${expectedText}')`, `Start`)
  let returnElements = []
  for (let i = 0; i < elements.length; i++) {
    let elementText = elements[i].textContent
    helpers.ConLog(`ExactMatches('${expectedText}')`, `elementText: '${elementText}'`)
    if (elementText === expectedText) returnElements.push(elements[i])
  }
  return returnElements
})

Cypress.Commands.add("WaitForTrainingStatusCompleted", () => {
  // The cy.get call made within modelPage.WaitForTrainingStatusCompleted() needs
  // the document object which is why we need to wrap it.
  cy.log('WaitForTrainingStatusCompleted')
  cy.wrap(cy.document, { timeout: 120000 }).should(() => { return modelPage.WaitForTrainingStatusCompleted() })
})

Cypress.Commands.add("Alert", message => { alert(message) })

// Use this to enqueue regular JavaScript code into the Cypress process queue.
// This causes your JavaScript code to execute in the same time frame as all of cy.*commands*
Cypress.Commands.add("Enqueue", functionToRun => { return functionToRun() })

