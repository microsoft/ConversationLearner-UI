/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as helpers from '../../support/Helpers'

// To get this to work edit the ConversationLearner-UI\cypress.json file and put an X in front of "baseUrl"
// Remember to undo that change before checking in or running other tests.
//
// NOTE: You will need to manually interact with the UI for the status to change.
//
// I tried running cypress via this command line but it did not work:
//    node_modules\.bin\cypress open --config baseurl= 
describe('Training Status Tester Using Mock Page', () => {
  it('Visit the Mock Page', () => {
    cy.visit('cypress/support/MockTrainingStatus.html')
  })

  it('Wait for Traning Status Complete', () => {
    cy.WaitForTrainingStatusCompleted()
  })
})