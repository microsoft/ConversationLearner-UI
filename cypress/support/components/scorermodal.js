/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
export function selectAnAction() { cy.get('[data-testid="actionscorer-buttonClickable"]').should("be.visible").click() }

// export function selectAnActionWithText(action) {
//     cy.get('.ms-List-page').should("be.visible").within(() => {
//         cy.contains(action)
//             .parents('[class*="ms-DetailsRow-fields"]')
//             //.find('.ms-Button-label')
//             //<button type="button" data-testid="actionscorer-buttonClickable" class="ms-Button ms-Button--primary root-54" aria-labelledby="id__128" aria-describedby="id__130" data-is-focusable="true" tabindex="-1"><div class="ms-Button-flexContainer flexContainer-55"><div class="ms-Button-textContainer textContainer-56"><div class="ms-Button-label label-58" id="id__128" data-cypress-el="true">Select</div></div><span class="ms-Button-screenReaderText screenReaderText-52" id="id__130">Select</span></div></button>
//             .find('[data-testid="actionscorer-buttonClickable"]')
//             .should("be.visible")
//             .click()
//     })
    
//     // cy.wait(['@putScore', 'getTrainingStatus'])
// }

export function clickAction(expectedActionResponse)
{
  cy.Get('[data-testid="actionscorer-responseText"]').contains(expectedActionResponse)
    .parents('div.ms-DetailsRow-fields').find('[data-testid="actionscorer-buttonClickable"]')
    .click()
}

export function verifyContainsDisabledAction(expectedActionResponse)
{
    cy.Get('[data-testid="actionscorer-responseText"]').contains(expectedActionResponse)
    .parents('div.ms-DetailsRow-fields').find('[data-testid="actionscorer-buttonNoClick"]')
    .should('be.disabled')
}

export function verifyEntityInMemory(entityName, entityValue)
{
  cy.Get('[data-testid="entity-memory-name"]').contains(entityName)
  cy.Get('[data-testid="entity-memory-value"]').contains(entityValue)
}