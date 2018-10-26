/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const homePage = require('../../support/components/HomePage')
const trainDialogsGrid = require('../../support/components/TrainDialogsGrid')

/// Description: A temporary workspace for experimental code
describe('zTemp test', () =>
{
  it('zTemp test', () => 
  {
    homePage.Visit()
    cy.pause()

    Cypress.Commands.add("zTemp", () => 
    {
      var turns = trainDialogsGrid.GetTurns()
      console.log(`turns.length: ${turns.length} ${turns}`)
    })
    cy.zTemp()
  })
})
