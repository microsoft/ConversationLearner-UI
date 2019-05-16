import constants from '../support/constants'
import s from '../support/selectors'
import * as util from '../support/utilities'

describe('action modal', () => {
    const testData = {
        modelName: `actionModal`,
        modelFile: `actionModal.cl`,
        action: {
            inputResponseDefaultText: 'Phrase...​'
        },
        entity1: 'entity1',
        entity2: 'entity2',
        entity3: 'entity3',
        newEntity: 'newEntity',
    }

    before(() => {
        cy.visit(constants.baseUrl)
        util.importModel(testData.modelName, testData.modelFile)
        cy.get(s.model.buttonNavActions)
            .click()
    })

    beforeEach(() => {
        cy.reload()
        cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
            .should('not.exist')
            
        cy.get(s.actions.buttonNewAction)
            .click()
    })

    afterEach(() => {
        cy.get(s.action.buttonCancel)
            .click()
    })

    describe('types', () => {
        it('selecting TEXT should show response field', () => {
            cy.get(s.action.dropDownType)
                .contains('TEXT')

            cy.get(s.action.inputResponse)
        })

        it('selecting API should show the callback list', () => {
            util.selectDropDownOption(s.action.dropDownType, 'API')

            cy.get(s.action.dropDownApiCallback)

            // TODO: Verify drop down has expected options
        })

        // TODO: Need to use special branch of samples which has callbacks.
        it('selecting API and callback should arguments for that callback', () => {
            util.selectDropDownOption(s.action.dropDownType, 'API')
            util.selectDropDownOption(s.action.dropDownApiCallback, 'SetEntity')
        })

        it('selecting Card should show template names', () => {
            util.selectDropDownOption(s.action.dropDownType, 'CARD')
            util.selectDropDownOption(s.action.dropDownCardTemplate, 'prompt')
            // TODO: Verify drop down has expected options
        })

        it('selecting CARD and template name should show card arguments', () => {
            util.selectDropDownOption(s.action.dropDownType, 'CARD')
            util.selectDropDownOption(s.action.dropDownCardTemplate, 'prompt')
        })

        it('switching types should reset fields', () => {
            cy.get(s.action.inputResponse)
                .type('random text')

            util.selectDropDownOption(s.action.dropDownType, 'CARD')
            util.selectDropDownOption(s.action.dropDownType, 'TEXT')

            cy.get(s.action.inputResponse)
                .should('have.text', testData.action.inputResponseDefaultText)
        })
    })

    describe('response', () => {
        it('adding an entity should implicitly add the entity to require entities list as non-removable', () => {
            cy.get(s.action.inputResponse)
                .type(`reference $${testData.entity1}{enter} in response`)

            cy.get(s.action.nonRemovableTags)
                .should('have.text', testData.entity1)
        })

        // TODO: Find out why this fails to select picker item?
        it('adding an entity should make removable required entities non-removable', () => {
            cy.WaitForStableDOM()
            
            cy.get(s.action.inputRequiredConditions)
                .type('e{enter}')

            // Condition is removable
            cy.get(s.action.tagPickerRequired)
                .get(s.officePicker.tagItem)
                .contains(testData.entity1)
                .get(s.officePicker.tagItemClose)

            cy.get(s.action.inputResponse)
                .type(`reference $${testData.entity1}{enter} in response`)

            // Condition is not removable
            cy.get(s.action.nonRemovableTags)
                .should('have.text', testData.entity1)
        })

        it('adding an optional entity should NOT add the entity to the required entities list', () => {
            cy.get(s.action.inputResponse)
                .type(`reference [option $${testData.entity1}{enter}] in response`)

            cy.get(s.action.tagPickerRequired)
                .get(s.officePicker.tagItem)
                .should('not.exist')
        })

        it('adding an entity in the payload prevents it from being available as expected entity', () => {
            cy.get(s.action.inputResponse)
                .type(`reference $${testData.entity1}{enter} in response`)

            cy.get(s.action.inputExpectedEntity)
                .type('e')

            cy.get(s.officePicker.suggestions)
                .get(s.officePicker.buttonSuggestion)
                .should('not.have.text', testData.entity1)
        })
    })

    describe('expected entity', () => {
        it('adding an entity prevents that entity from being found when adding in the payload', () => {
            // Add entity1 as expected
            cy.get(s.action.inputExpectedEntity)
                .type('e{enter}')

            cy.get(s.action.inputResponse)
                .type('random text $')

            // Entity1 should not be presented as an option to add
            cy.get('.mention-picker-button')
                .should('not.have.text', testData.entity1)
        })

        it('adding an entity implicitly adds the same entity as a removable disqualified entity', () => {
            cy.get(s.action.inputExpectedEntity)
                .type('e{enter}')

            cy.get(s.action.tagPickerDisqualified)
                .get(s.officePicker.tagItem)
                .contains(testData.entity1)
                .get(s.officePicker.tagItemClose)
        })

        it('given wait for response is unchecked and action has expected entity show an error and prevent saving', () => {
            cy.get(s.action.inputExpectedEntity)
                .type('e{enter}')

            cy.get(s.action.checkBoxWaitForResponse)
                .click()

            cy.get(s.action.warningNoWaitExpected)
                .should('be.visible')
        })
    })

    describe('required entities', () => {
        it('should not be able to add entities that are disqualified', () => {
            cy.get(s.action.inputDisqualifiedConditions)
                .type('e{enter}')

            cy.get(s.action.inputRequiredConditions)
                .type('e')

            cy.get(s.officePicker.suggestions)
                .get(s.officePicker.buttonSuggestion)
                .should('not.have.text', testData.entity1)
        })
    })

    describe('disqualifying entities', () => {
        it('should not be able to add entities that are required', () => {
            cy.get(s.action.inputRequiredConditions)
                .type('e{enter}')

            cy.get(s.action.inputDisqualifiedConditions)
                .type('e')

            cy.get(s.officePicker.suggestions)
                .get(s.officePicker.buttonSuggestion)
                .should('not.have.text', testData.entity1)
        })
    })

    describe('wait for response', () => {
        it('selecting SET_ENTITY actions should force the wait for response to be unchecked', () => {
            cy.get(s.action.checkBoxWaitForResponse)
                .should('have.class', 'is-checked')

            util.selectDropDownOption(s.action.dropDownType, 'SET_ENTITY')

            cy.get(s.action.checkBoxWaitForResponse)
                .should('not.have.class', 'is-checked')
        })
    })

    describe('entity creation', () => {
        it('clicking the create button should show the entity modal', () => {
            cy.get(s.action.buttonCreateEntity)
                .click()

            cy.get(s.entity.modal)

            cy.get(s.entity.buttonCancel)
                .click()
        })

        it('given entities created while the modal is open should be immediately available as tags', () => {
            cy.get(s.action.buttonCreateEntity)
                .click()

            cy.get(s.entity.name)
                .type(testData.newEntity)

            cy.get(s.entity.buttonSave)
                .click()

            cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
                .should('not.exist')

            cy.get(s.action.inputRequiredConditions)
                .type('new{enter}')
        })
    })

    describe('creation', () => {
        it('given a duplicate action definition clicking create should show a warning message', () => {
            cy.get(s.action.inputResponse)
                .type('My Action')

            cy.get(s.action.buttonCreate)
                .click()

            cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
                .should('not.exist')

            cy.get(s.actions.buttonNewAction)
                .click()

            cy.get(s.action.inputResponse)
                .type('My Action')

            cy.get(s.action.buttonCreate)
                .click()

            cy.get(s.confirmCancelModal.buttonOk)
                .click()
        })
    })

    describe('cancel', () => {
        it('clicking cancel should close the modal', () => {
            // TODO: Odd because of afterEach needing to cancel
        })
    })
})