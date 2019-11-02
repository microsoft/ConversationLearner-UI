import * as models from '../../support/Models'
import * as model from '../../support/components/ModelPage'
import * as trainDialog from '../../support/Train'
import * as logDialogs from '../../support/components/LogDialogsGrid'
import * as logDialog from '../../support/components/LogDialogModal'
import constants from '../../support/constants'
import s from '../../support/selectors'
import * as util from '../../support/utilities'

describe('Entity Conflicts', () => {
    describe('choose attempted labels', () => {
        const testData = {
            modelName: 'conflictOptions',
            modelFile: 'conflictTest.cl',
            entity1: 'e1',
            entity2: 'e2',
            dialog: {
                input: 'one two',
                word1: 'one',
                word2: 'two',
                actionText: `The bot's only response`
            }
        }

        function createModelToTestConflicts(wordToLabel: string, entityName: string) {
            cy.visit(`/`)
            util.importModel(testData.modelName, testData.modelFile)
            cy.wait(2000)
            cy.get(s.trainingStatus.completed, { timeout: constants.training.timeout })

            cy.get(s.model.buttonNavTrainDialogs)
                .click()

            cy.get(s.trainDialogs.buttonNew)
                .click()

            cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
                .should('not.exist')

            util.inputText(testData.dialog.input)

            util.removeLabel(testData.dialog.word1)

            cy.get('body')
                .trigger(constants.events.selectWord, { detail: wordToLabel })

            cy.get(s.entityPicker.options)
                .contains(entityName)
                .click()

            util.clickScoreActionButton()

            cy.get(s.dialogModal.entityConflictModal.attempted)
                .click()

            cy.get(s.dialogModal.entityConflictModal.buttonAccept)
                .click()

            cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
                .should('not.exist')

            util.selectAction(s.trainDialog.actionScorerTextActions, testData.dialog.actionText)

            cy.get(s.trainDialog.buttonSave)
                .click()

            cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
                .should('not.exist')
        }

        describe('preserve entity presence but change location', () => {
            before(() => {
                createModelToTestConflicts(testData.dialog.word2, testData.entity1)

                // Need to merge this?
                cy.get(s.mergeModal.buttonSaveAsIs)
                    .click()
            })

            context('given conflicting text variation and choosing to preserve labels', () => {
                it('should not modify dialogs without conflicts', () => {
                    cy.get(s.trainDialogs.descriptions)
                        .contains('Does Not Contain Conflicts')
                        .parent()
                        .parent()
                        .find(s.trainDialogs.validityIndicator)
                        .should('not.exist')

                    // Dialog created
                    cy.get(s.trainDialogs.descriptions)
                        .contains(testData.dialog.input)
                        .parent()
                        .parent()
                        .find(s.trainDialogs.validityIndicator)
                        .should('not.exist')
                })

                it('given dialogs with conflicting but compatible text variations, mark WARNING and update text variation', () => {
                    cy.get(s.trainDialogs.descriptions)
                        .contains('Single Text Variation')
                        .parent()
                        .parent()
                        .find(s.trainDialogs.validityIndicator)
                        .should($icon => {
                            expect($icon).to.have.attr('data-icon-name', "IncidentTriangle")
                            expect($icon).to.have.class('cl-color-warning')
                        })

                    cy.get(s.trainDialogs.descriptions)
                        .contains('Multiple Text Variations')
                        .parent()
                        .parent()
                        .find(s.trainDialogs.validityIndicator)
                        .should($icon => {
                            expect($icon).to.have.attr('data-icon-name', "IncidentTriangle")
                            expect($icon).to.have.class('cl-color-warning')
                        })
                })
            })
        })

        describe('change entity presence', () => {
            before(() => {
                createModelToTestConflicts(testData.dialog.word2, testData.entity2)
            })

            context('given conflicting text variation and choosing to preserve labels', () => {
                it('should not modify dialogs without conflicts', () => {
                    cy.get(s.trainDialogs.descriptions)
                        .contains('Does Not Contain Conflicts')
                        .parent()
                        .parent()
                        .find(s.trainDialogs.validityIndicator)
                        .should('not.exist')

                    // Dialog created
                    cy.get(s.trainDialogs.descriptions)
                        .contains(testData.dialog.input)
                        .parent()
                        .parent()
                        .find(s.trainDialogs.validityIndicator)
                        .should('not.exist')
                })

                it('given dialogs with conflicting but compatible text variations, mark WARNING and update text variation', () => {
                    cy.get(s.trainDialogs.descriptions)
                        .contains('Single Text Variation')
                        .parent()
                        .parent()
                        .find(s.trainDialogs.validityIndicator)
                        .should($icon => {
                            expect($icon).to.have.attr('data-icon-name', "IncidentTriangle")
                            expect($icon).to.have.class('cl-color-warning')
                        })
                })

                it('given dialog with INcompatible text variations should set the validity to INVALID', () => {
                    cy.get(s.trainDialogs.descriptions)
                        .contains('Multiple Text Variations')
                        .parent()
                        .parent()
                        .find(s.trainDialogs.validityIndicator)
                        .should($icon => {
                            expect($icon).to.have.attr('data-icon-name', "IncidentTriangle")
                            expect($icon).to.have.class('cl-color-error')
                        })
                })
            })
        })
    })

    describe('choose existing labels', () => {

        const labeledWord1 = 'test'
        const labeledWord2 = 'input'
        const testData = {
            modelName: 'entityConflicts',
            modelFile: 'z-entityConflicts.cl',
            entityName: 'testEntity',
            userInput1: `${labeledWord1} ${labeledWord2} 1`,
            userInput2: `${labeledWord1} ${labeledWord2} 2`,
            userInput3: 'Unlabeled input',
            actionResponse: 'The only response',
        }

        before(() => {
            cy.visit('/')
            util.importModel(testData.modelName, testData.modelFile)

            cy.wait(2000)
            cy.get(s.trainingStatus.completed, { timeout: constants.training.timeout })
        })

        context('Train Dialogs', () => {
            describe('new dialog with conflicting labels', () => {
                before(() => {
                    cy.reload()
                    cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
                        .should('not.exist')

                    cy.get(s.model.buttonNavTrainDialogs)
                        .click()

                    cy.get(s.trainDialogs.buttonNew)
                        .click()

                    util.inputText(testData.userInput1)
                    util.removeLabel(labeledWord1)

                    cy.get('body')
                        .trigger(constants.events.selectWord, { detail: labeledWord2 })

                    cy.get(s.entityPicker.inputSearch)
                        .wait(100)
                        .type(testData.entityName)
                        .type('{enter}')
                })

                it('should show entity conflict modal when score actions is clicked', () => {
                    cy.get(s.trainDialog.buttonScoreActions)
                        .click()

                    cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
                        .should('not.exist')

                    cy.get(s.dialogModal.entityConflictModal.modal)
                })

                it('should not change labels if abort is clicked', () => {
                    cy.get(s.dialogModal.entityConflictModal.buttonCancel)
                        .click()

                    // https://docs.cypress.io/api/commands/contains.html#Keep-the-form-as-the-subject
                    cy.get(s.extractionEditor.customNode)
                        .contains(s.extractionEditor.customNode, labeledWord2)
                        .find(s.extractionEditor.customButton)
                        .contains(testData.entityName)
                })

                it('should change the labels if Accept is clicked', () => {
                    cy.get(s.trainDialog.buttonScoreActions)
                        .click()

                    cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
                        .should('not.exist')

                    cy.get(s.dialogModal.entityConflictModal.buttonAccept)
                        .click()

                    // TODO: Selects score actions immediately, need to verify memory
                    // trainDialog.VerifyEntityLabel(labeledWord1, testData.entityName)
                    util.selectAction(s.trainDialog.actionScorerTextActions, testData.actionResponse)

                    cy.get(s.trainDialog.buttonAbandon)
                        .click()

                    cy.get(s.confirmCancelModal.buttonConfirm)
                        .click()

                    cy.wait(1000)
                    cy.get(s.trainingStatus.completed, { timeout: constants.training.timeout })
                })
            })
        })

        context('Log Dialogs', () => {
            before(() => {
                // Wait for training completed to ensure labels will be predicted
                cy.reload()

                cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
                    .should('not.exist')

                cy.get(s.model.buttonNavLogDialogs)
                    .click();

                // Create log dialogs (one for each test to isolate behavior)
                (new Array<number>(4)).fill(0).forEach((_, i) => {
                    cy.get(s.logDialogs.buttonCreate)
                        .click()

                    cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
                        .should('not.exist')

                    util.inputText(testData.userInput1)
                    cy.get(s.webChat.messageFromBot, { timeout: constants.prediction.timeout })
                        .contains(testData.actionResponse)

                    util.inputText(testData.userInput2)
                    cy.get(s.webChat.messageFromBot, { timeout: constants.prediction.timeout })
                        .should($messages => {
                            expect($messages).to.contain(testData.actionResponse)
                            expect($messages).to.have.length(4)
                        })

                    util.inputText(testData.userInput3)
                    cy.get(s.webChat.messageFromBot, { timeout: constants.prediction.timeout })
                        .should($messages => {
                            expect($messages).to.contain(testData.actionResponse)
                            expect($messages).to.have.length(6)
                        })

                    cy.get(s.logDialog.buttonDone)
                        .click()

                    cy.get(s.logDialog.modal)
                        .should('not.exist')

                    cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
                        .should('not.exist')
                })

                // Change the labels on train dialogs to create conflict
                cy.get(s.model.buttonNavTrainDialogs)
                    .click()

                cy.get(s.trainDialogs.descriptions)
                    .contains(testData.userInput1)
                    .click()

                cy.get(s.webChat.messageFromMe)
                    .contains(testData.userInput1)
                    .click()

                // Change labels on input 1
                util.removeLabel(labeledWord1)

                cy.get('body')
                    .trigger(constants.events.selectWord, { detail: labeledWord2 })

                cy.get(s.entityPicker.inputSearch)
                    .wait(100)
                    .type(testData.entityName)
                    .type('{enter}')

                cy.get(s.extractionEditor.buttonSubmitChanges)
                    .click()

                cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
                    .should('not.exist')

                // Change labels on input 2
                cy.get(s.webChat.messageFromMe)
                    .contains(testData.userInput2)
                    .click()

                util.removeLabel(labeledWord1)

                cy.get('body')
                    .trigger(constants.events.selectWord, { detail: labeledWord2 })

                cy.get(s.entityPicker.inputSearch)
                    .wait(100)
                    .type(testData.entityName)
                    .type('{enter}')

                cy.get(s.extractionEditor.buttonSubmitChanges)
                    .click()

                cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
                    .should('not.exist')

                cy.get(s.trainDialog.buttonSave)
                    .click()

                cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
                    .should('not.exist')

                cy.get(s.model.buttonNavLogDialogs)
                    .click()
            })

            describe('direct conversion without edit', () => {
                it('clicking Save As Train dialog should show conflict modal', () => {
                    cy.get(s.logDialogs.description)
                        .contains(testData.userInput1)
                        .click()

                    cy.get(s.dialogModal.buttonSaveAsTrainDialog)
                        .click()

                    cy.get(s.logConversionConflictsModal.modal)
                })

                describe('verify behavior of controls', () => {
                    it('should show button to view each conflict in the dialog', () => {
                        cy.get(s.logConversionConflictsModal.conflictButtons)
                            .should('have.length', 2)
                    })

                    it('should show the first conflict as active', () => {
                        cy.get(s.logConversionConflictsModal.conflict1)
                            .should('have.class', 'active')

                        cy.get(s.logConversionConflictsModal.conflict2)
                            .should('not.have.class', 'active')
                    })

                    // TODO: Could improve to verify clicking button shows correct conflict

                    it('clicking next should change the active conflict', () => {
                        cy.get(s.logConversionConflictsModal.buttonNext)
                            .click()

                        cy.get(s.logConversionConflictsModal.conflict2)
                            .should('have.class', 'active')
                    })

                    it('clicking previous should change the active conflict', () => {
                        cy.get(s.logConversionConflictsModal.buttonPrevious)
                            .click()

                        cy.get(s.logConversionConflictsModal.conflict1)
                            .should('have.class', 'active')
                    })

                    it('clicking abort should close the modal', () => {
                        cy.get(s.logConversionConflictsModal.buttonAbort)
                            .click()

                        cy.get(s.logConversionConflictsModal.modal)
                            .should('not.exist')
                    })
                })

                describe('behavior of accept', () => {
                    it('clicking accept should close the modal and convert the dialog which removes it from the list', () => {
                        cy.get(s.dialogModal.buttonSaveAsTrainDialog)
                            .click()

                        cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
                            .should('not.exist')

                        cy.get(s.logConversionConflictsModal.buttonAccept)
                            .click()

                        cy.get(s.logConversionConflictsModal.modal)
                            .should('not.exist')

                        cy.get(s.mergeModal.buttonSaveAsIs)
                            .click()

                        cy.get(s.logDialogs.description)
                            .should('have.length', 3)
                    })
                })
            })

            describe('insert operations', () => {
                describe('insert user input', () => {
                    it('should show log conversion conflict modal', () => {
                        cy.get(s.logDialogs.description)
                            .contains(testData.userInput1)
                            .click()

                        cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
                            .should('not.exist')

                        // Due to bug this has to be second input
                        cy.get(s.webChat.messageFromMe)
                            .contains(testData.userInput3)
                            .click()

                        cy.get(s.webChat.buttonAddInput)
                            .click()

                        cy.get(s.addInputModal.branchInput)
                            .type('New User Input')

                        cy.get(s.dialogModal.branchSubmit)
                            .click()

                        cy.get(s.logConversionConflictsModal.modal, { timeout: 10000 })
                    })
                })

                describe('insert bot action', () => {
                    it('should show log conversion conflict modal', () => {
                        cy.get(s.logDialogs.description)
                            .contains(testData.userInput1)
                            .click()

                        cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
                            .should('not.exist')

                        // Get second bot action since there is to be bug with inserting after first
                        cy.get(s.webChat.messageFromBot)
                            .eq(2)
                            .contains(testData.actionResponse)
                            .click()

                        cy.get(s.webChat.buttonAddAction)
                            .click()

                        cy.get(s.logConversionConflictsModal.modal, { timeout: 10000 })
                    })
                })

                afterEach(() => {
                    cy.WaitForStableDOM()

                    cy.get(s.logConversionConflictsModal.buttonAccept)
                        .click()

                    cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
                        .should('not.exist')

                    cy.get(s.logConversionConflictsModal.modal)
                        .should('not.exist')

                    cy.get(s.dialogModal.buttonCloseSave)
                        .click()

                    // Modal should not pop up since dialog is already corrected
                    cy.get(s.logConversionConflictsModal.modal)
                        .should('not.exist')

                    cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
                        .should('not.exist')

                    cy.get(s.mergeModal.buttonSaveAsIs)
                        .click()

                    cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
                        .should('not.exist')

                    cy.reload()

                    cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
                        .should('not.exist')
                })
            })

            describe('continuing the dialog', () => {
                it('should show log conversion conflict modal', () => {
                    cy.get(s.logDialogs.description)
                        .contains(testData.userInput1)
                        .click()

                    util.inputText('Continued Log Dialog')

                    cy.get(s.logConversionConflictsModal.modal)

                    cy.WaitForStableDOM()

                    cy.get(s.logConversionConflictsModal.buttonAccept)
                        .click()

                    cy.get(s.trainDialog.buttonScoreActions)
                        .click()

                    cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
                        .should('not.exist')

                    util.selectAction(s.trainDialog.actionScorerTextActions, testData.actionResponse)

                    cy.get(s.trainDialog.buttonSave)
                        .click()

                    cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
                        .should('not.exist')

                    cy.WaitForStableDOM()
                    cy.get(s.mergeModal.buttonSaveAsIs)
                        .click()

                    cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
                        .should('not.exist')
                })
            })
        })
    })
})