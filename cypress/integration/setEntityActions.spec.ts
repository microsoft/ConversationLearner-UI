export default 1

const testSelectors = {
    common: {
        spinner: '.cl-spinner',
    },
    models: {
        create: '[data-testid=model-list-create-new-button]',
        buttonImport: '[data-testid=model-list-import-model-button]',
        buttonLocalFile: '[data-testid="model-creator-locate-file-button"]',
        name: '[data-testid=model-creator-input-name]',
        submit: '[data-testid=model-creator-submit-button]',
        inputFile: '[data-testid="model-creator-import-file-picker"] > div > input[type="file"]',
    },
    model: {
        navActions: '[data-testid="app-index-nav-link-actions"]',
        navEntities: '[data-testid="app-index-nav-link-entities"]',
        navTrainDialogs: '[data-testid=app-index-nav-link-train-dialogs]',
    },
    entities: {
        name: '[data-testid="entities-name"]',
    },
    entity: {
        enumValue: '[data-testid="entity-enum-value"]',
        enumValueName: '[data-testid="entity-enum-value-value-name"]',
        enumValueButtonDelete: '[data-testid="entity-enum-value-button-delete"]',
        buttonDelete: '[data-testid="entity-button-delete"]',
        buttonCancel: '[data-testid="entity-button-cancel"]',
        buttonSave: '[data-testid="entity-creator-button-save"]',
    },
    actions: {
        newAction: '[data-testid="actions-button-create"]',
        setEntityResponseText: '[data-testid="actions-list-set-entity"]',
    },
    action: {
        typeDropDown: '[data-testid="dropdown-action-type"]',
        dropDownOptions: 'button.ms-Dropdown-item',
        entityDropDown: '[data-testid="action-set-entity"]',
        enumDropDown: '[data-testid="action-set-enum"]',
        waitForResponseCheckbox: '[data-testid="action-creator-wait-checkbox"]',
        createButton: '[data-testid="action-creator-create-button"]',
        setEntityWarning: '[data-testid="action-set-entity-warning"]',
    },
    confirmCancelModal: {
        buttonCancel: '[data-testid="confirm-cancel-modal-cancel"]',
        buttonConfirm: '[data-testid="confirm-cancel-modal-accept"]',
        buttonOk: '[data-testid="confirm-cancel-modal-ok"]',
    },
    trainDialogs: {
        buttonNew: '[data-testid="button-new-train-dialog"]',
    },
    trainDialog: {
        inputWebChat: 'input[placeholder="Type your message..."]',
        buttonScoreActions: '[data-testid="score-actions-button"]',
        buttonAbandon: '[data-testid="edit-dialog-modal-abandon-delete-button"]',
        buttonSelectAction: '[data-testid="action-scorer-button-clickable"]',
        buttonSave: '[data-testid="edit-teach-dialog-close-save-button"]',
        actionScorerSetEntityActions: '[data-testid="action-scorer-action-set-entity"]',
        actionScorerTextActions: '[data-testid="action-scorer-text-response"]',
        actionScorer: {
            rowField: '[data-automationid="DetailsRowFields"]',
        }
    },
}

const testConstants = {
    spinner: {
        timeout: 120000,
    },
    prediction: {
        timeout: 60000,
    }
}

