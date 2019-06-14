import * as helpers from './Helpers'
import s from '../support/selectors'
import constants from '../support/constants'

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
        .type(generateUniqueModelName(modelName))

    cy.get(s.models.buttonLocalFile)
        .click()

    cy.UploadFile(modelFile, s.models.inputFile)

    cy.get(s.models.submit)
        .click()

    cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
        .should('not.exist')
}

export function selectAction(actionScorerSelector: string, actionResponseText: string) {
    cy.get(actionScorerSelector)
        .contains(actionResponseText)
        .parents(s.trainDialog.actionScorer.rowField)
        .find(s.trainDialog.buttonSelectAction)
        .click()

    cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
        .should('not.exist')
}

export function inputText(text: string) {
    cy.get(s.trainDialog.inputWebChat)
        .type(`${text}{enter}`)

    cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
        .should('not.exist')
}

export function clickScoreActionButton() {
    cy.get(s.trainDialog.buttonScoreActions)
        .click()

    cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
        .should('not.exist')
}

export function removeLabel(tokenText: string) {
    cy.get(s.extractionEditor.slateEditor)
        .get(s.extractionEditor.tokenNode)
        .contains(tokenText)
        .click()
        .parents('.cl-entity-node--custom')
        .find(s.extractionEditor.buttonRemoveLabel)
        .click()
}