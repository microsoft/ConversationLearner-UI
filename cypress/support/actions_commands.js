/**
 * SUMMARY:   Actions related commands.
 */

 /** Navigate to Actions Page */
Cypress.Commands.add("navigateTo_ActionsPage", () => {
      cy
        .get('a[href$="/actions"]')
        .click()
})

/** Click on create a new action button */
Cypress.Commands.add("cl_Action_CreateNew", () => {
      cy
        .get('[data-testid="actions-button-create"]')
        .click()
})

/** Selects Action Type = Text */
Cypress.Commands.add("cl_Action_SelectTypeText", () => {
      cy
        .get('[data-testid="dropdown-action-type"]')
        .click()
        .click()  
        // TODO: implement a more robust way to select an specific action type.
})

/** Enter action response phrase */
Cypress.Commands.add("cl_Action_Phrase", (actionPhrase) => {
      cy
        .get('div[data-slate-editor="true"]')
        .type(actionPhrase)
})

/** Click on create action button */
Cypress.Commands.add("cl_Action_Create", () => {
      cy.get('[data-testid="actioncreator-button-create"]')
        .click()
})
