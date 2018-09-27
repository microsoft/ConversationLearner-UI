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

import './document.js'
const document = require('../support/document.js')
Cypress.Commands.add("WaitForStableDom", (millisecondsWithoutChange) => {return document.WaitForStableDom(millisecondsWithoutChange)})

import './helpers'
const helpers = require('../support/helpers.js')
Cypress.Commands.add("ConLog", (funcName, message) => {helpers.ConLog(funcName, message)})

import './MonitorDocumentChanges'
const MonitorDocumentChanges = require('../support/MonitorDocumentChanges.js')
Cypress.Commands.add('Get', (selector) => 
{ 
  helpers.ConLog(`cy.Get()`, `Start - Last DOM change was ${MonitorDocumentChanges.MillisecondsSinceLastChange()} milliseconds ago`)
  cy.wrap({ 'millisecondsSinceLastChange': MonitorDocumentChanges.MillisecondsSinceLastChange}).invoke('millisecondsSinceLastChange').should('gte', 700).then(() => {
  helpers.ConLog(`cy.Get()`, `DOM Is Stable`)
  cy.get(selector)
})})

