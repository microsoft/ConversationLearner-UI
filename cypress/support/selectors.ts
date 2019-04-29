const selectors = {
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
        logDialogsLink: '[data-testid="app-index-nav-link-log-dialogs"]',
    },
    entities: {
        name: '[data-testid="entities-name"]',
    },
    entity: {
        name: '[data-testid="entity-creator-entity-name-text"]',
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
        descriptions: '[data-testid="train-dialogs-description"]',
        tags: '[data-testid="train-dialogs-tags"] .cl-tags-readonly__tag',
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
        },
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
        entityConflictModal: {
            modal: '[data-testid="extract-conflict-modal-conflicting-labels"]',
            acceptButton: '[data-testid="entity-conflict-accept"]',
            cancelButton: '[data-testid="entity-conflict-cancel"]',
        },
        saveAsTrainDialogButton: '[data-testid="footer-button-done"]',
    },
    logDialogs: {
        createButton: '[data-testid="log-dialogs-new-button"]',
        firstInput: '[data-testid="log-dialogs-first-input"]',
    },
    logConversionConflictsModal: {
        modal: '[data-testid="log-conversion-conflicts-modal"]',
        conflictButtons: '[data-testid^="log-conversion-conflicts-conflict"]',
        nextButton: '[data-testid="log-conversion-conflicts-modal-next"]',
        previousButton: '[data-testid="log-conversion-conflicts-modal-previous"]',
        abortButton: '[data-testid="log-conversion-conflicts-modal-cancel"]',
        acceptButton: '[data-testid="log-conversion-conflicts-modal-accept"]',
    },
    chatModal: {
        container: '.cl-sessionmodal',
        doneButton: '[data-testid="chat-session-modal-done-testing-button"]',
    },
    extractionEditor: {
        overlay: '.entity-labeler-overlay',
        customNode: '.cl-entity-node--custom',
        nodeIndicator: '.cl-entity-node-indicator',
        buttonRemoveLabel: '[data-testid="entity-extractor-button-remove-label"]',
    },
    entityPicker: {
        inputSearch: '[data-testid="entity-picker-entity-search"]',
        buttonNew: '[data-testid="entity-picker-button-new"]',
        options: '.custom-toolbar .custom-toolbar__results .custom-toolbar__result',
    }
}

export default selectors