const selectors = {
    common: {
        spinner: '.cl-spinner',
        dropDownOptions: 'button.ms-Dropdown-item',
    },
    models: {
        buttonCreate: '[data-testid=model-list-create-new-button]',
        buttonImport: '[data-testid=model-list-import-model-button]',
        buttonLocalFile: '[data-testid="model-creator-locate-file-button"]',
        name: '[data-testid=model-creator-input-name]',
        submit: '[data-testid=model-creator-submit-button]',
        inputFile: '[data-testid="model-creator-import-file-picker"] > div > input[type="file"]',
    },
    model: {
        buttonNavActions: '[data-testid="app-index-nav-link-actions"]',
        buttonNavEntities: '[data-testid="app-index-nav-link-entities"]',
        buttonNavTrainDialogs: '[data-testid=app-index-nav-link-train-dialogs]',
        buttonNavLogDialogs: '[data-testid="app-index-nav-link-log-dialogs"]',
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
        buttonNewAction: '[data-testid="actions-button-create"]',
        setEntityResponseText: '[data-testid="actions-list-set-entity"]',
    },
    action: {
        dropDownType: '[data-testid="dropdown-action-type"]',
        dropDownEntity: '[data-testid="action-set-entity"]',
        dropDownEnum: '[data-testid="action-set-enum"]',
        checkBoxWaitForResponse: '[data-testid="action-creator-wait-checkbox"]',
        buttonCreate: '[data-testid="action-creator-create-button"]',
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
        buttonCloseSave: '[data-testid="edit-teach-dialog-close-save-button"]',
        buttonScoreActionsButton: '[data-testid="score-actions-button"]',
        buttonSaveAsTrainDialog: '[data-testid="footer-button-done"]',
        buttonAddTag: '[data-testid="train-dialog-tags"] .cl-tags__button-add',
        inputDescription: '[data-testid="train-dialog-description"]',
        inputTag: '[data-testid="train-dialog-tags"] .cl-tags__form input',
        tags: '[data-testid="train-dialog-tags"] .cl-tags__tag span',
        tagsControl: '[data-testid="train-dialog-tags"]',
        webChatUtterances: 'div[data-testid="web-chat-utterances"] > div.wc-message-content > div > div.format-markdown > p',
        entityConflictModal: {
            modal: '[data-testid="extract-conflict-modal-conflicting-labels"]',
            buttonAccept: '[data-testid="entity-conflict-accept"]',
            buttonCancel: '[data-testid="entity-conflict-cancel"]',
        },
    },
    logDialogs: {
        buttonCreate: '[data-testid="log-dialogs-new-button"]',
        firstInput: '[data-testid="log-dialogs-first-input"]',
    },
    logConversionConflictsModal: {
        modal: '[data-testid="log-conversion-conflicts-modal"]',
        conflictButtons: '[data-testid^="log-conversion-conflicts-conflict"]',
        conflict1: '[data-testid="log-conversion-conflicts-conflict-1"]',
        conflict2: '[data-testid="log-conversion-conflicts-conflict-2"]',
        buttonNext: '[data-testid="log-conversion-conflicts-modal-next"]',
        buttonPrevious: '[data-testid="log-conversion-conflicts-modal-previous"]',
        buttonAbort: '[data-testid="log-conversion-conflicts-modal-cancel"]',
        buttonAccept: '[data-testid="log-conversion-conflicts-modal-accept"]',
    },
    chatModal: {
        container: '.cl-sessionmodal',
        buttonDone: '[data-testid="chat-session-modal-done-testing-button"]',
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
    },
    webChat: {
        messageFromBot: '.wc-message-from-bot',
        messageFromMe: 'wc-message-from-me',
        messageColorException: 'wc-message-color-exception',
    }
}

export default selectors