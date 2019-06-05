import * as util from '../support/utilities'
import constants from '../support/constants'
import s from '../support/selectors'

function verifyWordIsLabeled(word: string, entityName: string) {
    cy.get('.cl-entity-node--custom')
        .contains('.cl-entity-node--custom', word)
        .find('.cl-entity-node-indicator')
        .contains(entityName)
}

describe('EntityPicker', () => {
    describe('new model', () => {
        const testData = {
            modelName: util.generateUniqueModelName('entityPicker'),
            entity1: 'myEntity',
            word1: 'word1',
            word2: 'word2',
            word3: 'word3',
            word4: 'word4',
            phrase: 'Default phrase'
        }
        testData.phrase = `Phrase start ${testData.word1} ${testData.word2} ${testData.word3} ${testData.word4} end.`

        before(() => {
            cy.visit('/')

            cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
                .should('not.exist')

            // Create model
            cy.get(s.models.buttonCreate)
                .click()

            cy.get(s.models.name)
                .type(testData.modelName)

            cy.get(s.models.submit)
                .click()

            cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
                .should('not.exist')

            cy.get(s.model.buttonNavTrainDialogs)
                .click()

            cy.get(s.trainDialogs.buttonNew)
                .click()

            cy.get(s.trainDialog.inputWebChat)
                .type(`${testData.phrase}{enter}`)

            cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
                .should('not.exist')

            cy.wait(500)
        })

        afterEach(() => {
            // close picker
        })

        after(() => {
            cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
                .should('not.exist')

            cy.get(s.trainDialog.buttonAbandon)
                .click()

            cy.get(s.confirmCancelModal.buttonConfirm)
                .click()
        })

        it('should open with 0 entities in the list', () => {
            // select word
            cy.get('body')
                .trigger(constants.events.selectWord, { detail: testData.word1 })

            // verify empty search text
            cy.get(s.entityPicker.inputSearch)
                .should('have.text', '')

            // verify no options
            cy.get(s.entityPicker.options)
                .should('have.length', 1)

            cy.get(s.extractionEditor.overlay)
                .click()
        })

        it('should auto labeled the newly created entity', () => {
            // select word
            cy.get('body')
                .trigger(constants.events.selectWord, { detail: testData.word1 })

            // click create new entity
            cy.get(s.entityPicker.buttonNew)
                .click()

            // enter entity name
            cy.get(s.entity.name)
                .type(testData.entity1)

            cy.get(s.entity.buttonSave)
                .click()

            verifyWordIsLabeled(testData.word1, testData.entity1)
        })

        it('should open with previously created entity in options', () => {
            // select word2
            cy.get('body')
                .trigger(constants.events.selectWord, { detail: testData.word2 })

            // verify list has entity
            cy.get(s.entityPicker.options)
                .contains(testData.entity1)
                .should('have.length', 1)

                cy.WaitForStableDOM()

            cy.get(s.extractionEditor.overlay)
                .click()
        })


        it('should still list entity even if had been used and removed', () => {
            // remove label
            cy.get(s.extractionEditor.customNode)
                .contains(testData.word1)
                .click()

            cy.get(s.extractionEditor.buttonRemoveLabel)
                .click()

            // select word2
            cy.get('body')
                .trigger(constants.events.selectWord, { detail: testData.word2 })

            // verify list has entity
            cy.get(s.entityPicker.options)
                .contains(testData.entity1)
                .should('have.length', 1)

            cy.get(s.extractionEditor.overlay)
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
            cy.visit('/')

            cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
                .should('not.exist')

            cy.get(s.models.buttonImport)
                .click()

            cy.get(s.models.name)
                .type(testData.modelName)

            cy.get(s.models.buttonLocalFile)
                .click()

            cy.UploadFile(testData.modelFile, s.models.inputFile)

            cy.get(s.models.submit)
                .click()

            cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
                .should('not.exist')

            cy.get(s.model.buttonNavTrainDialogs)
                .click()

            cy.get(s.trainDialogs.buttonNew)
                .click()

            cy.get(s.trainDialog.inputWebChat)
                .type(`${testData.phrase}{enter}`)

            cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
                .should('not.exist')
        })

        after(() => {
            cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
                .should('not.exist')

            cy.get(s.trainDialog.buttonAbandon)
                .click()

            cy.get(s.confirmCancelModal.buttonConfirm)
                .click()
        })

        describe('controls', () => {
            before(() => {
                cy.get('body')
                    .trigger(constants.events.selectWord, { detail: testData.word1 })
            })

            it('when pressing tab it should select the highlighted entity', () => {
                cy.get('body')
                    .trigger(constants.events.selectWord, { detail: testData.word1 })

                // Tab works if user, but doesn't here because we never selected the text, only used custom event to simulate selection
                cy.get(s.entityPicker.inputSearch)
                    .trigger('keydown', {
                        keyCode: constants.keys.tab,
                        which: constants.keys.tab
                    })
            })

            it('when pressing enter it should select the highlighted entity', () => {
                cy.get('body')
                    .trigger(constants.events.selectWord, { detail: testData.word2 })

                // Tab works if user, but doesn't here because we never selected the text, only used custom event to simulate selection
                cy.get(s.entityPicker.inputSearch)
                    .type('{enter}')
            })

            describe('highlight', () => {
                before(() => {
                    cy.get('body')
                        .trigger(constants.events.selectWord, { detail: testData.word3 })
                })

                it('should list all the entities in the model', () => {
                    cy.get(s.entityPicker.options)
                        .should($options => {
                            const texts = $options.map((_, el) => Cypress.$(el).text()).get()
                            expect(texts).to.deep.eq(testData.entities)
                        })
                })

                it('should open with the first item highlighted', () => {
                    cy.get(s.entityPicker.options)
                        .first()
                        .should('have.class', testData.highlightClass)
                })

                it('when closing and reopening the picker after adjusting text and highlight should reset to empty and be at the top', () => {
                    // Adjust text and highlight
                    cy.get(s.entityPicker.inputSearch)
                        .type('e')
                        .trigger('keydown', {
                            keyCode: constants.keys.down,
                            which: constants.keys.down
                        })

                    cy.get(s.extractionEditor.overlay)
                        .click()

                    cy.get('body')
                        .trigger(constants.events.selectWord, { detail: testData.word3 })

                    cy.get(s.entityPicker.inputSearch)
                        .should('have.text', '')

                    cy.get(s.entityPicker.options)
                        .should($options => {
                            const texts = $options.map((_, el) => Cypress.$(el).text()).get()
                            expect(texts).to.deep.eq(testData.entities)
                        })
                })

                describe('arrow keys', () => {
                    before(() => {
                        cy.get('body')
                            .trigger(constants.events.selectWord, { detail: testData.word3 })
                    })

                    it('when pressing down arrow it should move the highlight down', () => {
                        // Verify initial highlight index, and move down, then verify index is greater by 1
                        // cy.get(testSelectors.entityPicker.options)
                        //     .then($options => {
                        //         cy.get(`.${testData.highlightClass}`)
                        //             .text()
                        //     })

                        cy.get(s.entityPicker.inputSearch)
                            .trigger('keydown', {
                                keyCode: constants.keys.down,
                                which: constants.keys.down
                            })

                        cy.wait(10)
                    })

                    it('when pressing up arrow it should move the highlight up', () => {
                        cy.get(s.entityPicker.inputSearch)
                            .trigger('keydown', {
                                keyCode: constants.keys.up,
                                which: constants.keys.up
                            })

                        cy.wait(10)

                    })

                    it('when pressing up arrow and the top it should rotate to the bottom', () => {
                        cy.get(s.entityPicker.inputSearch)
                            .trigger('keydown', {
                                keyCode: constants.keys.up,
                                which: constants.keys.up
                            })

                        cy.wait(10)
                    })

                    it('when pressing down arrow and the end it should rotate to the top', () => {
                        cy.get(s.entityPicker.inputSearch)
                            .trigger('keydown', {
                                keyCode: constants.keys.down,
                                which: constants.keys.down
                            })

                        cy.wait(10)
                    })
                })
            })
        })

        describe('searching', () => {
            before(() => {
                cy.reload()

                cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
                    .should('not.exist')

                cy.get(s.trainDialogs.buttonNew)
                    .click()

                cy.get(s.trainDialog.inputWebChat)
                    .type(`${testData.phrase}{enter}`)

                cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
                    .should('not.exist')

                cy.get('body')
                    .trigger(constants.events.selectWord, { detail: testData.word3 })

                cy.get(s.entityPicker.inputSearch)
                    .wait(50)
                    .type(testData.entitySearchPrefix)
            })

            it('given a search input of X should highlighted characters X in the word', () => {
                cy.get(s.entityPicker.options)
                    .within($option => {
                        // TODO: Make case insensitive
                        cy.get('.match-string--matched').contains(testData.entitySearchPrefix)
                    })
            })

            it('should filter the list of entities to those matching search term', () => {
                cy.get(s.entityPicker.options)
                    .should('have.length', '2')
            })
        })
    })
})