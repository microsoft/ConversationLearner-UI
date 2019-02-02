/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

var testCaseRegistry = [];
var indexRegistry = 0;
var logEntries = '';

// Override the original console.log() function
var originalConsolLog = console.log;

// This becomes the effective console.log() function.
console.log = function (message) {
  originalConsolLog.apply(console, arguments);
  logEntries += message + '\r\n';
};

// This will be called by the test list manager to register each test case
// in the order the tests will be run in.
Cypress.RegisterTestCase = (testGroupName, testName) => {
  testCaseRegistry.push(`${testGroupName}/${testName}`);
}

// After each test case ends...
afterEach(() => {
  var logFileName = `./results/cypress/${testCaseRegistry[indexRegistry++]}.${Cypress.moment().format("YY.MM.DD.HH.mm.ss..SSS")}.log`;
  cy.writeFile(logFileName, logEntries);  
  logEntries = '';
});

function GetTestCaseName()
{
  // Cypress.spec.name looks something like this: "Tools\VisitHomePage.js"
  var jsExtensionLength = '.js'.length;
  return Cypress.spec.name.substring(0, Cypress.spec.name.length - jsExtensionLength);
}