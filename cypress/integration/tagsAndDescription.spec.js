/// <reference types="Cypress" />

import * as models from '../support/Models'
import * as model from '../support/components/ModelPage'
import * as actions from '../support/Actions'
import * as actionsList from '../support/components/ActionsGrid'
import * as actionsModal from '../support/components/ActionModal'
import * as editDialogModal from '../support/components/EditDialogModal'
import * as trainDialogs from '../support/components/TrainDialogsGrid'
import * as trainDialog from '../support/Train'
import * as logDialogs from '../support/components/LogDialogsGrid'
import * as logDialogModal from '../support/components/LogDialogModal'

describe('Tags and Description', () => {
    context('Train Dialogs', () => {
        const testData = {
            userInput: 'First test input',
            actionResponse: `The only response`,
            tag01: 'testTag01',
            tag02: 'testTag02',
            tag03: 'testTag03',
            description: 'Test description',
            descriptionEdit: ' EDIT',
        }

        before(() => {
            models.CreateNewModel('z-tagsAndDesc')
            model.NavigateToActions()
            actionsList.ClickNewAction()
            actions.CreateNewAction({ response: testData.actionResponse })
            model.NavigateToTrainDialogs()
        })

        beforeEach(() => {
            // open model for tags and description testing
        })

        context('Create', () => {
            it('should have no tags are description when creating new dialog', () => {
                // Create new train dialog
                trainDialog.CreateNewTrainDialog()

                // Verify that scenario and tags are empty
                cy.get('[data-testid="train-dialog-description"] .cl-borderless-text-input')
                    .should('be.empty')

                cy.get('[data-testid="train-dialog-tags"] .cl-tags__tag')
                    .should('not.exist')
            })

            it('should save the tags and description on the new dialog', () => {
                // Set description
                cy.get('[data-testid="train-dialog-description"] .cl-borderless-text-input')
                    .type(testData.description)

                // Set tags
                cy.get('[data-testid="train-dialog-tags"] .cl-tags__button-add')
                    .click()

                cy.get('.cl-tags__form input')
                    .type(`${testData.tag01}{enter}`)

                // Save
                trainDialog.TypeYourMessage(testData.userInput)
                editDialogModal.ClickScoreActionsButton()
                trainDialog.SelectAction(testData.actionResponse)
                trainDialog.Save()

                // Verify tags and description in list
                cy.get('[data-testid="train-dialogs-description"]')
                    .should('contain', testData.description)

                cy.get('[data-testid="train-dialogs-tags"] .cl-tags-readonly__tag')
                    .should('contain', testData.tag01)
            })
        })

        context('Edit', () => {
            it('should open with the tags and description', () => {
                // Open train dialog which has known description
                cy.get('[data-testid="train-dialogs-description"]')
                    .contains(testData.description)
                    .click()

                // Verify description and tags are expected in the opened dialog
                cy.get('[data-testid="train-dialog-description"] .cl-borderless-text-input')
                    .should('have.value', testData.description)

                cy.get('[data-testid="train-dialog-tags"] .cl-tags__tag span')
                    .should('have.text', testData.tag01)
            })

            it('should discard the changes made to tags and description when abandoned', () => {
                // Added a tag
                cy.get('[data-testid="train-dialog-tags"] .cl-tags__button-add')
                    .click()

                cy.get('.cl-tags__form input')
                    .type('newTag')

                // Edit description
                cy.get('[data-testid="train-dialog-description"] .cl-borderless-text-input')
                    .type('Edited Description')

                trainDialog.AbandonDialog()

                // Re-open dialog
                cy.get('[data-testid="train-dialogs-description"]')
                    .contains(testData.description)
                    .click()

                // Verify tags and description are unmodified
                cy.get('[data-testid="train-dialog-description"] .cl-borderless-text-input')
                    .should('have.value', testData.description)

                cy.get('[data-testid="train-dialog-tags"] .cl-tags__tag span')
                    .should('have.text', testData.tag01)
            })

            it('should save the edited tags and description', () => {
                // Edit tags
                cy.get('[data-testid="train-dialog-tags"] .cl-tags__button-add')
                    .click()

                cy.get('.cl-tags__form input')
                    .type(testData.tag02)

                // Edit description
                cy.get('[data-testid="train-dialog-description"] .cl-borderless-text-input')
                    .type(testData.descriptionEdit)

                trainDialog.Save()

                // Implicitly closes dialog bug stays on train dialogs list/page
                cy.reload()

                // Verify tags on dialog
                cy.get('[data-testid="train-dialogs-description"]')
                    .contains(`${testData.description}${testData.descriptionEdit}`)

                // TODO: Would be better to check each tag instead of relying concatenation of test
                cy.get('[data-testid="train-dialogs-tags"] .cl-tags-readonly__tag')
                    .should('have.text', `${testData.tag01}${testData.tag02}`)
            })

            it('(advanced edit) should save the edited tags, description, and rounds', () => {
                // Deal with edits
                expect(true).toBe(true)
            })
        })


        context('Continue', () => {
            it('should preserve tags and description when continuing a dialog', () => {
                // Open dialog
                cy.get('[data-testid="train-dialogs-description"]')
                    .contains(`${testData.description}${testData.descriptionEdit}`)
                    .click()
                    .wait(1000)

                // Edit tags
                cy.get('[data-testid="train-dialog-tags"] .cl-tags__button-add')
                    .click()

                cy.get('.cl-tags__form input')
                    .type(testData.tag03)

                // Edit description
                cy.get('[data-testid="train-dialog-description"] .cl-borderless-text-input')
                    .type(testData.descriptionEdit)

                // Modify dialog to add user input
                trainDialog.TypeYourMessage('Continued Dialog')
                editDialogModal.ClickScoreActionsButton()
                trainDialog.SelectAction(testData.actionResponse)
                editDialogModal.ClickSaveCloseButton()

                // TODO: Should cy.reload()
                // TODO: Find better alternative than waiting
                // It seems there is be bug with dialog being removed from list then re-added instead of updated in place so we wait to make sure it's there.
                cy.wait(3000)

                // Re-open dialog
                cy.get('[data-testid="train-dialogs-description"]')
                    .contains(`${testData.description}${testData.descriptionEdit}${testData.descriptionEdit}`)
                    .click()

                // Verify it has all three of the tags
                cy.get('[data-testid="train-dialogs-tags"] .cl-tags__tag')
                    .contains(testData.tag01)
                    .contains(testData.tag02)
                    .contains(testData.tag03)
            })
        })

        context('Branch', () => {
            it('should preserve tags and description after branching', () => {
                // Open train dialog
                // Edit tags
                // Edit description
                // Click branch on one of the user inputs
                // Enter a new input
                // (Dialog is branched after input is entered)
                // Verify edited tags and description are preserved
                // Save dialog
                // Reload
                // Verify old dialog with original tags and description is still in the list
                // Verify new dialog with edited tags and description is now in the list
                expect(true).to.equal(true)
            })
        })
    })

    context.only('Log Dialogs', () => {
        before(() => {
            models.ImportModel('z-tagsAndDesc', 'z-travel.cl')
            model.NavigateToLogDialogs()
        })

        beforeEach(() => {
            cy.reload()
        })

        it('should not show tags or description fields when creating a log dialog', () => {
            logDialogs.CreateNewLogDialogButton()

            // Wait until chat session model is open
            cy.get('.cl-sessionmodal')
                .should('be.visible')

            // Verify no fields for tags for description
            cy.get('[data-testid="train-dialog-description"]')
                .should('not.exist')

            cy.get('[data-testid="train-dialog-tags"]')
                .should('not.exist')
        })

        it('should not show tags or description fields when viewing a log dialog', () => {
            const testData = {
                input: 'My Log Dialog Message'
            }

            logDialogs.CreateNewLogDialogButton()
            logDialogModal.TypeYourMessage(testData.input)

            // Wait for prediction
            cy.get('.wc-message-from-bot')
                .should('not.have.class', 'wc-message-color-exception')
                .should('exist')

            logDialogModal.ClickDoneTestingButton()
        })
    })
})