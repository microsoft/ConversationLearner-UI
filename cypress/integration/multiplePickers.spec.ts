import * as util from '../support/utilities'
import constants from '../support/constants'
import s from '../support/selectors'

describe('Multiple Pickers and Labels', () => {
    const testData = {
        modelName: `multiplePickers`,
        modelFile: `multiplePickers.cl`,
        entity1: 'entity1',
        entity2: 'entity2',
        entity3: 'entity3',
        dialog: {
            primaryInput: `user input phrase 1`,
            alternateInput: `alternate user input with phrase 2`,
            word: `phrase`
        }
    }

    before(() => {
        cy.visit('/')
        util.importModel(testData.modelName, testData.modelFile)
    })

    describe('Actions', () => {
        before(() => {
            cy.get(s.model.buttonNavActions)
                .click()
        })

        afterEach(() => {
            cy.get(s.action.buttonCreate)
                .click()

            cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
                .should('not.exist')
        })

        describe('Code Arguments', () => {
            before(() => {
                cy.get(s.actions.buttonNewAction)
                    .click()

                util.selectDropDownOption(s.action.dropDownType, 'API')
                util.selectDropDownOption(s.action.dropDownApiCallback, 'Add')
            })

            it('should be able to pick entities in multiple arguments', () => {
                cy.get(s.action.logicArg('arg1'))
                    .type(`picker 1 $${testData.entity1}{enter}`)
                    .get(s.payloadEditor.mentionNodeCompleted)
                    .contains(testData.entity1)

                cy.get(s.action.checkBoxWaitForResponse)
                    .click()
                    .click()

                cy.get(s.action.logicArg('arg2'))
                    .type(`picker 2 $${testData.entity2}{enter}`)
                    .get(s.payloadEditor.mentionNodeCompleted)
                    .contains(testData.entity2)
            })
        })

        describe('Card Arguments', () => {
            before(() => {
                cy.get(s.actions.buttonNewAction)
                    .click()

                util.selectDropDownOption(s.action.dropDownType, 'CARD')
                util.selectDropDownOption(s.action.dropDownCardTemplate, 'prompt')
            })

            it('should be able to pick entities in multiple arguments', () => {
                cy.get(s.action.cardArg('speak'))
                    .type(`picker 1 $${testData.entity1}{enter}`)
                    .get(s.payloadEditor.mentionNodeCompleted)
                    .contains(testData.entity1)

                cy.get(s.action.checkBoxWaitForResponse)
                    .click()
                    .click()

                cy.get(s.action.cardArg('question'))
                    .type(`picker 2 $${testData.entity2}{enter}`)
                    .get(s.payloadEditor.mentionNodeCompleted)
                    .contains(testData.entity2)
            })
        })
    })

    describe('Extractions', () => {
        before(() => {
            cy.get(s.model.buttonNavTrainDialogs)
                .click()

            cy.get(s.trainDialogs.buttonNew)
                .click()

            util.inputText(testData.dialog.primaryInput)

            cy.get(s.extractionEditor.inputAlternateText)
                .type(`${testData.dialog.alternateInput}{enter}`)

            cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
                .should('not.exist')
        })

        it('should be able to label entities in multiple entity extractions', () => {
            cy.get('body')
                .trigger(constants.events.selectWord, { detail: testData.dialog.word })

            cy.get(s.entityPicker.inputSearch)
                .first()
                // TODO: Why?  Sometimes there is a glitch in what it types.
                // Input is `tity01en` instead of `entity01` as if cursor resets to start mid-type.
                .wait(100)
                .type(`${testData.entity1}{enter}`)

            cy.get('body')
                .trigger(constants.events.selectWord, { detail: `alternate` })

            cy.get(s.entityPicker.inputSearch)
                .eq(1)
                .wait(100)
                .type(`${testData.entity1}{enter}`)
        })
    })
})