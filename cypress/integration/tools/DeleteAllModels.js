/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const homePage = require('../../support/components/HomePage')
const helpers = require('../../support/helpers.js')

var deleteFinished

function DeleteTopRow()
{
    function _DeleteTopRow(resolve)
    {
        var thisFuncName = `_DeleteTopRow`
        homePage.GetModelListRowCountThen((rowCount) =>
        {
            helpers.ConLog(thisFuncName, `Number of Rows Remaining: ${rowCount}`)
            if (rowCount == 0)
            {
                helpers.ConLog(thisFuncName, `DONE (nothing to delete)`)
                resolve()
                return
            }

            homePage.ClickDeleteModelButton(0)
            homePage.ClickConfirmButton(() =>
            {
                if(rowCount > 1)
                {
                    helpers.ConLog(thisFuncName, `NEXT`)
                    _DeleteTopRow(resolve)
                }
                else
                {
                    helpers.ConLog(thisFuncName, `DONE (just finished deleting last row)`)
                    resolve()
                }
            })
        })
    }
    
    return new Promise((resolve) => { _DeleteTopRow(resolve) })
}

describe('Delete All Models', function () 
{
    it('Delete All Models', () => 
    {
        // This is a necessary convolution so that Cypress will have one "Cypress Command" still running
        // when this function exits. If not for this, only one row will get deleted then test execution 
        // will stop.
        Cypress.Commands.add("DeleteTopRow", () => { DeleteTopRow().then(() => { helpers.ConLog(`Delete All Applications Test`, `DONE - All Applications have been Deleted`) }) })
        
        homePage.Visit()
        cy.DeleteTopRow()
    })
})
