/// <reference types="Cypress" />

const testSelectors = {
    common: {
        spinner: '.cl-spinner',
    },
    models: {
        create: '[data-testid=model-list-create-new-button]',
        name: '[data-testid=model-creator-input-name]',
        submit: '[data-testid=model-creator-submit-button]',
    },
    model: {
        navTrainDialogs: '[data-testid=app-index-nav-link-train-dialogs]',
    },
    trainDialogs: {
        buttonNew: '[data-testid="button-new-train-dialog"]',
    },
    trainDialog: {
        inputWebChat: 'input[placeholder="Type your message..."]',
        buttonAbandon: '[data-testid="edit-dialog-modal-abandon-delete-button"]',
    },
    acceptCancel: {
        accept: '[data-testid="confirm-cancel-modal-accept"]',
    },
    entityModal: {
        name: '[data-testid="entity-creator-entity-name-text"]',
        buttonCreate: '[data-testid="entity-creator-button-save"]',
    },
    extractionEditor: {
        overlay: '.entity-labeler-overlay',
    },
    entityPicker: {
        inputSearch: '[data-testid="entity-picker-entity-search"]',
        buttonNew: '[data-testid="entity-picker-entity-search"]',
        options: '.custom-toolbar .custom-toolbar__results'
    }
}

const testConstants = {
    spinner: {
        timeout: 120000,
    },
    prediction: {
        timeout: 60000,
    },
    events: {
        selectWord: 'Test_SelectWord',
    }
}

describe('EntityPicker', () => {
    describe('new model', () => {
        const testData = {
            modelName: `z-entityPicker-${Cypress.moment().format('MM-d-mm-ss')}`,
            entity1: 'myEntity',
            word1: `input`
        }
        const modelName = 

        before(() => {
            cy.visit('http://localhost:5050')

            cy.get(testSelectors.common.spinner, { timeout: testConstants.spinner })
                .should('not.exist')

            // Create model
            cy.get(testSelectors.models.create)
                .click()

            cy.get(testSelectors.models.name)
                .type(modelName)

            cy.get(testSelectors.models.submit)
                .click()

            cy.get(testSelectors.common.spinner, { timeout: testConstants.spinner })
                .should('not.exist')

            // navigate to train dialogs
            cy.get(testSelectors.model.navTrainDialogs)
                .click()

            // create dialog
            cy.get(testSelectors.trainDialogs.buttonNew)
                .click()

            // insert text
            cy.get(testSelectors.trainDialog.inputWebChat)
                .type('my input{enter}')

            cy.wait(500)
        })

        afterEach(() => {
            // close picker
        })

        after(() => {
            cy.get(testSelectors.common.spinner, { timeout: testConstants.spinner })
                .should('not.exist')

            cy.get(testSelectors.trainDialog.buttonAbandon)
                .click()

            cy.get(testSelectors.acceptCancel.accept)
                .click()
        })

        it('should open with 0 entities in the list', () => {
            // select word
            cy.get('body')
                .trigger(testConstants.events.selectWord, { detail: testData.word1 })

            // verify empty search text
            cy.get(testSelectors.entityPicker.inputSearch)
                .should('have.text', '')

            // verify no options
            cy.get(testSelectors.entityPicker.options)
                .should('have.length', 1)

            cy.get(testSelectors.extractionEditor.overlay)
                .click()
        })

        it('should auto labeled the newly created entity', () => {
            // select word
            cy.get('body')
                .trigger(testConstants.events.selectWord, { detail: testData.word1 })

            // click create new entity
            cy.get(testSelectors.entityPicker.buttonNew)
                .click()

            // enter entity name
            cy.get(testSelectors.entityModal.name)
                .type(entity1)

            cy.get(testSelectors.entityModal.buttonCreate)
                .click()

            // verify word is labeled
            cy.get('.cl-entity-node--custom')
                .contains('.cl-entity-node--custom', 'input')
                .find('.cl-entity-node-indicator')
                    .contains('myEntity')
        })

        it('should open with previously created entity in options', () => {
            // select word2
            // verify list has entity
        })


        it('should still list entity even if it is used', () => {
            // remove label
            // select word2
            // verify list has entity
        })

        describe('controls', () => {
            it('when pressing tab it should select the highlighted entity', () => {
                // select word3
                // press tab into search
                // press tab again to select entity
            })

            it('when pressing enter it should select the highlighted entity', () => {
                // select word4
                // press tab into search
                // press enter again to select entity
            })

            describe('arrow keys', () => {
                it('when pressing down arrow it should move the highlight down', () => {

                })

                it('when pressing down arrow and the end it should rotate to the top', () => {

                })

                it('when pressing up arrow it should move the highlight up', () => {

                })

                it('when pressing up arrow and the top it should rotate to the bottom', () => {

                })
            })
        })
    })

    // Should work the same for new model but it makes it easier to text searching with a bunch of entities
    describe('existing model', () => {
        before(() => {
            // import model
        })

        describe('searching', () => {
            before(() => {
                // create dialog
                // input text
            })

            it('given a search input of X should highlighted characters X in the word', () => {
                // select word
                // tab into search
                // type into search
                // verify bold characters match search characters
            })

            it('should filter the list of entities to those matching search term', () => {
                // select word2
                // tab into search
                // type
                // verify list shrinks
            })
        })
    })
})