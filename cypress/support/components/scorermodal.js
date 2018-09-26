/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
export function selectAnAction() {
    cy.server()
    cy.route('POST', '/sdk/app/*/teach/*/scorer').as('postScore')

    cy.get('[data-testid="actionscorer-buttonClickable"]')
        .should("be.visible")
        .click()

    cy.wait('@postScore')
        .wait(500)
}

export function selectAnActionWithText(action) {
    //cy.wait(3000)
    // cy.server()
    // cy.route('PUT', '/sdk/app/*/teach/*/scorer').as('putScore')
    // cy.route('GET', '/sdk/app/*/trainingstatus').as('getTrainingStatus')
//204 http://localhost:3978/sdk/app/9be18dbd-d54f-4b7e-a540-331d9a9e9f2f/teach/80c066a4-4720-4369-970c-d2b23e28cdc9/scorer
//200 http://localhost:3978/sdk/app/9be18dbd-d54f-4b7e-a540-331d9a9e9f2f/teach/80c066a4-4720-4369-970c-d2b23e28cdc9/scorer
//204 http://localhost:3978/sdk/app/9be18dbd-d54f-4b7e-a540-331d9a9e9f2f/trainingstatus
//200 http://localhost:3978/sdk/app/9be18dbd-d54f-4b7e-a540-331d9a9e9f2f/trainingstatus
    cy.get('.ms-List-page').should("be.visible").within(() => {
        cy.contains(action)
            .parents('[class*="ms-DetailsRow-fields"]')
            //.find('.ms-Button-label')
            //<button type="button" data-testid="actionscorer-buttonClickable" class="ms-Button ms-Button--primary root-54" aria-labelledby="id__128" aria-describedby="id__130" data-is-focusable="true" tabindex="-1"><div class="ms-Button-flexContainer flexContainer-55"><div class="ms-Button-textContainer textContainer-56"><div class="ms-Button-label label-58" id="id__128" data-cypress-el="true">Select</div></div><span class="ms-Button-screenReaderText screenReaderText-52" id="id__130">Select</span></div></button>
            .find('[data-testid="actionscorer-buttonClickable"]')
            .should("be.visible")
            .click()
    })
    
    // cy.wait(['@putScore', 'getTrainingStatus'])
}
