/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const helpers = require('../support/helpers.js')
//const minMonitor = require('../support/minMonitor')
const minMonitor = require('../support/MonitorDocumentChanges')

describe('zMinTest', function () {
  const postfix = "0925-1838298" //Cypress.moment().format("MMDD-HHmmSSS")
  const modelName = `e2e-expected-${postfix}`
  const entityName = "name"
  const actionResponse01 = "What's your name?"
  const actionResponse02 = "Hello $name"
  const usersName = "David"

  beforeEach(() => { minMonitor.Start() })
  afterEach(() =>  { /*cy.pause();*/ minMonitor.Stop() })

  it('1 should be able to train', () => {
    cy.visit('http://localhost:5050')
    
    cy.Get('button.root-65')//`:contains('e2e-expected-0925-1838298')`)
      .contains(`${modelName}`)
      .Click()

    // 4.1	Click Train Dialogs...
    cy.Get('[data-testid="app-index-nav-link-train-dialogs"]').Click()
  })

  it('2 should be able to train', () => {
    cy.visit('http://localhost:5050')
    
    cy.Get('button.root-65')//`:contains('e2e-expected-0925-1838298')`)
      .contains(`${modelName}`)
      .Click()

    // 4.1	Click Train Dialogs...
    cy.Get('[data-testid="app-index-nav-link-train-dialogs"]').Click()
  })
})
