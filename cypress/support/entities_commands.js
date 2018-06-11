/**
 * SUMMARY:   Entities related commands.
 */

/** Navigate to entities page */
Cypress.Commands.add("navigateTo_Entities", () => {
  cy.get('a[href$="/entities"]').click().wait(1000)
})

/** Create a new entity */
Cypress.Commands.add("entity_createNew", (entityname) => {

  cy.get('[data-testid="entities-button-create"]').click()
    .wait(1000)

  // Enter name for entity
  cy.get('[data-testid="entity-creator-input-name"]')
    .type(entityname).wait(1000)
})

/** Select the submit button to save the new entity*/
Cypress.Commands.add("entity_savechanges", () => {
  cy.on('uncaught:exception', (err, runnable) => {
    return false
  })
  cy.server()
  cy.route('POST', '/app/*/entity').as('postEntity')
  cy.get('[data-testid="entity-creator-button-save"]').click()
  cy.wait('@postEntity')    
})

/** Clicks on multivalue checkbox */
Cypress.Commands.add("entity_clickOnMultivalue", () => {
      cy.get('[data-testid="entity-creator-input-multivalue"]')
        .click()
})