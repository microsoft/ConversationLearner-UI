import { createPartiallyEmittedExpression } from "typescript";
const modelPage = require('./components/ModelPage')

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

import './helpers'
const helpers = require('../support/helpers.js')
Cypress.Commands.add("ConLog", (funcName, message) => {helpers.ConLog(funcName, message)})

// fileName must exist with cypress\fixtures folder
Cypress.Commands.add('UploadFile', (fileName, selector) => 
{
  cy.get(selector).then(elements => 
  {
      cy.fixture(fileName).then((content) => 
      {
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
Cypress.Commands.add('ExactMatch', { prevSubject: 'element'}, (elements, expectedText) => 
{   
  for(var i = 0; i < elements.length; i++) if(elements[i].innerText == expectedText) return elements[i]
  return cy.contains(`Exact Match '${expectedText}' NOT Found`)
})

Cypress.Commands.add("WaitForTrainingStatusCompleted", () => 
{ 
  // The cy.get call made within modelPage.WaitForTrainingStatusCompleted() needs
  // the document object which is why we need to wrap it.
  cy.wrap(cy.document, {timeout: 120000}).should(() => {return modelPage.WaitForTrainingStatusCompleted()})
})
