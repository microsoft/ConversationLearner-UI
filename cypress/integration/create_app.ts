describe('Create application', function () {
  const newAppName = `e2e-app-${new Date().getTime()}`
  
  it('should create new application with random name and verify name on application page', function () {
    // Open application
    cy.visit('http://localhost:5050')

    // Click the button to create app
    cy
      .get('[data-testid="apps-list-button-create-new"]')
      .click()

    // Ensure that name input is focused
    cy.focused()

    cy
      .get('[data-testid="app-create-input-name"]')
      .type(newAppName)
    
    // Click the submit button
    cy
      .get('[data-testid="app-create-button-submit"]')
      .click()

    // Ensure app page displays new application title
    cy
      .get('[data-testid="app-index-title"]')
      .should(el => {
        expect(el).to.contain(newAppName)
      })
  })

  it('given a fresh application, it should create a new entity', () => {
    // Click entities navigation tab
    cy.get('.cl-nav-link')
      .contains('Entities') // TODO: Use better selector?
      .click()

    const newEntityName = `e2e-entity-${new Date().getTime()}`

    // Click new entity button
    cy.get('[data-testid="entities-button-create"]')
      .click()

    // Enter name for entity
    cy.get('[data-testid="entity-creator-input-name"]')
      .type(newEntityName)

    // Select multi-value
    cy.get('[data-testid="entity-creator-input-multivalue"]')
      .click()

    // Select the submit button
    cy.get('[data-testid="entity-creator-button-save"]')
      .click()

    // Ensure new row is added to entities list with new entity name
    cy.get('.ms-DetailsRow-cell')
      .contains(newEntityName)
  })

  it('given application delete application', () => {
    // Click my apps to go back to home
    cy.get('.cl-nav-link')
      .contains('My Apps') // TODO: Use better selector?
      .click()

    cy.contains(newAppName)
      .parents('.ms-DetailsRow-fields')
      .find('i[data-icon-name="Delete"]')
      .click()

    cy.get('.ms-Dialog-main')
      .contains('Confirm')
      .click()
  })
})
