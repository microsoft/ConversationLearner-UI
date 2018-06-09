/**
 * SUMMARY:   Entities related commands.
 */

/** Add a new Entity from the Entities page */

/** Navigate to entities page */
Cypress.Commands.add("navigateTo_Entities", () => {
  cy.get('a[href$="/entities"]')
  .click()
})

/** Create a new entity */
Cypress.Commands.add("entity_createNew", (entityname) => {
 
  // Click new entity button
  cy.get('[data-testid="entities-button-create"]')
    .click()

  // Enter name for entity
  cy.get('[data-testid="entity-creator-input-name"]')
    .type(entityname)
})

/** Select the submit button to save the new entity*/
Cypress.Commands.add("entity_savechanges", () => {
      cy.get('[data-testid="entity-creator-button-save"]')
        .click()
})

/** Clicks on multivalue checkbox */
Cypress.Commands.add("entity_clickOnMultivalue", () => {
      cy.get('[data-testid="entity-creator-input-multivalue"]')
        .click()
})