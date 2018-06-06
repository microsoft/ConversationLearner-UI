describe('Hello world e2e', function () {
    const newAppName = `e2e-HelloWorld-${new Date().getTime() - 1528151000000}`
    const username = `UserName`
    const action01 = 'Hello World!'
    /**
     * FEATURE: New Model
     */
    it('CREATE NEW MODEL with random name and verify name on application page', function () {
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
  
    /**
     * FEATURE:  New Identity
     */
    it('it should create a NEW ENTITY', () => {
      // Click entities navigation tab
      cy.get('a[href$="/entities"]')
        .click()
  
      // Click new entity button
      cy.get('[data-testid="entities-button-create"]')
        .click()
  
      // Enter name for entity
      cy.get('[data-testid="entity-creator-input-name"]')
        .type(username)
  
      // Select multi-value
      cy.get('[data-testid="entity-creator-input-multivalue"]')
        .click()
  
      // Select the submit button
      cy.get('[data-testid="entity-creator-button-save"]')
        .click()
  
      // Ensure new row is added to entities list with new entity name
      cy.get('.ms-DetailsRow-cell')
        .contains(username)
    })
  
    /**
     * FEATURE: New Action
     */
    it('it should be able to ADD AN ACTION', () => {
  
      // Click actions navigation tab
      cy
        .get('a[href$="/actions"]')
        .click()
  
      // Click new action button
      cy
        .get('[data-testid="actions-button-create"]')
        .click()
  
      // Click Action Type dropdown
      cy
        .get('[data-testid="dropdown-action-type"]')
        .click()
        .click()
  
      // Enter action response phrase: Hello World!
      cy
        .get('div[data-slate-editor="true"]')
        .type(action01)
  
      // Click create button
      cy.get('[data-testid="actioncreator-button-create"]')
        .click()
  
      // Verify that the action has been added
      cy.get('.ms-DetailsRow-cell')
        .contains(action01)
    })
  
    /**
     * FEATURE: Delete a Model
     */
    it('it should delete an existent model', () => {
  
      // Navigating back to home page.
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
  
      cy.end()
    })
  })  