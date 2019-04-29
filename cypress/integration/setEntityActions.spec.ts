import s from '../support/selectors'

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

            cy.get(s.common.spinner, { timeout: testConstants.spinner.timeout })
                .should('not.exist')

            cy.get(s.models.buttonImport)
                .click()

            cy.get(s.models.name)
                .type(`z-${testData.modelName}-${Cypress.moment().format('MM-D-mm-ss')}`)

            cy.get(s.models.buttonLocalFile)
                .click()

            cy.UploadFile(testData.modelFile, s.models.inputFile)

            cy.get(s.models.submit)
                .click()

            cy.get(s.common.spinner, { timeout: testConstants.spinner.timeout })
                .should('not.exist')
        })

        describe('enum entity deletion', () => {
            before(() => {
                cy.reload()
                cy.get(s.common.spinner, { timeout: testConstants.spinner.timeout })
                    .should('not.exist')

                cy.get(s.model.navEntities)
                    .click()
            })

            beforeEach(() => {
                cy.reload()
                cy.get(s.common.spinner, { timeout: testConstants.spinner.timeout })
                    .should('not.exist')
            })

            it('should prevent deletion of enum entities used within set entity actions', () => {
                cy.get(s.entities.name)
                    .contains(testData.entity.usedName)
                    .click()

                cy.get(s.entity.buttonDelete)
                    .click()

                cy.get(s.confirmCancelModal.buttonCancel)
                    .click()

                cy.wait(500)

                cy.get(s.entity.buttonCancel)
                    .click()
            })

            it('should prevent deletion of enum VALUES used within set entity actions', () => {
                cy.get(s.entities.name)
                    .contains(testData.entity.usedName)
                    .click()

                // TODO: Why doesn't contains work? It should check value field
                // cy.contains(testSelectors.entity.enumValueName, testData.entity.usedEnumName)
                cy.get(s.entity.enumValue)
                    .get(`[value="${testData.entity.usedEnumName}"]`)
                    .parents(s.entity.enumValue)
                    .find(s.entity.enumValueButtonDelete)
                    .should('have.attr', 'disabled')
            })

            it('should allow deletion of unused enum values', () => {
                cy.get(s.entities.name)
                    .contains(testData.entity.usedName)
                    .click()

                // TODO: Why doesn't contains work? It should check value field
                // cy.contains(testSelectors.entity.enumValueName, testData.entity.usedEnumName)
                cy.get(s.entity.enumValue)
                    .get(`[value="${testData.entity.unusedEnumName}"]`)
                    .parents(s.entity.enumValue)
                    .find(s.entity.enumValueButtonDelete)
                    .click()

                cy.get(s.entity.buttonSave)
            })

            it('should allow deletion of enum entities NOT used within actions', () => {
                cy.get(s.entities.name)
                    .contains(testData.entity.unusedName)
                    .click()

                cy.get(s.entity.buttonDelete)
                    .click()

                cy.get(s.confirmCancelModal.buttonConfirm)
                    .click()

                cy.wait(500)

                cy.get(s.common.spinner, { timeout: testConstants.spinner.timeout })
                    .should('not.exist')
            })
        })

        describe('manual creation', () => {
            before(() => {
                cy.reload()
                cy.get(s.common.spinner, { timeout: testConstants.spinner.timeout })
                    .should('not.exist')
                cy.get(s.model.navActions)
                    .click()
            })

            beforeEach(() => {
                cy.reload()
                cy.get(s.common.spinner, { timeout: testConstants.spinner.timeout })
                    .should('not.exist')

                cy.get(s.actions.newAction)
                    .click()
            })

            it('should show correct form state when SET_ENTITY type is selected', () => {
                cy.get(s.action.entityDropDown)
                    .should('not.exist')

                cy.get(s.action.enumDropDown)
                    .should('not.exist')

                selectDropDownOption(s.action.typeDropDown, testData.action.setEntityType)

                cy.get(s.action.setEntityWarning)
                cy.get(s.action.entityDropDown)
                cy.get(s.action.enumDropDown)
                cy.get(s.action.waitForResponseCheckbox)
                    .find('button')
                    .should('have.attr', 'disabled')
                    .should('not.have.attr', 'checked')
            })

            it('should reset the value of the fields when changing the action type', () => {
                selectDropDownOption(s.action.typeDropDown, testData.action.setEntityType)
                selectDropDownOption(s.action.entityDropDown, testData.action.entityName)
                selectDropDownOption(s.action.enumDropDown, testData.action.enumValue)
                selectDropDownOption(s.action.typeDropDown, testData.action.textType)
                selectDropDownOption(s.action.typeDropDown, testData.action.setEntityType)

                // field should be unset
                cy.get(s.action.entityDropDown)
                    .should('not.have.text', testData.action.entityName)

                // enum field should be unset
                cy.get(s.action.entityDropDown)
                    .should('not.have.text', testData.action.enumValue)
            })

            it('should not allow creating the action unless entity and enum are set', () => {
                selectDropDownOption(s.action.typeDropDown, testData.action.setEntityType)

                cy.get(s.action.createButton)
                    .should('have.attr', 'disabled')

                selectDropDownOption(s.action.entityDropDown, testData.action.entityName)

                cy.get(s.action.createButton)
                    .should('have.attr', 'disabled')

                selectDropDownOption(s.action.enumDropDown, testData.action.enumValue)

                cy.get(s.action.createButton)
                    .should('not.have.attr', 'disabled')
            })

            it('should prevent creating duplicate actions (same entity and enum value)', () => {
                // Create action 
                selectDropDownOption(s.action.typeDropDown, testData.action.setEntityType)
                selectDropDownOption(s.action.entityDropDown, testData.action.entityName)
                selectDropDownOption(s.action.enumDropDown, testData.action.enumValue)
                cy.get(s.action.createButton)
                    .click()

                cy.get(s.common.spinner, { timeout: testConstants.spinner.timeout })
                    .should('not.exist')

                cy.get(s.actions.newAction)
                    .click()

                // Try to create duplicate
                selectDropDownOption(s.action.typeDropDown, testData.action.setEntityType)
                selectDropDownOption(s.action.entityDropDown, testData.action.entityName)
                selectDropDownOption(s.action.enumDropDown, testData.action.enumValue)
                cy.get(s.action.createButton)
                    .click()

                cy.get(s.confirmCancelModal.buttonOk)
                    .click()

                cy.get(s.confirmCancelModal.buttonOk)
                    .should('not.exist')
            })
        })

        describe('editing', () => {
            before(() => {
                cy.reload()
                cy.get(s.common.spinner, { timeout: testConstants.spinner.timeout })
                    .should('not.exist')
                cy.get(s.model.navActions)
                    .click()
            })

            it('should show the entity name and enum value in the fields', () => {
                cy.get(s.actions.setEntityResponseText)
                    .contains(`${testData.action.entityName}: ${testData.action.enumValue}`)
                    .click()

                cy.get(s.action.entityDropDown)
                    .contains(testData.action.entityName)

                cy.get(s.action.enumDropDown)
                    .contains(testData.action.enumValue)
            })

            // TODO: Should probably make everything disabled.
            it('should not allow saving changes to SET_ENTITY actions', () => {
                cy.get(s.action.setEntityWarning)

                selectDropDownOption(s.action.enumDropDown, testData.action.nonExistingEnumValue)

                cy.get(s.action.createButton)
                    .should('have.attr', 'disabled')
            })
        })

        describe('automatic creation', () => {
            before(() => {
                cy.reload()
                cy.get(s.common.spinner, { timeout: testConstants.spinner.timeout })
                    .should('not.exist')

                cy.get(s.model.navTrainDialogs)
                    .click()
            })

            it('should create a placeholder action for each possible enum value', () => {
                cy.get(s.trainDialogs.buttonNew)
                    .click()

                cy.get(s.trainDialog.inputWebChat)
                    .type('User input{enter}')

                cy.get(s.common.spinner, { timeout: testConstants.spinner.timeout })
                    .should('not.exist')

                cy.get(s.trainDialog.buttonScoreActions)
                    .click()

                cy.get(s.common.spinner, { timeout: testConstants.spinner.timeout })
                    .should('not.exist')

                cy.get(s.trainDialog.actionScorerSetEntityActions)
                    .should('have.length', testData.enumValueCount)
            })

            // dependent on above
            it('when clicking the placeholder action it should create a default set entity action then take it', () => {
                const setEntityPlaceholderText = `${testData.action.entityName}: ${testData.action.nonExistingEnumValue}`

                // Select set entity action
                selectAction(s.trainDialog.actionScorerSetEntityActions, setEntityPlaceholderText)

                cy.get(s.common.spinner, { timeout: testConstants.spinner.timeout })
                    .should('not.exist')

                // Select other wait action
                selectAction(s.trainDialog.actionScorerTextActions, testData.action.text)

                cy.get(s.common.spinner, { timeout: testConstants.spinner.timeout })
                    .should('not.exist')

                cy.get(s.trainDialog.buttonSave)
                    .click()

                cy.get(s.common.spinner, { timeout: testConstants.spinner.timeout })
                    .should('not.exist')

                // TODO: Why is closing modal delayed
                cy.get('.cl-modal--teach')
                    .should('not.exist')

                cy.get(s.model.navActions)
                    .click()

                cy.get(s.actions.setEntityResponseText)
                    .contains(setEntityPlaceholderText)
            })
        })


        // TODO: What to test? Deletion currently works the same
        xdescribe('action deletion', () => {
            before(() => {
                cy.reload()
                cy.get(s.model.navActions)
                    .click()

                cy.get(s.common.spinner, { timeout: testConstants.spinner.timeout })
                    .should('not.exist')
            })
        })
    })

    describe('scenario using set entity actions', () => {
        before(() => {
            cy.visit('http://localhost:3000')

            cy.get(s.common.spinner, { timeout: testConstants.spinner.timeout })
                .should('not.exist')

            cy.get(s.models.buttonImport)
                .click()

            cy.get(s.models.name)
                .type(`z-${testData.modelName}-${Cypress.moment().format('MM-D-mm-ss')}`)

            cy.get(s.models.buttonLocalFile)
                .click()

            cy.UploadFile(testData.modelFile, s.models.inputFile)

            cy.get(s.models.submit)
                .click()

            cy.get(s.common.spinner, { timeout: testConstants.spinner.timeout })
                .should('not.exist')
        })

        it('should successful place fast food order using context for instead of labels', () => {
            cy.get(s.model.navTrainDialogs)
                .click()

            cy.get(s.trainDialogs.buttonNew)
                .click()

            inputText(`Hi, I'd like a large coke and fries.`)
            clickScoreActionButton()
            selectAction(s.trainDialog.actionScorerSetEntityActions, 'drinkSize: LARGE')
            selectAction(s.trainDialog.actionScorerTextActions, 'What size fries would you like?')

            inputText(`Um, make that a medium.`)
            clickScoreActionButton()
            selectAction(s.trainDialog.actionScorerSetEntityActions, 'friesSize: MEDIUM')
            selectAction(s.trainDialog.actionScorerTextActions, 'Ok, I have an order for a LARGE drink and MEDIUM fries. Is that correct?')

            inputText(`Actually, make the fries a small`)
            clickScoreActionButton()
            selectAction(s.trainDialog.actionScorerSetEntityActions, 'orderConfirmation: NO')
            selectAction(s.trainDialog.actionScorerSetEntityActions, 'friesSize: SMALL')
            selectAction(s.trainDialog.actionScorerTextActions, 'Ok, I have an order for a LARGE drink and SMALL fries. Is that correct?')

            inputText(`Yep, that's correct.`)
            clickScoreActionButton()
            selectAction(s.trainDialog.actionScorerSetEntityActions, 'orderConfirmation: YES')
            selectAction(s.trainDialog.actionScorerTextActions, `Ok, your order number is 58. Please wait over there.`)

            cy.get(s.trainDialog.buttonSave)
                .click()

            cy.get(s.common.spinner, { timeout: testConstants.spinner.timeout })
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
            cy.get(s.action.dropDownOptions)
                .contains(optionName)
                .click()
        })
}

function selectAction(actionScorerSelector: string, actionResponseText: string) {
    cy.get(actionScorerSelector)
        .contains(actionResponseText)
        .parents(s.trainDialog.actionScorer.rowField)
        .find(s.trainDialog.buttonSelectAction)
        .click()

    cy.get(s.common.spinner, { timeout: testConstants.spinner.timeout })
        .should('not.exist')
}

function inputText(text: string) {
    cy.get(s.trainDialog.inputWebChat)
        .type(`${text}{enter}`)

    cy.get(s.common.spinner, { timeout: testConstants.spinner.timeout })
        .should('not.exist')
}

function clickScoreActionButton() {
    cy.get(s.trainDialog.buttonScoreActions)
        .click();
    cy.get(s.common.spinner, { timeout: testConstants.spinner.timeout })
        .should('not.exist');
}
