import constants from '../support/constants'
import s from '../support/selectors'
import * as util from '../support/utilities'

describe('Action Deletion', () => {
    const testData = {
        modelName: `actionDeletion`,
        modelFile: `actionDeletion.cl`,
        dialogs: {
            preservePlaceholder: 'preservePlaceholder',
            markInvalid: 'markInvalid',
            stillValidAfterRemoval: 'stillValidAfterRemoval',
            notOnlyOccurrence: 'notOnlyOccurrence',
            notOnlyScorerStep: 'notOnlyScorerStep',
            nonTerminal: 'nonTerminal',
            setEntity: 'setEntity',
            preserveValidity: 'preserveValidity',
        },
        actions: {
            terminal1: 'Terminal Text 1',
            terminal2: 'Terminal Text 2',
            terminal3: 'Terminal Text 3',
            terminal4: 'Terminal Text 4',
            nonTerminal1: 'Non-terminal Text 1',
            nonTerminal2: 'Non-terminal Text 2',
            setEntity: 'myEnum: THREE',
        },
    }

    before(() => {
        cy.visit(constants.baseUrl)
        util.importModel(testData.modelName, testData.modelFile)
    })

    describe('preserve action placeholder', () => {
        beforeEach(() => {
            cy.wait(500)
            cy.get(s.model.buttonNavActions)
                .click()
        })

        it('should mark the dialog using action as invalid', () => {
            // select action 1
            cy.get(s.actions.textResponse)
                .contains(testData.actions.terminal1)
                .click()

            // delete action without option
            cy.get(s.action.buttonDelete)
                .click()

            // wait deletion calculation
            cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
                .should('not.exist')

            cy.server()
            cy.route('/sdk/app/*/traindialogs*').as('getTrainDialogs')

            cy.get(s.actionDeleteModal.buttonConfirm)
                .click()

            // wait actual deletion
            cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
                .should('not.exist')

            cy.wait(['@getTrainDialogs'])

            // open affected dialog
            cy.get(s.model.buttonNavTrainDialogs)
                .click()

            cy.get(s.trainDialogs.descriptions)
                .contains(testData.dialogs.preservePlaceholder)
                .click()

            // verify has invalid
            cy.get(s.webChat.messageFromBotException)
            cy.get(s.dialogModal.error)

            cy.get(s.dialogModal.buttonCloseSave)
                .click()
        })
    })

    describe('remove scorer step', () => {
        describe('terminal actions', () => {
            before(() => {
                cy.wait(500)
                cy.get(s.model.buttonNavActions)
                    .click()

                cy.get(s.actions.textResponse)
                    .contains(testData.actions.terminal2)
                    .click()

                // delete action without option
                cy.get(s.action.buttonDelete)
                    .click()

                // wait deletion calculation
                cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
                    .should('not.exist')

                cy.get(s.actionDeleteModal.deleteTypeB)
                    .siblings('label')
                    .click()

                cy.server()
                cy.route('/sdk/app/*/traindialogs*').as('getTrainDialogs')

                cy.get(s.actionDeleteModal.buttonConfirm)
                    .click()

                // wait actual deletion
                cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
                    .should('not.exist')

                cy.wait(['@getTrainDialogs'])

                // open affected dialog
                cy.get(s.model.buttonNavTrainDialogs)
                    .click()
            })

            beforeEach(() => {
                cy.wait(500)
            })

            afterEach(() => {
                // try to close modal even if test fails
                cy.get(s.dialogModal.buttonCloseSave)
                    .click()
            })

            it('should mark dialogs invalid if action user other than only score step of last round', () => {
                cy.get(s.trainDialogs.descriptions)
                    .contains(testData.dialogs.markInvalid)
                    .click()

                // verify has invalid
                cy.get(s.webChat.messageFromMeException)
                cy.get(s.dialogModal.error)
            })

            it('should remain valid if action was the only scorer steps of last round', () => {
                cy.get(s.trainDialogs.descriptions)
                    .contains(testData.dialogs.stillValidAfterRemoval)
                    .click()

                // verify not invalid
                cy.get(s.dialogModal.container)
                cy.get(s.webChat.messageFromMeException)
                    .should('not.exist')
                cy.get(s.webChat.messageFromBotException)
                    .should('not.exist')
                cy.get(s.dialogModal.error)
                    .should('not.exist')
            })

            it('should become invalid if last round contains multiple scorer steps (non-terminal)', () => {
                cy.get(s.trainDialogs.descriptions)
                    .contains(testData.dialogs.notOnlyScorerStep)
                    .click()

                // verify not invalid
                cy.get(s.dialogModal.container)
                cy.get(s.webChat.messageDownArrow)
            })

            it('should become invalid if terminal action was used in a previous round and last round', () => {
                cy.get(s.trainDialogs.descriptions)
                    .contains(testData.dialogs.notOnlyOccurrence)
                    .click()

                // verify not invalid
                cy.get(s.dialogModal.container)
                cy.get(s.webChat.messageFromMeException)
            })
        })

        describe('non-terminal', () => {
            beforeEach(() => {
                cy.wait(500)
                cy.get(s.model.buttonNavActions)
                    .click()
            })

            afterEach(() => {
                // try to close modal even if test fails
                cy.get(s.dialogModal.buttonCloseSave)
                    .click()
            })

            describe('does not affect memory', () => {
                it('removing TEXT action from dialog should not modify validity', () => {
                    cy.get(s.actions.textResponse)
                        .contains(testData.actions.nonTerminal1)
                        .click()

                    // delete action without option
                    cy.get(s.action.buttonDelete)
                        .click()

                    // wait deletion calculation
                    cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
                        .should('not.exist')

                    cy.get(s.actionDeleteModal.deleteTypeB)
                        .siblings('label')
                        .click()

                    cy.server()
                    cy.route('/sdk/app/*/traindialogs*').as('getTrainDialogs')

                    cy.get(s.actionDeleteModal.buttonConfirm)
                        .click()

                    // wait actual deletion
                    cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
                        .should('not.exist')

                    cy.wait(['@getTrainDialogs'])

                    // open affected dialog
                    cy.get(s.model.buttonNavTrainDialogs)
                        .click()

                    cy.get(s.trainDialogs.descriptions)
                        .contains(testData.dialogs.nonTerminal)
                        .click()

                    // verify not invalid
                    cy.get(s.webChat.messageFromMeException)
                        .should('not.exist')
                    cy.get(s.webChat.messageFromBotException)
                        .should('not.exist')
                    cy.get(s.dialogModal.error)
                        .should('not.exist')
                })

                xit('removing CARD action from dialog should not modify validity', () => {
                    // could add test for card but it's the same as above so skipped for time
                })
            })

            describe('does affect memory', () => {
                it('removing SET_ENTITY action from dialog should require replay and show WARNING', () => {
                    cy.get(s.actions.setEntityResponseText)
                        .contains(testData.actions.setEntity)
                        .click()

                    // delete action without option
                    cy.get(s.action.buttonDelete)
                        .click()

                    // wait deletion calculation
                    cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
                        .should('not.exist')

                    cy.get(s.actionDeleteModal.deleteTypeB)
                        .siblings('label')
                        .click()

                    cy.server()
                    cy.route('/sdk/app/*/traindialogs*').as('getTrainDialogs')

                    cy.get(s.actionDeleteModal.buttonConfirm)
                        .click()

                    // wait actual deletion
                    cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
                        .should('not.exist')

                    cy.wait(['@getTrainDialogs'])

                    // open affected dialog
                    cy.get(s.model.buttonNavTrainDialogs)
                        .click()

                    cy.get(s.trainDialogs.descriptions)
                        .contains(testData.dialogs.setEntity)
                        .click()

                    // verify has invalid
                    cy.get(s.webChat.messageFromMeException)
                        .should('not.exist')
                    cy.get(s.webChat.messageFromBotException)
                        .should('not.exist')
                    cy.get(s.dialogModal.error)
                        .should('not.exist')
                    cy.get(s.dialogModal.warning)
                })

                xit('removing API action from dialog should require replay and show WARNING', () => {
                    // needs samples change
                })
            })
        })

        describe('preserve worst validity', () => {
            it('dialog should remain INVALID after deletion operation which is VALID', () => {
                cy.wait(500)
                cy.get(s.model.buttonNavActions)
                    .click()

                cy.get(s.actions.textResponse)
                    .contains(testData.actions.terminal3)
                    .click()

                // delete action without option
                cy.get(s.action.buttonDelete)
                    .click()

                // wait deletion calculation
                cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
                    .should('not.exist')

                cy.get(s.actionDeleteModal.deleteTypeB)
                    .siblings('label')
                    .click()

                cy.server()
                cy.route('/sdk/app/*/traindialogs*').as('getTrainDialogs')

                cy.get(s.actionDeleteModal.buttonConfirm)
                    .click()

                // wait actual deletion
                cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
                    .should('not.exist')

                cy.wait(['@getTrainDialogs'])

                // open affected dialog
                cy.get(s.model.buttonNavTrainDialogs)
                    .click()

                cy.get(s.trainDialogs.descriptions)
                    .contains(testData.dialogs.preserveValidity)
                    .click()

                // verify has invalid
                cy.get(s.webChat.messageFromMeException)
                cy.get(s.dialogModal.error)

                cy.get(s.dialogModal.buttonCloseSave)
                    .click()

                cy.wait(1000)

                cy.get(s.model.buttonNavActions)
                    .click()

                cy.get(s.actions.textResponse)
                    .contains(testData.actions.nonTerminal2)
                    .click()

                // delete action without option
                cy.get(s.action.buttonDelete)
                    .click()

                // wait deletion calculation
                cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
                    .should('not.exist')

                cy.server()
                cy.route('/sdk/app/*/traindialogs*').as('getTrainDialogs')

                cy.get(s.confirmCancelModal.buttonConfirm)
                    .click()

                // wait actual deletion
                cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
                    .should('not.exist')

                cy.wait(['@getTrainDialogs'])

                // open affected dialog
                cy.get(s.model.buttonNavTrainDialogs)
                    .click()

                cy.get(s.trainDialogs.descriptions)
                    .contains(testData.dialogs.preserveValidity)
                    .click()

                // verify STILL invalid
                cy.get(s.webChat.messageFromMeException)
                cy.get(s.dialogModal.error)

                cy.get(s.dialogModal.buttonCloseSave)
                    .click()
            })
        })
    })
})