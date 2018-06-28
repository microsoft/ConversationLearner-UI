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

Cypress.Commands.add("setup", () => { 
  cy.viewport(1440, 900);
  Cypress.config("defaultCommandTimeout", 5000)
  Cypress.config("taskTimeout", 80000)
  Cypress.config("pageLoadTimeout", 80000)
  Cypress.config("requestTimeout", 15000)
  Cypress.config("responseTimeout", 60000)
})

Cypress.Commands.add("teardown", () => { 
  //Restoring Cypress default values
  Cypress.config("defaultCommandTimeout", 4000)
  Cypress.config("taskTimeout", 60000)
  Cypress.config("pageLoadTimeout", 60000)
  Cypress.config("requestTimeout", 5000)
  Cypress.config("responseTimeout", 30000)
  cy.clearLocalStorage();
})
