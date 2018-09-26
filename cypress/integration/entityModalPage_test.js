/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/
const actions = require('../support/components/actionspage')
const actionsModal = require('../support/components/actionsmodal')
const entities = require('../support/components/entitiespage')
const entityModal = require('../support/components/entitymodal')
const modelsListPage = require('../support/components/modelsList')
const modelPage = require('../support/components/modelPage')
const logDialogPage = require('../support/components/logdialogspage')
const scorerModal = require('../support/components/scorermodal')
const trainDialogPage = require('../support/components/traindialogspage')
const editDialogModal = require('../support/components/editdialogmodal')

describe('Entities creation test', function () {
  const momentSeconds = Cypress.moment().format("MMMDD-HHmmSSS")
  const modelName = `e2e-entities-${momentSeconds}`
  const customEntity01 = "programmaticonlyentity"
  const customEntity02 = "multivaluedentity"
  const customEntity03 = "negatable-entity"

  afterEach(function () {
    const fileName = `entities_${this.currentTest.state}-${this.currentTest.title}`
    cy.wait(3000)
      .screenshot(fileName)
  })

  it('create a new model', function () {
    modelsListPage.navigateTo()
    modelsListPage.createNewModel(modelName)
    modelPage.verifyPageTitle(modelName)
  })

  it('should be able to create a custom and builtin entities', function () {
    modelPage.navigateToEntities()

    // Create custom programmatic entity
    entities.clickButtonNewEntity()
    entityModal.typeEntityName(customEntity01)
    entityModal.clickOnProgrammaticOnly()
    entityModal.clickCreateButton()
    cy.wait(3000)

    // Create multi-value entity 
    entities.clickButtonNewEntity()
    entityModal.typeEntityName(customEntity02)
    entityModal.clickOnMultiValue()
    entityModal.clickCreateButton()
    cy.wait(3000)

    // Create negatable entity
    entities.clickButtonNewEntity()
    entityModal.typeEntityName(customEntity03)
    entityModal.clickOnNegatable()
    entityModal.clickCreateButton()
    cy.wait(3000)

    // Verify that the entities has been added
    cy.get('.ms-DetailsRow-cell')
      .should('contain', customEntity01)
      .and('contain', customEntity02)
      .and('contain', customEntity03)
  })

  it('should delete an existent model', () => {
    modelsListPage.navigateTo();
    modelsListPage.deleteModel(modelName);
  })
})
