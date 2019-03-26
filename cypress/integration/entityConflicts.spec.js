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
        descriptions: '[data-testid="train-dialogs-description"]',
        tags: '[data-testid="train-dialogs-tags"] .cl-tags-readonly__tag'
    },
    dialogModal: {
        branchButton: '[data-testid="edit-dialog-modal-branch-button"]',
        branchInput: '[data-testid="user-input-modal-new-message-input"]',
        branchSubmit: '[data-testid="app-create-button-submit"]',
        closeSave: '[data-testid="edit-teach-dialog-close-save-button"]',
        descriptionInput: '[data-testid="train-dialog-description"]',
        scoreActionsButton: '[data-testid="score-actions-button"]',
        tags: '[data-testid="train-dialog-tags"] .cl-tags__tag span',
        addTagButton: '[data-testid="train-dialog-tags"] .cl-tags__button-add',
        tagInput: '[data-testid="train-dialog-tags"] .cl-tags__form input',
        webChatUtterances: 'div[data-testid="web-chat-utterances"] > div.wc-message-content > div > div.format-markdown > p',
    },
    logDialogs: {
        createButton: '[data-testid="log-dialogs-new-button"]',
        firstInput: '[data-testid="log-dialogs-first-input"]'
    },
    chatModal: {
        container: '.cl-sessionmodal',
        doneButton: '[data-testid="chat-session-modal-done-testing-button"]'
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
        actionResponse: 'The only response',
    }

    before(() => {
        // models.ImportModel('z-entityConflicts', 'z-entityConflicts.cl')
        models.ImportModel('z-tagAndFrog2', 'z-tagAndFrog2.cl')
        cy.WaitForTrainingStatusCompleted()
    })

    context('Train Dialogs', () => {
        describe('new dialog with conflicting labels', () => {
            before(() => {
                cy.reload()

                trainDialog.CreateNewTrainDialog()
                trainDialog.TypeYourMessage(testData.userInput1)
                editDialogModal.RemoveEntityLabel(labeledWord1, testData.entityName)
                editDialogModal.LabelTextAsEntity(labeledWord2, testData.entityName)
            })
            
            it('should show entity conflict modal when score actions is clicked', () => {
                editDialogModal.ClickScoreActionsButton()

                cy.get('[data-testid="extract-conflict-modal-conflicting-labels"]')
            })

            it('should not change labels if abort is clicked', () => {
                cy.get('[data-testid="entity-conflict-cancel"]')
                    .click()

                editDialogModal.VerifyEntityLabel(labeledWord2, testData.entityName)
            })

            it('should change the labels if Accept is clicked', () => {
                editDialogModal.ClickScoreActionsButton()
                cy.WaitForStableDOM()
                cy.get('[data-testid="entity-conflict-accept"]')
                    .click()

                // TODO: Selects score actions immediately, need to verify memory
                // editDialogModal.VerifyEntityLabel(labeledWord1, testData.entityName)
                trainDialog.SelectAction(testData.actionResponse)
                editDialogModal.ClickAbandonDeleteButton()

                cy.get('[data-testid="confirm-cancel-modal-accept"]')
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

            cy.get('[data-testid="app-index-nav-link-log-dialogs"]')
                .click();
                    
                    
            // Create 3 log dialogs (one for each test to isolate behavior)
            (new Array(3)).fill(0).forEach(() => {
                logDialogs.CreateNewLogDialogButton()
                logDialog.TypeYourMessageValidateResponse(testData.userInput1, testData.actionResponse)
                // TODO: Why is this needed if we're validating response before next input
                cy.wait(1000)
                logDialog.TypeYourMessageValidateResponse(testData.userInput2, testData.actionResponse)
                logDialog.ClickDoneTestingButton()
            })

            // Change the labels on train dialogs
        })

        describe('insert user input', () => {
            it('should show log conversion conflict modal', () => {

            })

            it('clicking abort should NOT change the labels', () => {

            })

            it('clicking accept should change the labels', () => {

            })
        })

        describe('insert bot action', () => {
            it('should show log conversion conflict modal', () => {

            })

            it('clicking abort should NOT change the labels', () => {

            })

            it('clicking accept should change the labels', () => {

            })
        })

        describe('continuing the dialog', () => {
            it('should show log conversion conflict modal', () => {

            })

            it('clicking abort should NOT change the labels', () => {

            })

            it('clicking accept should change the labels', () => {

            })
        })
    })
})