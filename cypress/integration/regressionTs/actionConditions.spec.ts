import * as util from '../../support/utilities'
import constants from '../../support/constants'
import s from '../../support/selectors'

describe('Action Conditions', () => {
    const testData = {
        modelName: 'conditions',
        modelFile: 'actionConditions.cl',
        entities: {
            enum: 'myEnumEntity',
            number: 'myNumber',
            other: 'myOtherEntity',
        },
        operator: '>=',
        constantValue: 5,
        actions: {
            whatIsNumber: 'What is the number?',
            low: 'Your number is low!',
            normal: 'Your number is normal.',
            high: 'Your number is hight!',
        },
        conditions: {
            gte5: `myNumber >= 5`,
            lt5: `myNumber < 5`,
            gte30: `myNumber >= 30`,
            lt30: `myNumber >= 30`,
        },
    }

    const conditionDisplay = `${testData.entities.number} ${testData.operator} ${testData.constantValue}`

    before(() => {
        cy.visit(`/`)
        util.importModel(testData.modelName, testData.modelFile)
        // Wait for training status to change. Sometimes training is fast and we can't rely on catching the transition to running status. Assume it happens and only ensure it's settled at completed.
        cy.wait(3000)
        cy.get(s.trainingStatus.completed, { timeout: constants.training.timeout })
    })

    xdescribe(`Condition Creation`, () => {
        before(() => {
            cy.get(s.model.buttonNavActions)
                .click()

            cy.get(s.actions.buttonNewAction)
                .click()

            cy.get(s.action.inputRequiredConditions)
                .click()

            cy.get(s.action.buttonAddCondition)
                .click()
        })

        after(() => {
            cy.get(s.action.buttonCancel)
                .click()
        })

        it(`should only show enum entities and entities with required number resolver type`, () => {
            cy.get(s.addConditionModal.dropdownEntity)
                .click()

            cy.get(s.common.dropDownOptions)
                .contains(s.common.dropDownOptions, testData.entities.enum)

            cy.get(s.common.dropDownOptions)
                .contains(s.common.dropDownOptions, testData.entities.number)
                .click()
        })

        it(`should show existing conditions used by the selected entity`, () => {
            cy.get(s.addConditionModal.existingCondition)
                .should('have.length', 4)

            util.selectDropDownOption(s.addConditionModal.dropdownEntity, testData.entities.enum)

            cy.get(s.addConditionModal.existingCondition)
                .should('have.length', 1)
        })

        it(`given enum entity is selected operator should be forced to equals and disabled and value should be list of enum values`, () => {
            cy.get(s.addConditionModal.dropdownOperator)
                .should('have.class', 'is-disabled')
                .contains('==')

            cy.get(s.addConditionModal.dropdownEnumValue)
                .click()

            cy.get(s.common.dropDownOptions)
                .should('have.length', 3)
        })

        it(`given number entity it should allow all types of operators and show a number picker `, () => {
            util.selectDropDownOption(s.addConditionModal.dropdownEntity, testData.entities.number)

            cy.get(s.addConditionModal.dropdownOperator)
                .should('not.have.class', 'is-disabled')
                .click()

            cy.get(s.common.dropDownOptions)
                .should('have.length', 6)

            cy.get(s.addConditionModal.inputNumberValue)
        })

        it(`given condition being created is same as one of existing conditions, should show icon to indicate match`, () => {
            cy.get(s.addConditionModal.inputNumberValue)
                // Tried to type in number like 5 or 30 but it keeps getting reset on next element focus, however it doesn't do this on actual use.
                // Use uparrow technique to achieve same result, value should be 5
                .type('{uparrow}'.repeat(testData.constantValue))

            util.selectDropDownOption(s.addConditionModal.dropdownOperator, testData.operator)

            cy.get(s.addConditionModal.existingCondition)
                .contains(conditionDisplay)
                .parent()
                .get(s.addConditionModal.existingConditionMatch)
        })

        it(`clicking "Create" should NOT add the condition if is a duplicate of another condition`, () => {
            cy.get(s.addConditionModal.buttonCreate)
                .click()

            cy.get(s.action.tagPickerRequired)
                .contains(conditionDisplay)
                .should('have.length', 1)
        })

        it(`clicking "Create" should add the ValueCondition in the action's "required conditions" list`, () => {
            cy.get(s.action.inputRequiredConditions)
                .click()

            cy.get(s.action.buttonAddCondition)
                .click()

            cy.get(s.addConditionModal.buttonCreate)
                .click()

            cy.get(s.action.tagPickerRequired)
                .contains(`${testData.entities.number} == 0`)
        })

        it(`clicking "Use Condition" should also close and add the associated ValueCondition to the "required conditions" list`, () => {
            cy.get(s.action.inputRequiredConditions)
                .click()

            cy.get(s.action.buttonAddCondition)
                .click()

            cy.get(s.addConditionModal.buttonUseCondition)
                .first()
                .click()

            cy.get(s.action.tagPickerRequired)
                .contains(`${testData.entities.number} < 5`)
        })

        it(`clicking "Cancel" should close the model and NOT add the condition`, () => {
            cy.get(s.action.inputRequiredConditions)
                .click()

            cy.get(s.action.buttonAddCondition)
                .click()

            cy.get(s.addConditionModal.buttonCancel)
                .click()

            cy.get(s.addConditionModal.modal)
                .should('not.be.visible')
        })
    })

    describe(`Value Conditions`, () => {
        it(`should properly constrain actions based on true conditions`, () => {
            cy.get(s.model.buttonNavTrainDialogs).click()
            cy.get(s.trainDialogs.buttonNew).click()
            util.inputText('hi')
            cy.get(s.trainDialog.buttonScoreActions).click()
            util.selectAction(s.trainDialog.actionScorerTextActions, testData.actions.whatIsNumber)

            // Enter low number
            util.inputText('3')

            cy.get(s.trainDialog.buttonScoreActions).click()

            // Verify conditions on other actions are disqualified
            cy.get(s.trainDialog.actionScorerTextActions)
                .contains(testData.actions.normal)
                .parents(s.trainDialog.actionScorer.rowField)
                .then(() => {
                    cy.get(s.trainDialog.buttonSelectActionDisabled)
                        .should('have.class', 'is-disabled')

                    cy.get(s.trainDialog.actionScorer.condition)
                        .contains(testData.conditions.gte5)
                        .should('have.class', 'cl-entity--mismatch')

                    cy.get(s.trainDialog.actionScorer.condition)
                        .contains(testData.conditions.lt30)
                        .should('have.class', 'cl-entity--match')
                })

            verifyActionState({
                text: testData.actions.high,
                conditions: [
                    {
                        text: testData.conditions.gte30,
                        match: false,
                    },
                ],
            })

            cy.get(s.trainDialog.actionScorerTextActions)
                .contains(testData.actions.low)
                .parents(s.trainDialog.actionScorer.rowField)
                .then(() => {
                    cy.get(s.trainDialog.actionScorer.condition)
                        .contains(testData.conditions.lt5)
                        .should('have.class', 'cl-entity--match')
                })

            util.selectAction(s.trainDialog.actionScorerTextActions, testData.actions.low)
            util.selectAction(s.trainDialog.actionScorerTextActions, testData.actions.whatIsNumber)
            util.inputText('9')

        })
    })
})

type ActionQuality = {
    text: string
    conditions: {
        text: string
        match: boolean
    }[]
}

function verifyActionState(actionQualities: ActionQuality) {
    cy.get(s.trainDialog.actionScorerTextActions)
        .contains(actionQualities.text)
        .parents(s.trainDialog.actionScorer.rowField)
        .then(() => {
            actionQualities.conditions.forEach(condition => {
                const matchClass = condition.match
                    ? 'cl-entity--match'
                    : 'cl-entity--mismatch'

                cy.get(s.trainDialog.actionScorer.condition)
                    .contains(condition.text)
                    .should('have.class', matchClass)
            })

            const isActionDisabled = actionQualities.conditions.some(c => c.match === false)
            if (isActionDisabled) {
                cy.get(s.trainDialog.buttonSelectActionDisabled)
                    .should('have.class', 'is-disabled')
            }
        })
}
