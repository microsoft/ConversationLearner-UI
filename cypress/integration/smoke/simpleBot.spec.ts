import * as util from '../../support/utilities'
import constants from '../../support/constants'
import s from '../../support/selectors'

describe('Scenario 01 - API Coverage - Exercise all major use cases', () => {
    const testData = {
        modelName: util.generateUniqueModelName('simpleBot'),
        entityName01: 'entity01',
        entityName02: 'entity02',
        entityName03: 'entity03',
        enumValueA: 'yes',
        enumValueB: 'no',
        actionResponse01: 'actionResponse01',
        actionResponse02: 'actionResponse02',
        actionResponse03: 'actionResponse03',
        dialog: {
            userInput: 'Some User Input',
            description: 'SmokeTest Dialog',
            word01: 'one',
            input01: 'prefix one',
            word02: 'two',
            input02: 'word two',
            input03: 'some yes or no question?',
        },
        versionName: 'TestVersion01',
    }

    it('should create a model', () => {
        cy.visit(`/`)

        cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
            .should('not.exist')

        cy.get(s.models.buttonCreate)
            .click()

        cy.get(s.models.name)
            .type(testData.modelName)

        cy.get(s.models.submit)
            .click()

        cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
            .should('not.exist')
    })

    it('should create an entity using entities page', () => {
        cy.get(s.model.buttonNavEntities)
            .click()

        cy.get(s.entities.buttonCreate)
            .click()

        cy.get(s.entity.name)
            .type(testData.entityName01)

        cy.get(s.entity.buttonSave)
            .click()

        cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
            .should('not.exist')
    })

    it('should create an action using actions page', () => {
        cy.get(s.model.buttonNavActions)
            .click()

        cy.get(s.actions.buttonNewAction)
            .click()

        cy.get(s.action.inputResponse)
            .type(testData.actionResponse01)

        cy.get(s.action.buttonCreate)
            .click()

        cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
            .should('not.exist')
    })

    describe('create a dialog', () => {
        before(() => {
            cy.get(s.model.buttonNavTrainDialogs)
                .click()

            cy.get(s.trainDialogs.buttonNew)
                .click()
        })

        it('should set tags and description', () => {
            cy.get(s.dialogModal.inputDescription)
                .type(testData.dialog.description)
        })

        it('round 1 - should use existing data, label text, and add alternate input', () => {
            util.inputText(testData.dialog.input01)

            cy.get('body')
                .trigger(constants.events.selectWord, { detail: testData.dialog.word01 })

            cy.get(s.entityPicker.inputSearch)
                // TODO: Why?  Sometimes there is a glitch in what it types.
                // Input is `tity01en` instead of `entity01` as if cursor resets to start mid-type.
                .wait(100)
                .type(`${testData.entityName01}{enter}`)

            cy.get(s.extractionEditor.customButton)
                .contains(testData.entityName01)

            util.clickScoreActionButton()
            util.selectAction(s.trainDialog.actionScorerTextActions, testData.actionResponse01)

            cy.get(s.webChat.messageFromBot, { timeout: constants.prediction.timeout })
                .contains(testData.actionResponse01)
        })

        it('round 2 - should create new objects inline, demonstrate api and cards', () => {
            util.inputText(testData.dialog.input02)

            cy.get('body')
                .trigger(constants.events.selectWord, { detail: testData.dialog.word02 })

            cy.get(s.entityPicker.buttonNew)
                .click()

            cy.get(s.entity.name)
                .wait(200)
                .type(testData.entityName02)

            cy.get(s.entity.buttonSave)
                .click()

            cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
                .should('not.exist')

            cy.get(s.extractionEditor.customButton)
                .contains(testData.entityName02)

            util.clickScoreActionButton()

            cy.get(s.trainDialog.actionScorer.buttonCreate)
                .click()

            util.selectDropDownOption(s.action.dropDownType, 'API')
            util.selectDropDownOption(s.action.dropDownApiCallback, 'Add')

            cy.get(s.action.logicArg('arg1'))
                .type('1')

            cy.get(s.action.logicArg('arg2'))
                .type('2')

            cy.get(s.action.checkBoxWaitForResponse)
                .click()

            cy.get(s.action.buttonCreate)
                .click()

            cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
                .should('not.exist')

            cy.get(s.trainDialog.actionScorer.buttonCreate)
                .click()

            util.selectDropDownOption(s.action.dropDownType, 'CARD')
            util.selectDropDownOption(s.action.dropDownCardTemplate, 'prompt')

            cy.get(s.action.cardArg('speak'))
                .type('speak')
            cy.get(s.action.cardArg('question'))
                .type('question')
            cy.get(s.action.cardArg('button1'))
                .type('button1')
            cy.get(s.action.cardArg('button2'))
                .type('button2')

            cy.get(s.action.buttonCreate)
                .click()

            cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
                .should('not.exist')
        })

        it('round 3 create enum entity and use placeholder action', () => {
            util.inputText(testData.dialog.input03)

            cy.get(s.extractionEditor.buttonCreate)
                .click()

            util.selectDropDownOption(s.entity.dropDownType, 'Enum')

            cy.get(s.entity.name)
                .type(testData.entityName03)

            cy.get(s.entity.enumValueName)
                .first()
                .type(testData.enumValueA)

            cy.get(s.entity.enumValueName)
                .first()
                .type(testData.enumValueB)

            cy.get(s.entity.buttonSave)
                .click()

            cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
                .should('not.exist')

            util.clickScoreActionButton()

            const setEntityPlaceholderText = `${testData.entityName03}: ${testData.enumValueA.toUpperCase()}`
            util.selectAction(s.trainDialog.actionScorerSetEntityActions, setEntityPlaceholderText)

            util.selectAction(s.trainDialog.actionScorerTextActions, testData.actionResponse01)
        })

        after(() => {
            cy.get(s.trainDialog.buttonSave)
                .click()

            cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
                .should('not.exist')
        })
    })

    describe('edit the dialog', () => {
        before(() => {
            cy.wait(2000)
            cy.get(s.trainDialogs.descriptions)
                .contains(testData.dialog.description)
                .click()
        })

        it('should insert input', () => {
            cy.get(s.dialogModal.container)
            cy.get(s.webChat.messageFromMe)
                .contains(testData.dialog.input01)
                .click()

            cy.get(s.webChat.buttonAddAction)
                .click()

            cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
                .should('not.exist')
        })

        it('should insert response', () => {
            cy.get(s.webChat.buttonAddInput)
                .click()

            cy.get(s.dialogModal.branchInput)
                .type(testData.dialog.userInput)

            cy.get(s.dialogModal.branchSubmit)
                .click()

            cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
                .should('not.exist')
        })

        it('should continue the dialog', () => {
            util.inputText(`${testData.dialog.input03}{enter}`)
            util.clickScoreActionButton()
        })

        after(() => {
            cy.get(s.trainDialog.buttonSave)
                .click()

            cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
                .should('not.exist')

        })
    })

    describe('create log dialog', () => {
        before(() => {
            // wait for training to complete for proper prediction of action
            cy.wait(5000)
            cy.get(s.trainingStatus.completed, { timeout: constants.prediction.timeout })
            cy.get(s.model.buttonNavLogDialogs)
                .click()

            cy.get(s.logDialogs.buttonCreate)
                .click()
        })

        it('should create a log dialog', () => {
            cy.get(s.logDialog.inputMessage)
                .type(`${testData.dialog.input01}{enter}`)

            // Wait for prediction and ensure it isn't an error
            cy.get(s.webChat.messageFromBot, { timeout: constants.prediction.timeout })
                .should('exist')
                .should('not.have.class', s.webChat.messageColorException)

            cy.get(s.logDialog.inputMessage)
                .type(`${testData.dialog.input02}{enter}`)

            // Wait for prediction and ensure it isn't an error
            cy.get(s.webChat.messageFromBot, { timeout: constants.prediction.timeout })
                .should('exist')
                // Need to assert count so we don't get false positive included the previous messages / predictions.
                .should('have.length.greaterThan', 2)
                .should('not.have.class', s.webChat.messageColorException)
        })

        after(() => {
            cy.server()
            cy.route('/sdk/app/*/logdialogs*').as('getLogDialogs')

            cy.get(s.logDialog.buttonDone)
                .click()

            cy.wait(['@getLogDialogs'])
        })
    })

    describe('edit train dialog to create log conflict', () => {
        before(() => {
            cy.wait(1000)
            cy.get(s.model.buttonNavTrainDialogs)
                .click()

            cy.get(s.trainDialogs.descriptions)
                .contains(testData.dialog.description)
                .click()
        })

        it('should edit the entity labels and save the dialog', () => {
            cy.get(s.dialogModal.container)
            cy.get(s.webChat.messageFromMe)
                .contains(testData.dialog.input01)
                .click()

            util.removeLabel(testData.dialog.word01)

            // This assumes the extraction from last edit was trained and 'one' will be labeled
            cy.get('body')
                .trigger(constants.events.selectWord, { detail: 'prefix' })

            cy.get(s.entityPicker.inputSearch)
                .wait(100)
                .type(`${testData.entityName01}{enter}`)

            cy.get(s.extractionEditor.buttonSubmitChanges)
                .click()

            cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
                .should('not.exist')

            cy.get(s.dialogModal.buttonCloseSave)
                .click()
        })
    })

    describe('create new dialog', () => {
        before(() => {
            // Need to wait for training, realize extraction on first input
            cy.wait(5000)
            cy.get(s.trainingStatus.completed, { timeout: constants.prediction.timeout })
            cy.get(s.trainDialogs.buttonNew)
                .click()
        })

        it('should show conflict modal', () => {
            util.inputText(testData.dialog.input01)

            // remove any / first label
            cy.get(s.extractionEditor.slateEditor)
                .get('.cl-entity-node--custom')
                .click()
                .find(s.extractionEditor.buttonRemoveLabel)
                .click()

            util.clickScoreActionButton()

            cy.get(s.dialogModal.entityConflictModal.modal)
            cy.get(s.dialogModal.entityConflictModal.buttonAccept)
                .click()
        })

        it('should show merge modal', () => {
            // TODO: What causes the need for this? Waiting should not have any effect?
            cy.wait(1000)

            util.selectAction(s.trainDialog.actionScorerTextActions, testData.actionResponse01)

            cy.get(s.webChat.messageFromBot, { timeout: constants.prediction.timeout })
                .contains(testData.actionResponse01)

            cy.get(s.dialogModal.buttonCloseSave)
                .click()

            cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
                .should('not.exist')

            cy.get(s.mergeModal.title)
            cy.get(s.mergeModal.buttonMerge)
                .click()

            cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
                .should('not.exist')
        })
    })

    describe('convert log to train dialog', () => {
        before(() => {
            cy.get(s.model.buttonNavLogDialogs)
                .click()
        })

        it('should show log conversion modal', () => {
            cy.get(s.logDialogs.description)
                .contains(testData.dialog.input01)
                .click()

            cy.get(s.dialogModal.buttonSaveAsTrainDialog)
                .click()

            cy.get(s.logConversionConflictsModal.modal)
            cy.get(s.logConversionConflictsModal.buttonAccept)
                .click()

            cy.get(s.common.spinner, { timeout: constants.spinner.timeout })
                .should('not.exist')
        })
    })

    describe('settings', () => {
        before(() => {
            cy.get(s.model.buttonNavSettings)
                .click()
        })

        it('should create a new version', () => {
            cy.get(s.settings.buttonNewVersion)
                .click()

            cy.get(s.packageCreatorModal.inputVersionName)
                .type(testData.versionName)

            // Getting "Too many request error" ?
            cy.wait(1000)

            cy.get(s.packageCreatorModal.buttonCreate)
                .click()
        })

        it('should rename model and save', () => {
            const newName = util.generateUniqueModelName(testData.modelName)
            cy.get(s.settings.inputModelName)
                .type(`{selectall}{backspace}${newName}`)

            cy.get(s.settings.buttonSave)
                .click()

            cy.get(s.model.name)
                .should('have.text', newName)

        })
    })
})