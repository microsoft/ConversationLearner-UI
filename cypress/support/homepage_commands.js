/**
 *SUMMARY: Commands related to the iteraction with the home page.
 */

/** Navigate to Conversation Learner application */
Cypress.Commands.add("launch_ConversationLearnerApp", () => {
  cy.server()
  cy.route('GET', '/apps?**').as('getHomePage')
  // Open application
  cy.visit('http://localhost:5050')
  cy.wait('@getHomePage')
})

 /** Creates a New Model */
Cypress.Commands.add("cl_model_createnew", (newModelName) => {
  cy.on('uncaught:exception', (err, runnable) => {
    return false
  })
  
  // Click the button to create app
  cy.get('[data-testid="apps-list-button-create-new"]')
    .click()

  // Ensure that name input is focused
  cy.focused()

  cy
    .get('[data-testid="app-create-input-name"]')
    .type(newModelName)

    // Click the submit button
  cy
    .get('[data-testid="app-create-button-submit"]')
    .click()
})