import * as helpers from './Helpers'
import s from '../support/selectors'
import constants from '../support/constants'
import * as util from '../support/utilities'

export function generateUniqueModelName(name: string): string {
    return `z-${name}-${Cypress.moment().format('MMDD-HHmmss')}${helpers.GetBuildKey()}`
}

export function selectDropDownOption(dropDownSelector: string, optionName: string) {
    cy.get(dropDownSelector)
        .click()
        .then(() => {
            cy.get(s.common.dropDownOptions)
                .contains(optionName)
                .click()
        })
}

export function importModel(modelName: string, modelFile: string): void {
    cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
        .should('not.exist')

    cy.get(s.models.buttonImport)
        .click()

    cy.get(s.models.name)
        .type(util.generateUniqueModelName(modelName))

    cy.get(s.models.buttonLocalFile)
        .click()

    cy.UploadFile(modelFile, s.models.inputFile)

    cy.get(s.models.submit)
        .click()

    cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
        .should('not.exist')
}