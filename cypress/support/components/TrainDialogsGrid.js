/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

// Path to product code: ConversationLearner-UI\src\routes\Apps\App\TrainDialogs.tsx
export function VerifyPageTitle()                 { cy.Get('[data-testid="train-dialogs-title"]').contains('Train Dialogs') }
export function CreateNewTrainDialog()            { cy.Get('[data-testid="button-new-train-dialog"]').Click()}
export function SearchBox()                       { cy.Get('label[for="traindialogs-input-search"]').contains('input.ms-SearchBox-field') }
export function EntityDropDownFilter()            { cy.Get('[data-testid="dropdown-filter-by-entity"]')}
export function ActionDropDownFilter()            { cy.Get('[data-testid="dropdown-filter-by-action"]')}

export function GetFirstInputs()                  { return StringArrayFromInnerHtml('[data-testid="train-dialogs-first-input"]')}
export function GetLastInputs()                   { return StringArrayFromInnerHtml('[data-testid="train-dialogs-last-input"]')}
export function GetLastResponses()                { return StringArrayFromInnerHtml('[data-testid="train-dialogs-last-response"]')}
export function GetTurns()                        { return NumericArrayFromInnerHtml('[data-testid="train-dialogs-turns"]') }
export function GetLastModifiedDates()            { return StringArrayFromInnerHtml('[data-testid="train-dialogs-last-modified"]')}
export function GetCreatedDates()                 { return StringArrayFromInnerHtml('[data-testid="train-dialogs-created"]')}

const helpers = require('../../support/helpers')

export function StringArrayFromInnerHtml(selector) 
{ 
  var elements = Cypress.$(selector)
  var returnValues = new Array()
  for (var i = 0; i < elements.length; i++) { returnValues.push(elements[i].innerHTML) }
  return returnValues
}

export function NumericArrayFromInnerHtml(selector) 
{ 
  var elements = Cypress.$(selector)
  var returnValues = new Array()
  for (var i = 0; i < elements.length; i++) { returnValues.push(Number(elements[i].innerHTML)) }
  return returnValues
}

// var elements = Cypress.$('[data-testid="train-dialogs-first-input"]'); for (var i = 0; i < elements.length; i++) { console.log(elements[i].innerHTML) }
// $('[data-testid="train-dialogs-turns"]').textContent
// Cypress.$('[data-testid="train-dialogs-turns"]')[1].innerHTML