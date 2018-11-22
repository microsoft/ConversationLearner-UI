/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const homePage = require('../../support/components/HomePage')
const helpers = require('../../support/Helpers')

describe('Tools', () => { it('Delete All Models', DeleteAllModels) })

export function DeleteAllModels()
{
    homePage.Visit()

    // We must "Enqueue" this function call so that Cypress will have one "Cypress Command" 
    // still running when the DeleteAllRows function exits. If not for this, only one row will
    // get deleted then test execution will stop.
    cy.Enqueue(DeleteAllRows).then(() => { helpers.ConLog(`Delete All Models`, `DONE - All Applications have been Deleted`) })
}

function DeleteAllRows()
{
    function _DeleteTopRow(resolve)
    {
        var thisFuncName = `_DeleteTopRow`
        homePage.GetModelListRowCount().then((rowCount) =>
        {
            helpers.ConLog(thisFuncName, `Number of Rows Remaining: ${rowCount}`)
            if (rowCount == 0)
            {
                helpers.ConLog(thisFuncName, `DONE (nothing to delete)`)
                resolve()
                return
            }

            homePage.ClickDeleteModelButton(0)
            homePage.ClickConfirmButton().then(() =>
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
