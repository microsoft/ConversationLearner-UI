/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/
const { convLearnerPage,
    modelpage,
    entities,
    entityModal,
    actions,
    actionsModal,
    trainDialogPage,
    trainDialogModal,
    scorerModal,
    logDialogPage,
    logDialogModal,
    testLog } = components();

describe('Entities creation test', function () {
    const postfix = Cypress.moment().format("MMMDD-HHmm")
    const modelName = `e2e-entities-${postfix}`
    const customEntity01 = "programmaticonlyentity"
    const customEntity02 = "multivaluedentity"
    const customEntity03 = "negatable-entity"

    beforeEach(function () {
        testLog.logTestHeader(this.currentTest.title);
        cy.viewport(1600, 900);
        // starts the listener
        cy.on('uncaught:exception', (err, runnable) => {
            testLog.logError(err);
            return false;
        })
    })

    afterEach(function () {
        testLog.logResult(this.currentTest);
        const fileName = `entities_${this.currentTest.state}-${this.currentTest.title}`;
        cy.wait(3000)
            .screenshot(fileName);
    })

    after(function() {
        cy.clearLocalStorage();
        cy.end();
    })

    /** FEATURE: New Model */
    it('create a New Model', function () {
        convLearnerPage.navigateTo();
        convLearnerPage.createNewModel(modelName);
        modelpage.verifyPageTitle(modelName);
    })

    /** FEATURE: Custom entity creation */
    it('should be able to create a custom and builtin entities', function () {

        modelpage.navigateToEntities();
        // programagic only entity creation 
        entities.clickButtonNewEntity();
        entityModal.typeEntityName(customEntity01);
        entityModal.clickOnProgrammaticOnly();
        entityModal.clickCreateButton();
        
        //multi-value entity creation 
        entities.clickButtonNewEntity();
        entityModal.typeEntityName(customEntity02);
        entityModal.clickOnMultivalue();
        entityModal.clickCreateButton();

        //negatable entity creation
        entities.clickButtonNewEntity();
        entityModal.typeEntityName(customEntity03);
        entityModal.clickOnNegatable();
        entityModal.clickCreateButton();

        // Verify that the entity has been added
        cy.get('.ms-DetailsRow-cell')
            .should('contain', customEntity01)
            .and('contain', customEntity02)
            .and('contain', customEntity03);    
    })

    /** FEATURE: Delete a Model */
    it('should delete an existent model', () => {
        convLearnerPage.navigateTo();
        convLearnerPage.deleteModel(modelName);
    })
})

function components() {
    const actions = require('../support/components/actionspage');
    const actionsModal = require('../support/components/actionsmodal');
    const convLearnerPage = require('../support/components/homepage');
    const entities = require('../support/components/entitiespage');
    const entityModal = require('../support/components/entitymodal');
    const modelpage = require('../support/components/modelpage');
    const logDialogPage = require('../support/components/logdialogspage');
    const logDialogModal = require('../support/components/logdialogmodal');
    const scorerModal = require('../support/components/scorermodal');
    const trainDialogPage = require('../support/components/traindialogspage');
    const trainDialogModal = require('../support/components/traindialogmodal');
    const testLog = require('../support/utils/testlog');
    return { convLearnerPage, modelpage, entities, entityModal, actions, actionsModal, trainDialogPage, trainDialogModal, scorerModal, logDialogPage, logDialogModal, testLog };
}
