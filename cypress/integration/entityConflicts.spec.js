/// <reference types="Cypress" />

import * as entity from '../support/Entities'
import * as models from '../support/Models'
import * as model from '../support/components/ModelPage'
import * as action from '../support/Actions'
import * as actions from '../support/components/ActionsGrid'
import * as editDialogModal from '../support/components/EditDialogModal'
import * as trainDialog from '../support/Train'
import * as logDialogs from '../support/components/LogDialogsGrid'
import * as logDialog from '../support/components/LogDialogModal'
import * as homePage from '../support/components/HomePage'

const testSelectors = {
    common: {
        spinner: '.cl-spinner'
    },
    trainDialogs: {
        description: '[data-testid="train-dialogs-description"]',
    },
    dialogModal: {
        entityConflictModal: {
            modal: '[data-testid="extract-conflict-modal-conflicting-labels"]',
            acceptButton: '[data-testid="entity-conflict-accept"]',
            cancelButton: '[data-testid="entity-conflict-cancel"]',
        },
        branchButton: '[data-testid="edit-dialog-modal-branch-button"]',
        branchInput: '[data-testid="user-input-modal-new-message-input"]',
        branchSubmit: '[data-testid="app-create-button-submit"]',
        saveAsTrainDialogButton: '[data-testid="footer-button-done"]',
        closeSave: '[data-testid="edit-teach-dialog-close-save-button"]',
        scoreActionsButton: '[data-testid="score-actions-button"]',
    },
    confirmCancelModal: {
        acceptButton: '[data-testid="confirm-cancel-modal-accept"]',
    },
    model: {
        logDialogsLink: '[data-testid="app-index-nav-link-log-dialogs"]'
    },
    logDialogs: {
        createButton: '[data-testid="log-dialogs-new-button"]',
        firstInput: '[data-testid="log-dialogs-first-input"]'
    },
    logConversionConflictsModal: {
        modal: '[data-testid="log-conversion-conflicts-modal"]',
        conflictButtons: '[data-testid^="log-conversion-conflicts-conflict"]',
        nextButton: '[data-testid="log-conversion-conflicts-modal-next"]',
        previousButton: '[data-testid="log-conversion-conflicts-modal-previous"]',
        abortButton: '[data-testid="log-conversion-conflicts-modal-cancel"]',
        acceptButton: '[data-testid="log-conversion-conflicts-modal-accept"]',
    }
}

const testConstants = {
    spinner: {
        timeout: 120000
    },
    prediction: {
        timeout: 60000
    }
}

