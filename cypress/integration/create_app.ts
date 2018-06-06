describe('Create application', function () {
  const newAppName = `e2e-app-${new Date().getTime()}`

  it('should create new application with random name and verify name on application page', function () {
    cy.server()
    
    // Open application
    cy.visit('http://localhost:5050')

    cy.route('GET', '/apps?**').as('getApps')
    cy.wait('@getApps')

    // Click the button to create app
    cy
      .get('[data-testid="apps-list-button-create-new"]', { timeout: 1000 })
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
    cy.server()
    
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

    // cy.route('POST', '/app/**/entities**').as('postEntity')
    // cy.wait('@postEntity')

    // Ensure new row is added to entities list with new entity name
    cy.get('.ms-DetailsRow-cell')
      .contains(newEntityName)
  })

  it('given application create a new action', () => {
    cy.server()
    
    // Click actions navigation tab
    cy.get('.cl-nav-link')
      .contains('Actions') // TODO: Use better selector?
      .click()

    // Click new action button
    cy.get('[data-testid="actions-button-create"]')
      .click()

    // Select name for actions
    cy.get('.editor-container [contenteditable="true"]')
      .type("some payload")
      .type("{shift}{enter}")

    // cy.route('POST', '/app/**/actions**').as('postAction')
    // cy.wait('@postAction')
  })

  it('given application delete application', () => {
    // Click my apps to go back to home
    cy.get('.cl-nav_section')
      .find('a[href="/home"]')
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
