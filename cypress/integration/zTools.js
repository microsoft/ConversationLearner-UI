/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
* Licensed under the MIT License.
*/

//import * as document from '../support/document'
const document = require('../support/document.js')

describe('zTools', function () 
{
    it('Delete All Applications', () => 
    {
        cy.server()
        cy.route('GET', '/sdk/apps?**').as('getApps')
        cy.visit('http://localhost:5050')
        cy.wait('@getApps')

        cy.get('[data-automationid="DetailsList"] > [role="grid"]')
            .then((gridElement) => { return gridElement.attr('aria-rowcount') })
            .then((rowCountStr) => 
            {
                expect(rowCountStr).to.not.be.undefined

                // The header is counted as a row so deduct one for it.
                let rowCount = +rowCountStr - 1
                console.log(`Number of rows to remove: ${rowCount}`)

                for(var i = 0; i < rowCount; i++)
                {
                    cy.waitForStableDom(1000)
                
                    cy.get('[data-list-index="0"] > .ms-FocusZone > .ms-DetailsRow-fields')
                        .find('i[data-icon-name="Delete"]')
                        .click()
                        .then((subject) => { console.log('Click has been completed.') })

                    cy.get('.ms-Dialog-main')
                        .contains('Confirm')
                        .click()
                        .then((subject) => { console.log('Delete has been completed.') })
                }
            })
    })
})
