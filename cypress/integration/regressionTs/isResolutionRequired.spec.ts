import * as util from '../../support/utilities'
import constants from '../../support/constants'
import s from '../../support/selectors'

describe('Resolution Required', () => {
    const testData = {
        modelName: `IsResRequired`,
        modelFile: 'isResolutionRequired.cl',
        entityName01: 'fruits',
        entityName02: 'vegetables',
    }

    before(() => {
        cy.visit('/')
        util.importModel(testData.modelName, testData.modelFile)
        cy.wait(2000)
        cy.get(s.trainingStatus.completed, { timeout: constants.training.timeout })
    })

    describe('Entity Option Behavior', () => {
        describe('New Entity', () => {
            before(() => {
                cy.reload()

                cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
                    .should('not.exist')

                cy.get(s.model.buttonNavEntities)
                    .click()

                cy.get(s.entities.buttonCreate)
                    .click()
            })

            it('given NONE resolver type should be disabled and unchecked', () => {
                cy.get(s.entity.dropDownResolverType)
                    .should('contain.text', 'none')

                cy.get(s.entity.checkboxResolutionRequired)
                    .should('have.class', 'is-disabled')
                    .should('not.have.class', 'is-checked')
            })

            it('when resolver type change from NONE to other, checkbox should be enabled and checked', () => {
                util.selectDropDownOption(s.entity.dropDownResolverType, 'number')

                cy.get(s.entity.checkboxResolutionRequired)
                    .should('not.have.class', 'is-disabled')
                    .should('have.class', 'is-checked')
            })

            it('when resolver type changes from other to NONE, checkbox should be disabled and unchecked', () => {
                util.selectDropDownOption(s.entity.dropDownResolverType, 'none')

                cy.get(s.entity.checkboxResolutionRequired)
                    .should('have.class', 'is-disabled')
                    .should('not.have.class', 'is-checked')
            })
        })

        describe('Editing', () => {
            before(() => {
                cy.reload()

                cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
                    .should('not.exist')

                cy.get(s.entities.name)
                    .contains(testData.entityName01)
                    .click()
            })

            it('should be disabled when editing', () => {
                cy.get(s.entity.checkboxResolutionRequired)
                    .should('have.class', 'is-disabled')
            })
        })
    })

    describe('Entity Label Behavior', () => {
        before(() => {
            cy.reload()

            cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
                .should('not.exist')

            cy.get(s.model.buttonNavTrainDialogs)
                .click()

            cy.get(s.trainDialogs.buttonNew)
                .click()
        })

        it('given no resolution, entity label with option False should be allowed and label with option True should be removed', () => {
            // We know imported model has learned to label words preceeding fruits and vegetables
            // Fruits has resolution required False which means label will not be affected (exist)
            // Vegetables has resolution required True which means label will be removed (not exist)
            util.inputText('I have many fruits and many vegetables')

            cy.get(s.extractionEditor.customButton)
                .contains(testData.entityName01)

            cy.get(s.extractionEditor.customButton)
                .contains(testData.entityName02)
                .should('not.exist')
        })
    })
})