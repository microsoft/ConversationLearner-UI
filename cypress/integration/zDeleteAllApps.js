/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const helpers = require('../support/helpers.js')
//const document = require('../support/document.js')

//Cypress.Commands.add("WaitForStableDom", (millisecondsWithoutChange) => {return document.WaitForStableDom(millisecondsWithoutChange)})

var promiseCountDTR = 0;
function DeleteTopRow()
{
    var thisFuncName = `DeleteTopRow()[${++promiseCountDTR}]`
    helpers.ConLog(thisFuncName, `Start`)

    return new Promise((resolve) =>
    {
        helpers.ConLog(thisFuncName, `Promise created`)

        cy.WaitForStableDom(1000).then(() =>
        {
            helpers.ConLog(thisFuncName, `The DOM should now be stable`)

            cy.get('[data-automationid="DetailsList"] > [role="grid"]')
            .then((gridElement) => { return gridElement.attr('aria-rowcount') })
            .then((rowCountStr) => 
            {
                expect(rowCountStr).to.not.be.undefined

                // The header is counted as a row so deduct one for it.
                var rowCount = +rowCountStr - 1
                helpers.ConLog(thisFuncName, `Number of Rows Remaining: ${rowCount}`)
                if (rowCount == 0)
                {
                    helpers.ConLog(thisFuncName, `DONE (nothing to delete)`)
                    resolve()
                    return
                }

                cy.get('[data-list-index="0"] > .ms-FocusZone > .ms-DetailsRow-fields')
                    .find('i[data-icon-name="Delete"]')
                    .click()
                    .then((subject) => { helpers.ConLog(thisFuncName, `Click has been completed.`) })

                cy.get('.ms-Dialog-main')
                    .contains('Confirm')
                    .click()
                    .then((subject) => { helpers.ConLog(thisFuncName, `Delete has been completed.`) })
                    .then(() => 
                    {
                        if(rowCount > 1)
                        {
                            helpers.ConLog(thisFuncName, `NEXT`)
                            DeleteTopRow().then(resolve)
                        }
                        else
                        {
                            helpers.ConLog(thisFuncName, `DONE (just finished deleting last row)`)
                            resolve()
                        }
                    })
            })
        })
    })
}

describe('zDeleteAllApps', function () 
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
            helpers.ConLog(`Delete All Applications Test`, `DONE - All Applications have been Deleted`)    
        })
    })
})
