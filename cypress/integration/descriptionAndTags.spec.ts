import * as models from '../support/Models'
import * as model from '../support/components/ModelPage'
import * as actions from '../support/Actions'
import * as actionsList from '../support/components/ActionsGrid'
import * as trainDialog from '../support/Train'
import * as logDialogModal from '../support/components/LogDialogModal'
import s from '../support/selectors'
import constants from '../support/constants'

describe('Description and Tags', () => {
    context('Train Dialogs', () => {
        const testData = {
            userInput: 'First test input',
            continuedInput: 'Continued Dialog',
            actionResponse: 'The only response',
            tag01: 'testTag01',
            tag02: 'testTag02',
            tag03: 'testTag03',
            tag04: 'testTag04',
            tag05: 'testTag05',
            description: 'Test description',
            descriptionEdit: ' EDIT',
        }

        before(() => {
            // TODO: Find way to preserve Intellisense
            models.CreateNewModel('z-descriptionTags')
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

                // Verify that description and tags are empty
                cy.get(s.dialogModal.inputDescription)
                    .should('be.empty')

                cy.get(s.dialogModal.tags)
                    .should('not.exist')
            })

            it('should save the tags and description on the new dialog', () => {
                // Set description
                cy.get(s.dialogModal.inputDescription)
                    .type(testData.description)

                // Set tags
                cy.get(s.dialogModal.buttonAddTag)
                    .click()

                cy.get(s.dialogModal.inputTag)
                    .type(`${testData.tag01}{enter}`)

                trainDialog.TypeYourMessage(testData.userInput)
                trainDialog.ClickScoreActionsButton()

                // Add temporary rounds to be deleted later
                trainDialog.SelectAction(testData.actionResponse)
                trainDialog.TypeYourMessage('Should be deleted')
                trainDialog.ClickScoreActionsButton()
                trainDialog.SelectAction(testData.actionResponse)
                trainDialog.Save()

                // Verify tags and description in list
                cy.get(s.trainDialogs.descriptions)
                    .should('contain', testData.description)

                cy.get(s.trainDialogs.tags)
                    .should('contain', testData.tag01)
            })
        })

        context('Edit', () => {
            it('should open with the tags and description', () => {
                // Open train dialog which has known description
                cy.get(s.trainDialogs.descriptions)
                    .contains(testData.description)
                    .click()

                // Verify description and tags are expected in the opened dialog
                cy.get(s.dialogModal.inputDescription)
                    .should('have.value', testData.description)

                cy.get(s.dialogModal.tags)
                    .should('have.text', testData.tag01)
            })

            it('should discard the changes made to tags and description when abandoned', () => {
                // Added a tag
                cy.get(s.dialogModal.buttonAddTag)
                    .click()

                cy.get(s.dialogModal.inputTag)
                    .type('newTag{enter}')

                // Edit description
                cy.get(s.dialogModal.inputDescription)
                    .type(' Abandon Edit')

                trainDialog.AbandonDialog()

                // Re-open dialog
                cy.get(s.trainDialogs.descriptions)
                    .contains(testData.description)
                    .click()

                // Verify tags and description are unmodified
                cy.get(s.dialogModal.inputDescription)
                    .should('have.value', testData.description)

                cy.get(s.dialogModal.tags)
                    .should('have.text', testData.tag01)
            })

            it('should save the edited tags and description', () => {
                // Edit tags
                cy.get(s.dialogModal.buttonAddTag)
                    .click()

                cy.get(s.dialogModal.inputTag)
                    .type(`${testData.tag02}{enter}`)

                // Edit description
                cy.get(s.dialogModal.inputDescription)
                    .type(testData.descriptionEdit)

                // Save dialog
                cy.get(s.dialogModal.buttonCloseSave)
                    .click()

                // Implicitly closes dialog, but stays on train dialogs page
                // Ensures content is persisted to server instead of only local memory
                cy.reload()

                // Verify description
                cy.get(s.trainDialogs.descriptions)
                    .contains(`${testData.description}${testData.descriptionEdit}`)

                // Verify tags
                cy.get(s.trainDialogs.tags)
                    .should(($tags) => {
                        const texts = $tags.map((_, el) => Cypress.$(el).text()).get()
                        expect(texts).to.deep.eq([
                            testData.tag01,
                            testData.tag02,
                        ])
                    })
            })

            it('(advanced edit) should save the edited tags, description, and rounds', () => {
                cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
                    .should('not.exist')

                // Re-open dialog
                cy.get(s.trainDialogs.descriptions)
                    .contains(testData.description)
                    .click()

                // Edit tags
                cy.get(s.dialogModal.buttonAddTag)
                    .click()

                cy.get(s.dialogModal.inputTag)
                    .type(`${testData.tag03}{enter}`)

                // Edit description
                cy.get(s.dialogModal.inputDescription)
                    .type(testData.descriptionEdit)

                // Delete the last bot response and user input. Affects rounds but doesn't make it invalid
                cy.server()
                cy.route('POST', '/sdk/app/*/traindialogreplay').as('postDialogReplay')
                cy.route('POST', '/sdk/app/*/history*').as('postDialogHistory')

                cy.get('[data-testid="web-chat-utterances"]')
                    .last()
                    .click()

                cy.get('[data-testid="edit-dialog-modal-delete-turn-button"]')
                    .click()

                cy.wait(['@postDialogReplay', '@postDialogHistory'])
                // TODO: Find out why wait is needed here
                // I think other than waiting for requests there is some other internal processing
                // such as rebuilding dialog activities we need to wait on
                cy.wait(1000)

                cy.get('[data-testid="web-chat-utterances"]')
                    .last()
                    .click()

                cy.get('[data-testid="edit-dialog-modal-delete-turn-button"]')
                    .click()

                cy.wait(['@postDialogReplay', '@postDialogHistory'])

                cy.route('PUT', '/sdk/app/*/traindialog/*').as('putTrainDialog')

                cy.get(s.dialogModal.buttonCloseSave)
                    // .click()
                // TODO: Find out what is blocking the click?
                trainDialog.ClickSaveCloseButton()

                cy.wait(['@putTrainDialog'])
                cy.wait(5000)
            })
        })

        context('Continue', () => {
            before(() => {
                cy.reload()

                cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
                    .should('not.exist')
            })

            it('should preserve tags and description when continuing a dialog', () => {
                // Open dialog
                cy.get(s.trainDialogs.descriptions)
                    .contains(`${testData.description}${testData.descriptionEdit}${testData.descriptionEdit}`)
                    .click()

                // TODO: Find out why we need to wait
                // Opening the dialogs /history before showing it WebChat but seems to be unrelated
                cy.wait(1000)

                // Edit tags
                cy.get(s.dialogModal.buttonAddTag)
                    .click()

                cy.get(s.dialogModal.inputTag)
                    .type(`${testData.tag04}{enter}`)

                // Edit description
                cy.get(s.dialogModal.inputDescription)
                    .type(testData.descriptionEdit)

                // Modify dialog to add user input
                trainDialog.TypeYourMessage(testData.continuedInput)
                trainDialog.ClickScoreActionsButton()
                trainDialog.SelectAction(testData.actionResponse)
                trainDialog.ClickSaveCloseButton()

                // TODO: Should cy.reload() to ensure data was persisted
                // TODO: Find better alternative than waiting
                // It seems there is be bug with dialog being removed from list then re-added instead of updated in place so we wait to make sure it's there.
                // Think it's expected, but investigation DELETE call for temp traindialog, then PUT for modified
                cy.server()
                cy.route('PUT', '/sdk/app/*/traindialog/*').as('putTrainDialog')
                cy.route('GET', '/sdk/app/*/traindialogs*').as('getTrainDialogs')
                // Give time for requests to be sent
                cy.wait(3000)
                cy.wait(['@putTrainDialog'/* , '@getTrainDialogs' */])

                // Re-open dialog'
                cy.WaitForStableDOM()
                cy.get(s.trainDialogs.descriptions)
                    .contains(`${testData.description}${testData.descriptionEdit}${testData.descriptionEdit}${testData.descriptionEdit}`)
                    .click()

                // Verify it has all three of the tags
                cy.get(s.dialogModal.tags)
                    .should(($tags) => {
                        const texts = $tags.map((i, el) => Cypress.$(el).text()).get()
                        expect(texts).to.deep.eq([
                            testData.tag01,
                            testData.tag02,
                            testData.tag03,
                            testData.tag04,
                        ])
                    })
            })
        })

        context('Branch', () => {
            before(() => {
                // Reload browser to ensure memory and wait for app to load
                cy.server()
                cy.route('GET', '/sdk/app/*/logdialogs*').as('getAppLogDialogs')
                cy.route('GET', '/sdk/app/*/source*').as('getAppSource')

                cy.reload()

                cy.wait(['@getAppLogDialogs', '@getAppSource'])
                cy.wait(1000)
            })

            it('should preserve tags and description after branching', () => {
                // Open dialog
                cy.get(s.trainDialogs.descriptions)
                    .contains(`${testData.description}${testData.descriptionEdit}${testData.descriptionEdit}${testData.descriptionEdit}`)
                    .click()

                // Edit tags
                cy.get(s.dialogModal.buttonAddTag)
                    .click()

                cy.get(s.dialogModal.inputTag)
                    .type(`${testData.tag05}{enter}`)

                // Edit description
                cy.get(s.dialogModal.inputDescription)
                    .type(testData.descriptionEdit)
                    .blur()

                cy.wait(1000)

                // Get the desired user input to branch on
                cy.get(s.dialogModal.webChatUtterances)
                    .contains(testData.continuedInput)
                    .click()

                // Click branch on one of the user inputs
                cy.get(s.dialogModal.branchButton)
                    .click()

                cy.get(s.dialogModal.branchInput)
                    .type('New Branched Input')

                cy.get(s.dialogModal.branchSubmit)
                    .click()

                cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
                    .should('not.exist')

                cy.server()
                cy.route('POST', '/sdk/app/*/scorefromhistory').as('postScoreFromHistory')
                cy.route('POST', '/sdk/app/*/history*').as('postHistory')

                cy.get(s.dialogModal.buttonScoreActionsButton)
                    .click()

                cy.wait(['@postScoreFromHistory', '@postHistory'])

                // Verify edited description and tags are preserved after branch
                cy.get(s.dialogModal.inputDescription)
                    .should('have.value', `${testData.description}${testData.descriptionEdit}${testData.descriptionEdit}${testData.descriptionEdit}${testData.descriptionEdit}`)

                cy.get(s.dialogModal.tags)
                    .should(($tags) => {
                        const texts = $tags.map((i, el) => Cypress.$(el).text()).get()
                        expect(texts).to.deep.eq([
                            testData.tag01,
                            testData.tag02,
                            testData.tag03,
                            testData.tag04,
                            testData.tag05,
                        ])
                    })

                cy.wait(500)
                cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
                    .should('not.exist')

                cy.get(s.dialogModal.buttonCloseSave)
                    .click()

                cy.server()
                cy.route('GET', '/sdk/app/*/logdialogs*').as('getAppLogDialogs')
                cy.route('GET', '/sdk/app/*/source*').as('getAppSource')
                cy.reload()
                cy.wait(['@getAppLogDialogs', '@getAppSource'])

                // Verify old dialog with original tags and description is still in the list
                cy.get(s.trainDialogs.descriptions)
                    .contains(`${testData.description}${testData.descriptionEdit}`)

                // Verify new dialog with edited tags and description is now in the list
                cy.get(s.trainDialogs.descriptions)
                    .contains(`${testData.description}${testData.descriptionEdit}${testData.descriptionEdit}`)
            })
        })
    })

    context('Log Dialogs', () => {
        before(() => {
            // Need to import a small model that has a train dialog
            models.ImportModel('z-descriptionTags', 'z-expectedEntLabl.cl')
            model.NavigateToLogDialogs()

            cy.WaitForTrainingStatusCompleted()
        })

        beforeEach(() => {
            cy.reload()
            cy.wait(4000)
        })

        it('should not show tags or description fields when creating a log dialog', () => {
            cy.server()
            cy.route('POST', '/sdk/app/*/session').as('postSession')

            cy.get(s.logDialogs.buttonCreate)
                .click()

            cy.wait('@postSession')

            cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
                .should('not.exist')

            cy.get(s.chatModal.container)
                .should('be.visible')

            cy.get('[data-testid="train-dialog-description"]')
                .should('not.exist')

            cy.get('[data-testid="train-dialog-tags"]')
                .should('not.exist')
        })

        it('should show tags or description fields when viewing a log dialog', () => {
            const testData = {
                input: 'My Log Dialog Message'
            }

            // Wait for new log dialog to be created
            cy.server()
            cy.route('POST', '/sdk/app/*/session').as('postSession')
            
            cy.get(s.logDialogs.buttonCreate)
                .click()

            cy.wait('@postSession')
            
            cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
                .should('not.exist')

            logDialogModal.TypeYourMessage(testData.input)

            // Wait for prediction and ensure it isn't an error
            cy.get('.wc-message-from-bot', { timeout: constants.prediction.timeout })
                .should('exist')
                .should('not.have.class', 'wc-message-color-exception')

            cy.server()
            cy.route('GET', '/sdk/app/*/logdialogs*').as('getLogDialogs')

            cy.get(s.chatModal.buttonDone)
                .click()

            cy.wait(['@getLogDialogs'])

            cy.get(s.logDialogs.firstInput)
                .contains(testData.input)
                .click()

            // Verify fields for tags for description
            cy.get(s.dialogModal.inputDescription)
            cy.get(s.dialogModal.buttonAddTag)

            // Close window to prevent continued polling
            cy.get(s.dialogModal.buttonCloseSave)
                .click()
        })
    })
})