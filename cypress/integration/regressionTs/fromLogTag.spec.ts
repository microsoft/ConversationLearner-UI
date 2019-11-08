import * as util from '../../support/utilities'
import constants from '../../support/constants'
import s from '../../support/selectors'

describe('From Log Tag', () => {
    const testData = {
        modelName: 'fromLogTag',
        modelFile: 'fromLogTag.cl',
        trainDialogInput: 'input one',
        userInput: 'user input ',
        fromLogTagName: 'from-log',
        actionResponse01: 'Bot Response',
    }

    before(() => {
        cy.visit(`/`)
        util.importModel(testData.modelName, testData.modelFile)
        cy.wait(2000)
        cy.get(s.trainingStatus.completed, { timeout: constants.training.timeout })

        cy.get(s.model.buttonNavLogDialogs)
            .click()

        // Three ways to convert log dialogs to train dialog, create dialog for each path + 1 more for merge test
        Array.from({ length: 4 }, () => 0)
            .forEach((_, i, xs) => {
                cy.get(s.logDialogs.buttonCreate)
                    .click()

                cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
                    .should('not.exist')

                cy.get(s.logDialog.inputMessage)
                    .type(`${testData.userInput} ${i}{enter}`)

                cy.get(s.webChat.messageFromBot, { timeout: constants.prediction.timeout })
                    .should('exist')
                    .should('not.have.class', s.webChat.messageColorException)

                cy.get(s.logDialog.buttonDone)
                    .click()

                cy.get(s.logDialog.modal)
                    .should('not.exist')
            })
    })

    beforeEach(() => {
        cy.get(s.model.buttonNavLogDialogs)
            .click()
    })

    it('when standard open and save, should have tag on resulting dialog', () => {
        const description = `${testData.userInput} 0`
        cy.get(s.logDialogs.description)
            .contains(description)
            .click()

        cy.get(s.dialogModal.buttonSaveAsTrainDialog)
            .click()

        cy.get(s.mergeModal.buttonSaveAsIs)
            .click()
        cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
            .should('not.exist')

        cy.get(s.model.buttonNavTrainDialogs)
            .click()

        // Need to reload to ensure tags actually persist on dialog
        cy.reload()
        cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
            .should('not.exist')

        cy.get(s.trainDialogs.descriptions)
            .contains(description)
            .parents('[data-automationid="DetailsRowFields"]')
            .find(s.trainDialogs.tags)
            .contains(testData.fromLogTagName)
    })

    it('when editing round then saving, should have tag on resulting dialog', () => {
        const userInput = `${testData.userInput} 1`
        cy.get(s.logDialogs.description)
            .contains(userInput)
            .click()

        cy.get(s.webChat.messageFromMe)
            .contains(userInput)
            .click()

        cy.get(s.extractionEditor.inputAlternateText)
            .type('some other input{enter}')

        cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
            .should('not.exist')

        cy.get(s.extractionEditor.buttonSubmitChanges)
            .click()

        cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
            .should('not.exist')

        cy.get(s.dialogModal.buttonCloseSave)
            .click()

        cy.get(s.mergeModal.buttonSaveAsIs)
            .click()
        cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
            .should('not.exist')

        cy.get(s.model.buttonNavTrainDialogs)
            .click()

        // Need to reload to ensure tags actually persist on dialog
        cy.reload()
        cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
            .should('not.exist')

        cy.get(s.trainDialogs.descriptions)
            .contains(userInput)
            .parents(s.common.gridRow)
            .find(s.trainDialogs.tags)
            .contains(testData.fromLogTagName)
    })

    it('when continuing log dialog, should have tag on resulting dialog', () => {
        const userInput = `${testData.userInput} 2`
        cy.get(s.logDialogs.description)
            .contains(userInput)
            .click()

        util.inputText('some other input{enter}')

        cy.get(s.trainDialog.buttonScoreActions)
            .click()

        cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
            .should('not.exist')

        util.selectAction(s.trainDialog.actionScorerTextActions, testData.actionResponse01)

        cy.get(s.webChat.messageFromBot, { timeout: constants.prediction.timeout })
            // Need to assert count so we don't get false positive from the previous messages / predictions.
            .should('have.length.greaterThan', 2)

        cy.get(s.dialogModal.buttonCloseSave)
            .click()

        cy.get(s.mergeModal.buttonSaveAsIs)
            .click()

        cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
            .should('not.exist')

        cy.get(s.model.buttonNavTrainDialogs)
            .click()

        // Need to reload to ensure tags actually persist on dialog
        cy.reload()
        cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
            .should('not.exist')

        cy.get(s.trainDialogs.descriptions)
            .contains(userInput)
            .parents(s.common.gridRow)
            .find(s.trainDialogs.tags)
            .contains(testData.fromLogTagName)
    })

    it('when saving log dialog AND merging, should NOT have tag on resulting dialog', () => {
        const userInput = `${testData.userInput} 3`
        cy.get(s.logDialogs.description)
            .contains(userInput)
            .click()


        cy.get(s.dialogModal.buttonSaveAsTrainDialog)
            .click()

        cy.get(s.mergeModal.buttonMerge)
            .click()

        cy.get(s.model.buttonNavTrainDialogs)
            .click()

        // Need to reload to ensure tags actually persist on dialog
        cy.reload()
        cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
            .should('not.exist')

        cy.get(s.trainDialogs.descriptions)
            .contains(testData.trainDialogInput)
            .parents(s.common.gridRow)
            .find(s.trainDialogs.tags)
            .should('not.have.text', testData.fromLogTagName)
    })
})