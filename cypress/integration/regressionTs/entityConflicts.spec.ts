import * as models from '../../support/Models'
import * as model from '../../support/components/ModelPage'
import * as chatPanel from '../../support/components/ChatPanel'
import * as trainDialogsGrid from '../../support/components/TrainDialogsGrid'
import * as trainDialog from '../../support/Train'
import * as logDialogs from '../../support/components/LogDialogsGrid'
import * as logDialog from '../../support/components/LogDialogModal'
import * as entityDetectionPanel from '../../support/components/EntityDetectionPanel'
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
            cy.get(s.trainingStatus.running, { timeout: constants.training.timeout })
            cy.get(s.trainingStatus.completed, { timeout: constants.training.timeout })

            cy.get(s.model.buttonNavTrainDialogs)
                .click()

            cy.get(s.trainDialogs.buttonNew)
                .click()

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
            entityName: 'testEntity',
            userInput1: `${labeledWord1} ${labeledWord2} 1`,
            userInput2: `${labeledWord1} ${labeledWord2} 2`,
            userInput3: 'Unlabeled input',
            actionResponse: 'The only response',
        }

        before(() => {
            models.ImportModel('z-entityConflicts', 'z-entityConflicts.cl')

            cy.WaitForTrainingStatusCompleted()
        })

        context('Train Dialogs', () => {
            describe('new dialog with conflicting labels', () => {
                before(() => {
                    cy.reload()
                    cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
                        .should('not.exist')

                    model.NavigateToTrainDialogs()
                    trainDialogsGrid.TdGrid.CreateNewTrainDialog()
                    trainDialog.TypeYourMessage(testData.userInput1)
                    entityDetectionPanel.RemoveEntityLabel(labeledWord1, testData.entityName)
                    entityDetectionPanel.LabelTextAsEntity(labeledWord2, testData.entityName)
                })

                it('should show entity conflict modal when score actions is clicked', () => {
                    trainDialog.ClickScoreActionsButton()

                    cy.get(s.dialogModal.entityConflictModal.modal)
                })

                it('should not change labels if abort is clicked', () => {
                    cy.get(s.dialogModal.entityConflictModal.buttonCancel)
                        .click()

                    entityDetectionPanel.VerifyTextIsLabeledAsEntity(labeledWord2, testData.entityName)
                })

                it('should change the labels if Accept is clicked', () => {
                    trainDialog.ClickScoreActionsButton()

                    cy.WaitForStableDOM()
                    cy.get(s.dialogModal.entityConflictModal.buttonAccept)
                        .click()

                    // TODO: Selects score actions immediately, need to verify memory
                    // entityDetectionPanel.VerifyTextIsLabeledAsEntity(labeledWord1, testData.entityName)
                    trainDialog.SelectTextAction(testData.actionResponse)
                    trainDialog.ClickAbandonDeleteButton()

                    cy.get(s.confirmCancelModal.buttonConfirm)
                        .click()

                    cy.WaitForTrainingStatusCompleted()
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
                    logDialogs.CreateNewLogDialogButton()
                    logDialog.TypeYourMessageValidateResponse(testData.userInput1, testData.actionResponse)
                    // TODO: Why is this wait needed if we're waiting/validating response before next input
                    cy.wait(500)
                    logDialog.TypeYourMessageValidateResponse(testData.userInput2, testData.actionResponse)
                    cy.wait(500)
                    logDialog.TypeYourMessageValidateResponse(testData.userInput3, testData.actionResponse)
                    logDialog.ClickDoneTestingButton()
                })

                // Change the labels on train dialogs to create conflict
                model.NavigateToTrainDialogs();

                cy.get(s.trainDialogs.descriptions)
                    .contains(testData.userInput1)
                    .click()

                trainDialog.SelectChatTurnExactMatch(testData.userInput1)
                entityDetectionPanel.RemoveEntityLabel(labeledWord1, testData.entityName)
                entityDetectionPanel.LabelTextAsEntity(labeledWord2, testData.entityName)
                trainDialog.ClickSubmitChangesButton()

                trainDialog.SelectChatTurnExactMatch(testData.userInput2)
                entityDetectionPanel.RemoveEntityLabel(labeledWord1, testData.entityName)
                entityDetectionPanel.LabelTextAsEntity(labeledWord2, testData.entityName)
                trainDialog.ClickSubmitChangesButton()

                trainDialog.ClickSaveCloseButton()
            })

            describe('direct conversion without edit', () => {
                before(() => {
                    model.NavigateToLogDialogs()
                })

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

                        cy.WaitForStableDOM()

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

                        // Due to bug this has to be second input
                        chatPanel.InsertUserInputAfter(testData.userInput3, 'New User Input')

                        cy.get(s.logConversionConflictsModal.modal, { timeout: 10000 })
                    })
                })

                describe('insert bot action', () => {
                    it('should show log conversion conflict modal', () => {
                        cy.get(s.logDialogs.description)
                            .contains(testData.userInput1)
                            .click()

                        // Get second bot action since there seems to be bug with inserting after first
                        trainDialog.InsertBotResponseAfter(testData.actionResponse, null, 1)

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
                })
            })

            describe('continuing the dialog', () => {
                it('should show log conversion conflict modal', () => {
                    cy.get(s.logDialogs.description)
                        .contains(testData.userInput1)
                        .click()

                    trainDialog.TypeYourMessage('Continued Log Dialog')

                    cy.get(s.logConversionConflictsModal.modal)

                    cy.WaitForStableDOM()

                    cy.get(s.logConversionConflictsModal.buttonAccept)
                        .click()

                    trainDialog.ClickScoreActionsButton()
                    trainDialog.SelectTextAction(testData.actionResponse)
                    trainDialog.ClickSaveCloseButton()

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