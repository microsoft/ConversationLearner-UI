/**
 * SUMMARY: Commands related to the creation of Train Dialogs.
 * - Scores
 * - WebChat
 * - Entities
 */

/** navitage to train dialogs page */
Cypress.Commands.add("cl_navigateTo_TrainDialogsPage", () => {
  //click on navigation option Train Dialogs
  cy.get('a[href$="/trainDialogs"]')
    .click()
})

/** starts a new train dialog */
Cypress.Commands.add("cl_traindialog_createnew",() => {
  cy.get('[data-testid="button-new-train-dialog"]')
  .click()

})

/** Chat: Types a new user's message */
Cypress.Commands.add("cl_Webchat_NewUserMessage", (trainmessage) => {
  cy.server()
  cy.on('uncaught:exception', (err, runnable) => {
    return false
  })
  cy.route('POST', '/directline/conversations').as('postConv')    
  cy.get('input[class="wc-shellinput"]').type(trainmessage)
  cy.get('label[class="wc-send"]').click()
  cy.wait('@postConv')
})

/** Click on 'Score Action' button */
Cypress.Commands.add("cl_traindialog_proceedToScoreAction", () => {
  cy.server()
  cy.on('uncaught:exception', (err, runnable) => {
    return false
  })
  cy.route('PUT', '/app/*/teach/*/scorer').as('putScorer')    
  cy.get('[data-testid="button-proceedto-scoreactions"]').click()
  cy.wait('@putScorer')
})

/** Selects the first enabled action */
Cypress.Commands.add("cl_ScoredAction_Select", () => {
  cy.server()
  cy.on('uncaught:exception', (err, runnable) => {
    return false
  })
  cy.route('POST', '/app/*/teach/*/scorer').as('postScore')  
  cy.get('[data-testid="actionscorer-buttonClickable"]').click()
  cy.wait('@postScore')
})

/** finalize the training */
Cypress.Commands.add("cl_TrainingSession_Done", () => {
        //finilize the training
        cy.get('[data-testid="teachsession-footer-button-done"]')
        .click()
})