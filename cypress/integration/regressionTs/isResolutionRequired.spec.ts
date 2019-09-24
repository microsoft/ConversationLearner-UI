import * as util from '../../support/utilities'
import constants from '../../support/constants'
import s from '../../support/selectors'

describe('Resolution Required', () => {
    const testData = {
        modelName: `IsResRequired`,
        modelFile: 'isResolutionRequired.cl',
    }

    before(() => {
        cy.visit('/')
        util.importModel(testData.modelName, testData.modelFile)
    })

    describe('Entity Option Behavior', () => {
        describe('New Entity', () => {
            before(() => {
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
            it('should be disabled when editing', () => {

            })
        })
    })

    describe('Entity Label Behavior', () => {
        it('given no resolution, entity label with option False should be allowed and label with option True should be removed', () => {

        })
    })
})