describe('Set Entity Actions', () => {
    const testData = {
        modelName: `setEntity`,
        modelFile: 'setEntity.cl',
        enumValueCount: 14,
        entity: {
            usedName: 'drinkSize',
            unusedName: 'unusedEntity',
            usedEnumName: 'SMALL',
            unusedEnumName: 'LARGE',
        },
        action: {
            textType: 'TEXT',
            text: 'What size fries would you like?',
            setEntityType: 'SET_ENTITY',
            entityName: 'drinkSize',
            enumValue: 'MEDIUM',
            nonExistingEnumValue: 'LARGE',
        }
    }

    describe('model behavior', () => {
        before(() => {
            cy.visit('http://localhost:3000')

            cy.get(testSelectors.common.spinner, { timeout: testConstants.spinner.timeout })
                .should('not.exist')

            cy.get(testSelectors.models.buttonImport)
                .click()

            cy.get(testSelectors.models.name)
                .type(`z-${testData.modelName}-${Cypress.moment().format('MM-D-mm-ss')}`)

            cy.get(testSelectors.models.buttonLocalFile)
                .click()

            cy.UploadFile(testData.modelFile, testSelectors.models.inputFile)

            cy.get(testSelectors.models.submit)
                .click()

            cy.get(testSelectors.common.spinner, { timeout: testConstants.spinner.timeout })
                .should('not.exist')
        })

        describe('enum entity deletion', () => {
            before(() => {
                cy.reload()
                cy.get(testSelectors.common.spinner, { timeout: testConstants.spinner.timeout })
                    .should('not.exist')

                cy.get(testSelectors.model.navEntities)
                    .click()
            })

            beforeEach(() => {
                cy.reload()
                cy.get(testSelectors.common.spinner, { timeout: testConstants.spinner.timeout })
                    .should('not.exist')
            })

            it('should prevent deletion of enum entities used within set entity actions', () => {
                cy.get(testSelectors.entities.name)
                    .contains(testData.entity.usedName)
                    .click()

                cy.get(testSelectors.entity.buttonDelete)
                    .click()

                cy.get(testSelectors.confirmCancelModal.buttonCancel)
                    .click()

                cy.wait(500)

                cy.get(testSelectors.entity.buttonCancel)
                    .click()
            })

            it('should prevent deletion of enum VALUES used within set entity actions', () => {
                cy.get(testSelectors.entities.name)
                    .contains(testData.entity.usedName)
                    .click()

                // TODO: Why doesn't contains work? It should check value field
                // cy.contains(testSelectors.entity.enumValueName, testData.entity.usedEnumName)
                cy.get(testSelectors.entity.enumValue)
                    .get(`[value="${testData.entity.usedEnumName}"]`)
                    .parents(testSelectors.entity.enumValue)
                    .find(testSelectors.entity.enumValueButtonDelete)
                    .should('have.attr', 'disabled')
            })

            it('should allow deletion of unused enum values', () => {
                cy.get(testSelectors.entities.name)
                    .contains(testData.entity.usedName)
                    .click()

                // TODO: Why doesn't contains work? It should check value field
                // cy.contains(testSelectors.entity.enumValueName, testData.entity.usedEnumName)
                cy.get(testSelectors.entity.enumValue)
                    .get(`[value="${testData.entity.unusedEnumName}"]`)
                    .parents(testSelectors.entity.enumValue)
                    .find(testSelectors.entity.enumValueButtonDelete)
                    .click()

                cy.get(testSelectors.entity.buttonSave)
            })

            it('should allow deletion of enum entities NOT used within actions', () => {
                cy.get(testSelectors.entities.name)
                    .contains(testData.entity.unusedName)
                    .click()

                cy.get(testSelectors.entity.buttonDelete)
                    .click()

                cy.get(testSelectors.confirmCancelModal.buttonConfirm)
                    .click()

                cy.wait(500)

                cy.get(testSelectors.common.spinner, { timeout: testConstants.spinner.timeout })
                    .should('not.exist')
            })
        })

        describe('manual creation', () => {
            before(() => {
                cy.reload()
                cy.get(testSelectors.common.spinner, { timeout: testConstants.spinner.timeout })
                    .should('not.exist')
                cy.get(testSelectors.model.navActions)
                    .click()
            })

            beforeEach(() => {
                cy.reload()
                cy.get(testSelectors.common.spinner, { timeout: testConstants.spinner.timeout })
                    .should('not.exist')

                cy.get(testSelectors.actions.newAction)
                    .click()
            })

            it('should show correct form state when SET_ENTITY type is selected', () => {
                cy.get(testSelectors.action.entityDropDown)
                    .should('not.exist')

                cy.get(testSelectors.action.enumDropDown)
                    .should('not.exist')

                selectDropDownOption(testSelectors.action.typeDropDown, testData.action.setEntityType)

                cy.get(testSelectors.action.setEntityWarning)
                cy.get(testSelectors.action.entityDropDown)
                cy.get(testSelectors.action.enumDropDown)
                cy.get(testSelectors.action.waitForResponseCheckbox)
                    .find('button')
                    .should('have.attr', 'disabled')
                    .should('not.have.attr', 'checked')
            })

            it('should reset the value of the fields when changing the action type', () => {
                selectDropDownOption(testSelectors.action.typeDropDown, testData.action.setEntityType)
                selectDropDownOption(testSelectors.action.entityDropDown, testData.action.entityName)
                selectDropDownOption(testSelectors.action.enumDropDown, testData.action.enumValue)
                selectDropDownOption(testSelectors.action.typeDropDown, testData.action.textType)
                selectDropDownOption(testSelectors.action.typeDropDown, testData.action.setEntityType)

                // field should be unset
                cy.get(testSelectors.action.entityDropDown)
                    .should('not.have.text', testData.action.entityName)

                // enum field should be unset
                cy.get(testSelectors.action.entityDropDown)
                    .should('not.have.text', testData.action.enumValue)
            })

            it('should not allow creating the action unless entity and enum are set', () => {
                selectDropDownOption(testSelectors.action.typeDropDown, testData.action.setEntityType)

                cy.get(testSelectors.action.createButton)
                    .should('have.attr', 'disabled')

                selectDropDownOption(testSelectors.action.entityDropDown, testData.action.entityName)

                cy.get(testSelectors.action.createButton)
                    .should('have.attr', 'disabled')

                selectDropDownOption(testSelectors.action.enumDropDown, testData.action.enumValue)

                cy.get(testSelectors.action.createButton)
                    .should('not.have.attr', 'disabled')
            })

            it('should prevent creating duplicate actions (same entity and enum value)', () => {
                // Create action 
                selectDropDownOption(testSelectors.action.typeDropDown, testData.action.setEntityType)
                selectDropDownOption(testSelectors.action.entityDropDown, testData.action.entityName)
                selectDropDownOption(testSelectors.action.enumDropDown, testData.action.enumValue)
                cy.get(testSelectors.action.createButton)
                    .click()

                cy.get(testSelectors.common.spinner, { timeout: testConstants.spinner.timeout })
                    .should('not.exist')

                cy.get(testSelectors.actions.newAction)
                    .click()

                // Try to create duplicate
                selectDropDownOption(testSelectors.action.typeDropDown, testData.action.setEntityType)
                selectDropDownOption(testSelectors.action.entityDropDown, testData.action.entityName)
                selectDropDownOption(testSelectors.action.enumDropDown, testData.action.enumValue)
                cy.get(testSelectors.action.createButton)
                    .click()

                cy.get(testSelectors.confirmCancelModal.buttonOk)
                    .click()

                cy.get(testSelectors.confirmCancelModal.buttonOk)
                    .should('not.exist')
            })
        })

        describe('editing', () => {
            before(() => {
                cy.reload()
                cy.get(testSelectors.common.spinner, { timeout: testConstants.spinner.timeout })
                    .should('not.exist')
                cy.get(testSelectors.model.navActions)
                    .click()
            })

            it('should show the entity name and enum value in the fields', () => {
                cy.get(testSelectors.actions.setEntityResponseText)
                    .contains(`${testData.action.entityName}: ${testData.action.enumValue}`)
                    .click()

                cy.get(testSelectors.action.entityDropDown)
                    .contains(testData.action.entityName)

                cy.get(testSelectors.action.enumDropDown)
                    .contains(testData.action.enumValue)
            })

            // TODO: Should probably make everything disabled.
            it('should not allow saving changes to SET_ENTITY actions', () => {
                cy.get(testSelectors.action.setEntityWarning)

                selectDropDownOption(testSelectors.action.enumDropDown, testData.action.nonExistingEnumValue)

                cy.get(testSelectors.action.createButton)
                    .should('have.attr', 'disabled')
            })
        })

        describe('automatic creation', () => {
            before(() => {
                cy.reload()
                cy.get(testSelectors.common.spinner, { timeout: testConstants.spinner.timeout })
                    .should('not.exist')

                cy.get(testSelectors.model.navTrainDialogs)
                    .click()
            })

            it('should create a placeholder action for each possible enum value', () => {
                cy.get(testSelectors.trainDialogs.buttonNew)
                    .click()

                cy.get(testSelectors.trainDialog.inputWebChat)
                    .type('User input{enter}')

                cy.get(testSelectors.common.spinner, { timeout: testConstants.spinner.timeout })
                    .should('not.exist')

                cy.get(testSelectors.trainDialog.buttonScoreActions)
                    .click()

                cy.get(testSelectors.common.spinner, { timeout: testConstants.spinner.timeout })
                    .should('not.exist')

                cy.get(testSelectors.trainDialog.actionScorerSetEntityActions)
                    .should('have.length', testData.enumValueCount)
            })

            // dependent on above
            it('when clicking the placeholder action it should create a default set entity action then take it', () => {
                const setEntityPlaceholderText = `${testData.action.entityName}: ${testData.action.nonExistingEnumValue}`

                // Select set entity action
                selectAction(testSelectors.trainDialog.actionScorerSetEntityActions, setEntityPlaceholderText)

                cy.get(testSelectors.common.spinner, { timeout: testConstants.spinner.timeout })
                    .should('not.exist')

                // Select other wait action
                selectAction(testSelectors.trainDialog.actionScorerTextActions, testData.action.text)

                cy.get(testSelectors.common.spinner, { timeout: testConstants.spinner.timeout })
                    .should('not.exist')

                cy.get(testSelectors.trainDialog.buttonSave)
                    .click()

                cy.get(testSelectors.common.spinner, { timeout: testConstants.spinner.timeout })
                    .should('not.exist')

                // TODO: Why is closing modal delayed
                cy.get('.cl-modal--teach')
                    .should('not.exist')

                cy.get(testSelectors.model.navActions)
                    .click()

                cy.get(testSelectors.actions.setEntityResponseText)
                    .contains(setEntityPlaceholderText)
            })
        })


        // TODO: What to test? Deletion currently works the same
        xdescribe('action deletion', () => {
            before(() => {
                cy.reload()
                cy.get(testSelectors.model.navActions)
                    .click()

                cy.get(testSelectors.common.spinner, { timeout: testConstants.spinner.timeout })
                    .should('not.exist')
            })
        })
    })

    describe('scenario using set entity actions', () => {
        before(() => {
            cy.visit('http://localhost:3000')

            cy.get(testSelectors.common.spinner, { timeout: testConstants.spinner.timeout })
                .should('not.exist')

            cy.get(testSelectors.models.buttonImport)
                .click()

            cy.get(testSelectors.models.name)
                .type(`z-${testData.modelName}-${Cypress.moment().format('MM-D-mm-ss')}`)

            cy.get(testSelectors.models.buttonLocalFile)
                .click()

            cy.UploadFile(testData.modelFile, testSelectors.models.inputFile)

            cy.get(testSelectors.models.submit)
                .click()

            cy.get(testSelectors.common.spinner, { timeout: testConstants.spinner.timeout })
                .should('not.exist')
        })

        it('should successful place fast food order using context for instead of labels', () => {
            cy.get(testSelectors.model.navTrainDialogs)
                .click()

            cy.get(testSelectors.trainDialogs.buttonNew)
                .click()

            inputText(`Hi, I'd like a large coke and fries.`)
            clickScoreActionButton()
            selectAction(testSelectors.trainDialog.actionScorerSetEntityActions, 'drinkSize: LARGE')
            selectAction(testSelectors.trainDialog.actionScorerTextActions, 'What size fries would you like?')

            inputText(`Um, make that a medium.`)
            clickScoreActionButton()
            selectAction(testSelectors.trainDialog.actionScorerSetEntityActions, 'friesSize: MEDIUM')
            selectAction(testSelectors.trainDialog.actionScorerTextActions, 'Ok, I have an order for a LARGE drink and MEDIUM fries. Is that correct?')

            inputText(`Actually, make the fries a small`)
            clickScoreActionButton()
            selectAction(testSelectors.trainDialog.actionScorerSetEntityActions, 'orderConfirmation: NO')
            selectAction(testSelectors.trainDialog.actionScorerSetEntityActions, 'friesSize: SMALL')
            selectAction(testSelectors.trainDialog.actionScorerTextActions, 'Ok, I have an order for a LARGE drink and SMALL fries. Is that correct?')

            inputText(`Yep, that's correct.`)
            clickScoreActionButton()
            selectAction(testSelectors.trainDialog.actionScorerSetEntityActions, 'orderConfirmation: YES')
            selectAction(testSelectors.trainDialog.actionScorerTextActions, `Ok, your order number is 58. Please wait over there.`)

            cy.get(testSelectors.trainDialog.buttonSave)
                .click()

            cy.get(testSelectors.common.spinner, { timeout: testConstants.spinner.timeout })
                .should('not.exist')

            // TODO: Why is closing modal delayed
            cy.get('.cl-modal--teach')
                .should('not.exist')
        })
    })
})

function selectDropDownOption(dropDownSelector: string, optionName: string) {
    cy.get(dropDownSelector)
        .click()
        .then(() => {
            cy.get(testSelectors.action.dropDownOptions)
                .contains(optionName)
                .click()
        })
}

function selectAction(actionScorerSelector: string, actionResponseText: string) {
    cy.get(actionScorerSelector)
        .contains(actionResponseText)
        .parents(testSelectors.trainDialog.actionScorer.rowField)
        .find(testSelectors.trainDialog.buttonSelectAction)
        .click()

    cy.get(testSelectors.common.spinner, { timeout: testConstants.spinner.timeout })
        .should('not.exist')
}

function inputText(text: string) {
    cy.get(testSelectors.trainDialog.inputWebChat)
        .type(`${text}{enter}`)

    cy.get(testSelectors.common.spinner, { timeout: testConstants.spinner.timeout })
        .should('not.exist')
}

function clickScoreActionButton() {
    cy.get(testSelectors.trainDialog.buttonScoreActions)
        .click();
    cy.get(testSelectors.common.spinner, { timeout: testConstants.spinner.timeout })
        .should('not.exist');
}
