/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const helpers = require('../support/helpers.js')
const document = require('../support/document.js')

Cypress.Commands.add("WaitForStableDomP", (millisecondsWithoutChange) => {return document.WaitForStableDomP(millisecondsWithoutChange)})//.then((retVal) => {return retVal})})

function endlessLoop() {while(true);}
Cypress.Commands.add("endlessLoop", endlessLoop)

var promiseCountDTR = 0;
function DeleteTopRow()
{
    var thisPromiseCount = ++promiseCountDTR;
    console.log(`${helpers.NowAsString()} - DeleteTopRow(${thisPromiseCount}) - Start`)

    return new Promise((resolve) =>
    {
        console.log(`${helpers.NowAsString()} - DeleteTopRow(${thisPromiseCount}) - Promise created`)
        cy.get('[data-automationid="DetailsList"] > [role="grid"]')
        .then((gridElement) => { return gridElement.attr('aria-rowcount') })
        .then((rowCountStr) => 
        {
            console.log(`${helpers.NowAsString()} - DeleteTopRow(${thisPromiseCount}) - Grid is initialized but not ready`)
            expect(rowCountStr).to.not.be.undefined
            var tempTime = helpers.NowAsString()
            expect(tempTime).to.not.be.undefined

            // The header is counted as a row so deduct one for it.
            let rowCount = +rowCountStr - 1
            console.log(`${helpers.NowAsString()} - Number of Rows Remaining: ${rowCount}`)
            if (rowCount == 0)
            {
                console.log(`${helpers.NowAsString()} - DONE DeleteTopRow (nothing to delete): ${thisPromiseCount}`)
                resolve()
                return
            }

            cy.WaitForStableDomP(1000).then(() =>
            {
                console.log(`${helpers.NowAsString()} - DeleteTopRow - WaitForStableDomP has completed: ${thisPromiseCount}`)

                cy.get('[data-list-index="0"] > .ms-FocusZone > .ms-DetailsRow-fields')
                    .find('i[data-icon-name="Delete"]')
                    .click()
                    .then((subject) => { console.log('Click has been completed.') })

                cy.get('.ms-Dialog-main')
                    .contains('Confirm')
                    .click()
                    .then((subject) => { console.log('Delete has been completed.') })
                    .then(() => 
                    {
                        if(rowCount > 1)
                        {
                            console.log(`${helpers.NowAsString()} - next DeleteTopRow: ${thisPromiseCount}`)
                            DeleteTopRow().then(resolve)
                        }
                        else
                        {
                            console.log(`${helpers.NowAsString()} - DONE DeleteTopRow (just finished deleting last row): ${thisPromiseCount}`)
                            resolve()
                        }
                    })
            })
        })
    })
}

describe('zExperiment', function () 
{
    it('Delete All Applications', () => 
    {
        cy.server()
        // TODO: cy.route({method:'GET', url:'/sdk/apps?**', status: 500, response: {statusText: '500 NOT ok'}, onResponse: (xhr) => {if (xhr.status != 200) throw(`${xhr.statusText}`)}}).as('getApps')
        cy.route('GET', '/sdk/apps?**').as('getApps')
        cy.visit('http://localhost:5050')
        cy.wait('@getApps')
        
        DeleteTopRow().then(() =>
        {
            console.log(`${helpers.NowAsString()} - DONE Delete All Applications`)    
        })
    })
})


/*
describe('zExperiments', function () 
{
    it('Experiment', () => 
    {
        cy.server()
        cy.route('GET', '/sdk/apps?**').as('getApps')
        cy.visit('http://localhost:5050')
        cy.wait('@getApps')
        console.log('Experiment 1')
        cy.endlessLoop()
        console.log('Experiment 2')

        console.log(`Before Sleep: ${new Date().getMilliseconds()}`)
        //helpers.sleep(50).then(() => { console.log(`After Sleep: ${new Date().getMilliseconds()}`)})
        helpers.sleep(50)
        console.log(`After Sleep: ${new Date().getMilliseconds()}`)
    })
})
*/
