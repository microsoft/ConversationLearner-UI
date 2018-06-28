
/** Selects Action Type = Text */
function selectTypeText() {
  cy.get('[data-testid="dropdown-action-type"]')
    .should("be.visible")
    .click()
    .click();
  // TODO: implement a more robust way to select an specific action type.
}

/** Enter action response phrase */
function setPhrase(actionPhrase) {
  cy.get('div[data-slate-editor="true"]')
    .should("be.visible")
    .type(actionPhrase);
}

function clickWaitForResponse() {
  cy.get('.ms-Checkbox-text')
    .should("be.visible")
    .click({
      force: true
    });
}

/** Click on create action button */
function clickCreateButton() {
  cy.server();
  cy.route('POST', '/app/*/action').as('postAction');
  cy.route('GET', '/app/*/trainingstatus').as('getTrainingstatus');
  cy.get('[data-testid="actioncreator-button-create"]')
    .should("be.visible")
    .click({
      force: true
    });
  cy.wait('@postAction');
  cy.wait('@getTrainingstatus');
}

export {
  clickWaitForResponse,
  selectTypeText,
  setPhrase,
  clickCreateButton
};