/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const helpers = require('../support/helpers.js')
const document = require('../support/document.js')

function endlessLoop() {while(true);}
Cypress.Commands.add("endlessLoop", endlessLoop)

describe('zExperiments', function () 
{
    it('Experiment', () => 
    {
        console.log(`Function Name: ${helpers.Caller()}`)
        // cy.server()
        // cy.route('GET', '/sdk/apps?**').as('getApps')
        // cy.visit('http://localhost:5050')
        // cy.wait('@getApps')
        // console.log('Experiment 1')
        // //cy.endlessLoop()
        // console.log('Experiment 2')

        // console.log(`Before Sleep was Called: ${helpers.NowAsString()}`)
        // helpers.sleep(50).then(() => { console.log(`After Sleep Finished Executing: ${helpers.NowAsString()}`)})
        // console.log(`After Sleep was Called: ${helpers.NowAsString()}`)
    })
})

