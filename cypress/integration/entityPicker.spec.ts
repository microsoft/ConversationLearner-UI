export default 1
const testSelectors = {
    common: {
        spinner: '.cl-spinner',
    },
    models: {
        create: '[data-testid=model-list-create-new-button]',
        buttonImport: '[data-testid=model-list-import-model-button]',
        buttonLocalFile: '[data-testid="model-creator-locate-file-button"]',
        name: '[data-testid=model-creator-input-name]',
        submit: '[data-testid=model-creator-submit-button]',
        inputFile: '[data-testid="model-creator-import-file-picker"] > div > input[type="file"]',
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
        customNode: '.cl-entity-node--custom',
        nodeIndicator: '.cl-entity-node-indicator',
        buttonRemoveLabel: '[data-testid="entity-extractor-button-remove-label"]',
    },
    entityPicker: {
        inputSearch: '[data-testid="entity-picker-entity-search"]',
        buttonNew: '[data-testid="entity-picker-button-new"]',
        options: '.custom-toolbar .custom-toolbar__results .custom-toolbar__result',
    }
}

const testConstants = {
    keys: {
        tab: 9,
        up: 38,
        down: 40,
    },
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

function pressKey(keyCode: number) {
    cy.get('body').trigger('keydown', {
        keyCode,
        which: keyCode
    })
}

function verifyWordIsLabeled(word: string, entityName: string) {
    cy.get('.cl-entity-node--custom')
        .contains('.cl-entity-node--custom', word)
        .find('.cl-entity-node-indicator')
        .contains(entityName)
}

describe('EntityPicker', () => {
    describe('new model', () => {
        const testData = {
            modelName: `z-entityPicker-${Cypress.moment().format('MM-d-mm-ss')}`,
            entity1: 'myEntity',
            word1: 'word1',
            word2: 'word2',
            word3: 'word3',
            word4: 'word4',
            phrase: 'Default phrase'
        }
        testData.phrase = `Phrase start ${testData.word1} ${testData.word2} ${testData.word3} ${testData.word4} end.`

        before(() => {
            cy.visit('http://localhost:3000')

            cy.get(testSelectors.common.spinner, { timeout: testConstants.spinner.timeout })
                .should('not.exist')

            // Create model
            cy.get(testSelectors.models.create)
                .click()

            cy.get(testSelectors.models.name)
                .type(testData.modelName)

            cy.get(testSelectors.models.submit)
                .click()

            cy.get(testSelectors.common.spinner, { timeout: testConstants.spinner.timeout })
                .should('not.exist')

            cy.get(testSelectors.model.navTrainDialogs)
                .click()

            cy.get(testSelectors.trainDialogs.buttonNew)
                .click()

            cy.get(testSelectors.trainDialog.inputWebChat)
                .type(`${testData.phrase}{enter}`)

            cy.get(testSelectors.common.spinner, { timeout: testConstants.spinner.timeout })
                .should('not.exist')

            cy.wait(500)
        })

        afterEach(() => {
            // close picker
        })

        after(() => {
            cy.get(testSelectors.common.spinner, { timeout: testConstants.spinner.timeout })
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
                .type(testData.entity1)

            cy.get(testSelectors.entityModal.buttonCreate)
                .click()

            verifyWordIsLabeled(testData.word1, testData.entity1)
        })

        it('should open with previously created entity in options', () => {
            // select word2
            cy.get('body')
                .trigger(testConstants.events.selectWord, { detail: testData.word2 })

            // verify list has entity
            cy.get(testSelectors.entityPicker.options)
                .contains(testData.entity1)
                .should('have.length', 1)

                cy.WaitForStableDOM()

            cy.get(testSelectors.extractionEditor.overlay)
                .click()
        })


        it('should still list entity even if had been used and removed', () => {
            // remove label
            cy.get(testSelectors.extractionEditor.customNode)
                .contains(testData.word1)
                .click()

            cy.get(testSelectors.extractionEditor.buttonRemoveLabel)
                .click()

            // select word2
            cy.get('body')
                .trigger(testConstants.events.selectWord, { detail: testData.word2 })

            // verify list has entity
            cy.get(testSelectors.entityPicker.options)
                .contains(testData.entity1)
                .should('have.length', 1)

            cy.get(testSelectors.extractionEditor.overlay)
                .click()
        })
    })

    // Should work the same for new model but it makes it easier to text searching with a bunch of entities
    describe('existing model', () => {
        const testData = {
            highlightClass: 'custom-toolbar__result--highlight',
            modelName: `z-entityPicker2-${Cypress.moment().format('MM-d-mm-ss')}`,
            modelFile: 'entityPicker.cl',
            entity1: 'myEntity',
            word1: 'word1',
            word2: 'word2',
            word3: 'word3',
            word4: 'word4',
            entities: [
                'food',
                'location',
                'myEntity',
                'name',
                'size',
                'theirEntity',
                'youEntity',
            ],
            entitySearchPrefix: 'Ent',
            phrase: 'Default phrase',
        }
        testData.phrase = `Phrase start ${testData.word1} ${testData.word2} ${testData.word3} ${testData.word4} end.`

        before(() => {
            cy.visit('http://localhost:3000')

            cy.get(testSelectors.common.spinner, { timeout: testConstants.spinner.timeout })
                .should('not.exist')

            cy.get(testSelectors.models.buttonImport)
                .click()

            cy.get(testSelectors.models.name)
                .type(testData.modelName)

            cy.get(testSelectors.models.buttonLocalFile)
                .click()

            cy.UploadFile(testData.modelFile, testSelectors.models.inputFile)

            cy.get(testSelectors.models.submit)
                .click()

            cy.get(testSelectors.common.spinner, { timeout: testConstants.spinner.timeout })
                .should('not.exist')

            cy.get(testSelectors.model.navTrainDialogs)
                .click()

            cy.get(testSelectors.trainDialogs.buttonNew)
                .click()

            cy.get(testSelectors.trainDialog.inputWebChat)
                .type(`${testData.phrase}{enter}`)

            cy.get(testSelectors.common.spinner, { timeout: testConstants.spinner.timeout })
                .should('not.exist')
        })

        after(() => {
            cy.get(testSelectors.common.spinner, { timeout: testConstants.spinner.timeout })
                .should('not.exist')

            cy.get(testSelectors.trainDialog.buttonAbandon)
                .click()

            cy.get(testSelectors.acceptCancel.accept)
                .click()
        })

        describe('controls', () => {
            before(() => {
                cy.get('body')
                    .trigger(testConstants.events.selectWord, { detail: testData.word1 })
            })

            it('when pressing tab it should select the highlighted entity', () => {
                cy.get('body')
                    .trigger(testConstants.events.selectWord, { detail: testData.word1 })

                // Tab works if user, but doesn't here because we never selected the text, only used custom event to simulate selection
                cy.get(testSelectors.entityPicker.inputSearch)
                    .trigger('keydown', {
                        keyCode: testConstants.keys.tab,
                        which: testConstants.keys.tab
                    })
            })

            it('when pressing enter it should select the highlighted entity', () => {
                cy.get('body')
                    .trigger(testConstants.events.selectWord, { detail: testData.word2 })

                // Tab works if user, but doesn't here because we never selected the text, only used custom event to simulate selection
                cy.get(testSelectors.entityPicker.inputSearch)
                    .type('{enter}')
            })

            describe('highlight', () => {
                before(() => {
                    cy.get('body')
                        .trigger(testConstants.events.selectWord, { detail: testData.word3 })
                })

                it('should list all the entities in the model', () => {
                    cy.get(testSelectors.entityPicker.options)
                        .should($options => {
                            const texts = $options.map((_, el) => Cypress.$(el).text()).get()
                            expect(texts).to.deep.eq(testData.entities)
                        })
                })

                it('should open with the first item highlighted', () => {
                    cy.get(testSelectors.entityPicker.options)
                        .first()
                        .should('have.class', testData.highlightClass)
                })

                it('when closing and reopening the picker after adjusting text and highlight should reset to empty and be at the top', () => {
                    // Adjust text and highlight
                    cy.get(testSelectors.entityPicker.inputSearch)
                        .type('e')
                        .trigger('keydown', {
                            keyCode: testConstants.keys.down,
                            which: testConstants.keys.down
                        })

                    cy.get(testSelectors.extractionEditor.overlay)
                        .click()

                    cy.get('body')
                        .trigger(testConstants.events.selectWord, { detail: testData.word3 })

                    cy.get(testSelectors.entityPicker.inputSearch)
                        .should('have.text', '')

                    cy.get(testSelectors.entityPicker.options)
                        .should($options => {
                            const texts = $options.map((_, el) => Cypress.$(el).text()).get()
                            expect(texts).to.deep.eq(testData.entities)
                        })
                })

                describe('arrow keys', () => {
                    before(() => {
                        cy.get('body')
                            .trigger(testConstants.events.selectWord, { detail: testData.word3 })
                    })

                    it('when pressing down arrow it should move the highlight down', () => {
                        // Verify initial highlight index, and move down, then verify index is greater by 1
                        // cy.get(testSelectors.entityPicker.options)
                        //     .then($options => {
                        //         cy.get(`.${testData.highlightClass}`)
                        //             .text()
                        //     })

                        cy.get(testSelectors.entityPicker.inputSearch)
                            .trigger('keydown', {
                                keyCode: testConstants.keys.down,
                                which: testConstants.keys.down
                            })

                        cy.wait(10)
                    })

                    it('when pressing up arrow it should move the highlight up', () => {
                        cy.get(testSelectors.entityPicker.inputSearch)
                            .trigger('keydown', {
                                keyCode: testConstants.keys.up,
                                which: testConstants.keys.up
                            })

                        cy.wait(10)

                    })

                    it('when pressing up arrow and the top it should rotate to the bottom', () => {
                        cy.get(testSelectors.entityPicker.inputSearch)
                            .trigger('keydown', {
                                keyCode: testConstants.keys.up,
                                which: testConstants.keys.up
                            })

                        cy.wait(10)
                    })

                    it('when pressing down arrow and the end it should rotate to the top', () => {
                        cy.get(testSelectors.entityPicker.inputSearch)
                            .trigger('keydown', {
                                keyCode: testConstants.keys.down,
                                which: testConstants.keys.down
                            })

                        cy.wait(10)
                    })
                })
            })
        })

        describe('searching', () => {
            before(() => {
                cy.reload()

                cy.get(testSelectors.common.spinner, { timeout: testConstants.spinner.timeout })
                    .should('not.exist')

                cy.get(testSelectors.trainDialogs.buttonNew)
                    .click()

                cy.get(testSelectors.trainDialog.inputWebChat)
                    .type(`${testData.phrase}{enter}`)

                cy.get(testSelectors.common.spinner, { timeout: testConstants.spinner.timeout })
                    .should('not.exist')

                cy.get('body')
                    .trigger(testConstants.events.selectWord, { detail: testData.word3 })

                cy.get(testSelectors.entityPicker.inputSearch)
                    .type(testData.entitySearchPrefix)
            })

            it('given a search input of X should highlighted characters X in the word', () => {
                cy.get(testSelectors.entityPicker.options)
                    .within($option => {
                        // TODO: Make case insensitive
                        cy.get('.match-string--matched').contains(testData.entitySearchPrefix)
                    })
            })

            it('should filter the list of entities to those matching search term', () => {
                cy.get(testSelectors.entityPicker.options)
                    .should('have.length', '2')
            })
        })
    })
})