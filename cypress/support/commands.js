import { createPartiallyEmittedExpression } from "typescript";

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

Cypress.Commands.add('ExactContent', { prevSubject: 'element'}, (elements, content) => 
{   
  for(var i = 0; i < elements.length; i++)
  {
    //helpers.Dump(`ExactContent [${i}]`, elements[i])
    if(elements[i].innerText == content) 
    {
      //helpers.ConLog('ExactContent', `Found Element[${i}]: ${elements[i].innerText}`)
      return elements[i]
    }
  }
  //helpers.ConLog('ExactContent', `NOT Found: ${content}`)
  return cy.contains(`Exact Content '${content}' NOT Found`)
})

