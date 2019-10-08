import * as util from '../../support/utilities'
import constants from '../../support/constants'
import s from '../../support/selectors'

describe('Action Conditions', () => {
    const testData = {
        modelName: 'actionConditions',
        modelFile: 'actionConditions.cl',
        entities: {
            enum: 'myEnumEntity',
            number: 'myNumberEntity',
            other: 'myOtherEntity',
        },
    }

    before(() => {
        cy.visit(`/`)
        util.importModel(testData.modelName, testData.modelFile)
        // Wait for training status to change. Sometimes training is fast and we can't rely on catching the transition to running status. Assume it happens and only ensure it's settled at completed.
        cy.wait(3000)
        cy.get(s.trainingStatus.completed, { timeout: constants.training.timeout })
    })

    describe(`Condition Creation`, () => {
        it(`should only show enum entities and entities with required number resolver type`, () => {

        })

        it(`should show existing conditions used by the selected entity`, () => {

        })

        it(`given enum entity is selected operator should be forced to equals and disabled and value should be list of enum values`, () => {

        })

        it(`given number entity it should allow all types of operators and show a number picker `, () => {

        })

        it(`should show the ValueCondition in the "required conditions" list`, () => {

        })

        it(`should not add the condition if is a duplicate of another condition`, () => {

        })

        it(`clicking "Use Condition" should also close and add the ValueCondition to the "required conditions" list`, () => {

        })
    })

    describe(`Value Conditions`, () => {

    })
})