describe('Entity Conflicts', () => {
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
                cy.get(testSelectors.common.spinner, { timeout: testConstants.spinner.timeout })
                    .should('not.exist')

                model.NavigateToTrainDialogs()
                trainDialog.CreateNewTrainDialog()
                trainDialog.TypeYourMessage(testData.userInput1)
                editDialogModal.RemoveEntityLabel(labeledWord1, testData.entityName)
                editDialogModal.LabelTextAsEntity(labeledWord2, testData.entityName)
            })

            it('should show entity conflict modal when score actions is clicked', () => {
                editDialogModal.ClickScoreActionsButton()

                cy.get(testSelectors.dialogModal.entityConflictModal.modal)
            })

            it('should not change labels if abort is clicked', () => {
                cy.get(testSelectors.dialogModal.entityConflictModal.cancelButton)
                    .click()

                editDialogModal.VerifyEntityLabel(labeledWord2, testData.entityName)
            })

            it('should change the labels if Accept is clicked', () => {
                editDialogModal.ClickScoreActionsButton()
                cy.WaitForStableDOM()
                cy.get(testSelectors.dialogModal.entityConflictModal.acceptButton)
                    .click()

                // TODO: Selects score actions immediately, need to verify memory
                // editDialogModal.VerifyEntityLabel(labeledWord1, testData.entityName)
                trainDialog.SelectAction(testData.actionResponse)
                editDialogModal.ClickAbandonDeleteButton()

                cy.get(testSelectors.confirmCancelModal.acceptButton)
                    .click()

                cy.WaitForTrainingStatusCompleted()
            })
        })
    })

    context('Log Dialogs', () => {
        before(() => {
            // Wait for training completed to ensure labels will be predicted
            cy.reload()

            cy.get(testSelectors.common.spinner, { timeout: testConstants.spinner.timeout })
                .should('not.exist')

            cy.get(testSelectors.model.logDialogsLink)
                .click()

            // Create log dialogs (one for each test to isolate behavior)
            ;(new Array(4)).fill(0).forEach((_, i) => {
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
            model.NavigateToTrainDialogs()

            cy.get(testSelectors.trainDialogs.description)
                .contains(testData.userInput1)
                .click()

            editDialogModal.SelectChatTurnExactMatch(testData.userInput1)
            editDialogModal.RemoveEntityLabel(labeledWord1, testData.entityName)
            editDialogModal.LabelTextAsEntity(labeledWord2, testData.entityName)
            editDialogModal.ClickSubmitChangesButton()

            editDialogModal.SelectChatTurnExactMatch(testData.userInput2)
            editDialogModal.RemoveEntityLabel(labeledWord1, testData.entityName)
            editDialogModal.LabelTextAsEntity(labeledWord2, testData.entityName)
            editDialogModal.ClickSubmitChangesButton()

            editDialogModal.ClickSaveCloseButton()
        })

        describe('direct conversion without edit', () => {
            before(() => {
                model.NavigateToLogDialogs()
            })

            it('clicking Save As Train dialog should show conflict modal', () => {
                cy.get(testSelectors.logDialogs.firstInput)
                    .contains(testData.userInput1)
                    .click()

                cy.get(testSelectors.dialogModal.saveAsTrainDialogButton)
                    .click()

                cy.get(testSelectors.logConversionConflictsModal.modal)
            })

            describe('verify behavior of controls', () => {
                it('should show button to view each conflict in the dialog', () => {
                    cy.get(testSelectors.logConversionConflictsModal.conflictButtons)
                        .should('have.length', 2)
                })

                it('should show the first conflict as active', () => {
                    cy.get('[data-testid="log-conversion-conflicts-conflict-1"]')
                        .should('have.class', 'active')

                    cy.get('[data-testid="log-conversion-conflicts-conflict-2"]')
                        .should('not.have.class', 'active')
                })

                // TODO: Could improve to very clicking button shows correct conflict

                it('clicking next should change the active conflict', () => {
                    cy.get(testSelectors.logConversionConflictsModal.nextButton)
                        .click()

                    cy.get('[data-testid="log-conversion-conflicts-conflict-2"]')
                        .should('have.class', 'active')
                })

                it('clicking previous should change the active conflict', () => {
                    cy.get(testSelectors.logConversionConflictsModal.previousButton)
                        .click()

                    cy.get('[data-testid="log-conversion-conflicts-conflict-1"]')
                        .should('have.class', 'active')
                })

                it('clicking abort should close the modal', () => {
                    cy.get(testSelectors.logConversionConflictsModal.abortButton)
                        .click()

                    cy.get(testSelectors.logConversionConflictsModal.modal)
                        .should('not.exist')
                })
            })

            describe('behavior of accept', () => {
                it('clicking accept should close the modal and convert the dialog which removes it from the list', () => {
                    cy.get(testSelectors.dialogModal.saveAsTrainDialogButton)
                        .click()

                    cy.WaitForStableDOM()

                    cy.get(testSelectors.logConversionConflictsModal.acceptButton)
                        .click()

                    cy.get(testSelectors.logConversionConflictsModal.modal)
                        .should('not.exist')

                    cy.get(testSelectors.logDialogs.firstInput)
                        .should('have.length', 3)
                })
            })
        })

        describe('insert operations', () => {
            describe('insert user input', () => {
                it('should show log conversion conflict modal', () => {
                    cy.get(testSelectors.logDialogs.firstInput)
                        .contains(testData.userInput1)
                        .click()

                    // Due to bug this has to be second input
                    editDialogModal.InsertUserInputAfter(testData.userInput3, 'New User Input')

                    cy.get(testSelectors.logConversionConflictsModal.modal, { timeout: 10000 })
                })
            })

            describe('insert bot action', () => {
                it('should show log conversion conflict modal', () => {
                    cy.get(testSelectors.logDialogs.firstInput)
                        .contains(testData.userInput1)
                        .click()

                    // Get second bot action since there seems to be bug with inserting after first
                    editDialogModal.InsertBotResponseAfter(testData.actionResponse, null, 1)

                    cy.get(testSelectors.logConversionConflictsModal.modal, { timeout: 10000 })
                })
            })

            afterEach(() => {
                cy.WaitForStableDOM()

                cy.get(testSelectors.logConversionConflictsModal.acceptButton)
                    .click()

                cy.get(testSelectors.common.spinner, { timeout: testConstants.spinner.timeout })
                    .should('not.exist')

                cy.get(testSelectors.logConversionConflictsModal.modal)
                    .should('not.exist')

                cy.get(testSelectors.dialogModal.closeSave)
                    .click()

                // Modal should not pop up since dialog is already corrected
                cy.get(testSelectors.logConversionConflictsModal.modal)
                    .should('not.exist')

                cy.get(testSelectors.common.spinner, { timeout: testConstants.spinner.timeout })
                    .should('not.exist')
            })
        })

        describe('continuing the dialog', () => {
            it('should show log conversion conflict modal', () => {
                cy.get(testSelectors.logDialogs.firstInput)
                    .contains(testData.userInput1)
                    .click()

                editDialogModal.TypeYourMessage('Continued Log Dialog')

                cy.get(testSelectors.logConversionConflictsModal.modal)

                cy.WaitForStableDOM()

                cy.get(testSelectors.logConversionConflictsModal.acceptButton)
                    .click()

                editDialogModal.ClickScoreActionsButton()
                trainDialog.SelectAction(testData.actionResponse)
                editDialogModal.ClickSaveCloseButton()
            })
        })
    })
})