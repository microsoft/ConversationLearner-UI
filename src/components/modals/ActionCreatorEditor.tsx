import * as React from 'react'
import { EditorState, ContentState, Modifier } from 'draft-js'
import { returntypeof } from 'react-redux-typescript'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { fetchBotInfoAsync } from '../../actions/fetchActions'
import { Modal } from 'office-ui-fabric-react/lib/Modal'
import { ActionBase, ActionTypes, ActionMetaData, ActionPayload, 
    ActionArgument, BlisAppBase, EntityBase } from 'blis-models'
import ConfirmDeleteModal from './ConfirmDeleteModal'
import EntityCreatorEditor from './EntityCreatorEditor'
import AdaptiveCardViewer from './AdaptiveCardViewer'
import ActionPayloadEditor, { utilities as EditorUtilities, IMention } from './ActionPayloadEditor'
import { State } from '../../types'
import * as ToolTip from '../ToolTips'
import * as TC from '../tipComponents/Components'
import * as OF from 'office-ui-fabric-react';
import { BlisTagItem, IBlisPickerItemProps } from './BlisTagItem'
import BlisTagPicker from '../BlisTagPicker'
import './ActionCreatorEditor.css'

const convertEntityToMention = (entity: EntityBase): IMention =>
    ({
        id: entity.entityId,
        name: entity.entityName,
        displayName: entity.entityName,
    })

const convertEntityToTag = (entity: EntityBase): OF.ITag =>
    ({
        key: entity.entityId,
        name: entity.entityName
    })

const convertContentEntityToTag = (contentEntity: EditorUtilities.IContentEntity): OF.ITag =>
    ({
        key: contentEntity.entity.data.mention.id,
        name: contentEntity.entity.data.mention.displayName
    })

const convertEntityIdsToTags = (ids: string[], entities: EntityBase[]): OF.ITag[] => {
    return ids
        .map<EntityBase>(entityId => entities.find(e => e.entityId === entityId))
        .map<OF.ITag>(convertEntityToTag)
}

const getSuggestedTags = (filterText: string, allTags: OF.ITag[], tagsToExclude: OF.ITag[]): OF.ITag[] => {
    filterText = (filterText.startsWith(EditorUtilities.mentionTrigger) ? filterText.substring(1) : filterText).trim()

    const availableTags = allTags
        .filter(tag => !tagsToExclude.some(t => t.key === tag.key))

    if (filterText.length === 0) {
        return availableTags
    }

    return availableTags
        .filter(tag => tag.name.toLowerCase().startsWith(filterText.toLowerCase()))
}

const availableActionTypes = [
    ActionTypes.TEXT,
    ActionTypes.API_LOCAL,
    ActionTypes.API_AZURE,
]

const actionTypeOptions = Object.values(ActionTypes)
    .map<OF.IDropdownOption>(actionTypeString => {
        const disabled = !availableActionTypes.includes(actionTypeString)
        return {
            key: actionTypeString,
            text: `${actionTypeString} ${disabled ? ' [not implemented]' : ''}`,
            // TODO: Why does disabled flag not work?
            disabled,
            isDisabled: disabled
        }
    })

interface ComponentState {
    apiOptions: OF.IDropdownOption[]
    cardOptions: OF.IDropdownOption[]
    selectedApiOptionKey: string | number | null
    selectedCardOptionKey: string | number  | null
    isEditing: boolean
    isEntityEditorModalOpen: boolean
    isCardViewerModalOpen: boolean
    isConfirmDeleteModalOpen: boolean
    isPayloadFocused: boolean
    isPayloadValid: boolean
    selectedActionTypeOptionKey: string | number
    entityTags: OF.ITag[]
    expectedEntityTags: OF.ITag[]
    requiredEntityTagsFromPayload: OF.ITag[]
    requiredEntityTags: OF.ITag[]
    negativeEntityTags: OF.ITag[]
    mentionEditorState: EditorState
    argumentEditorStates: {[slot: string]: EditorState }
    editorKey: number
    isTerminal: boolean
}

const initialState: ComponentState = {
    apiOptions: [],
    cardOptions: [],
    selectedApiOptionKey: null,
    selectedCardOptionKey: null,
    isEditing: false,
    isEntityEditorModalOpen: false,
    isCardViewerModalOpen: false,
    isConfirmDeleteModalOpen: false,
    isPayloadFocused: false,
    isPayloadValid: false,
    selectedActionTypeOptionKey: actionTypeOptions[0].key,
    entityTags: [],
    expectedEntityTags: [],
    requiredEntityTagsFromPayload: [],
    requiredEntityTags: [],
    negativeEntityTags: [],
    mentionEditorState: EditorState.createEmpty(),
    argumentEditorStates: {},
    editorKey: 0,
    isTerminal: true
}

class ActionCreatorEditor extends React.Component<Props, ComponentState> {
    private openState: ComponentState = initialState;
    state = initialState;

    componentWillMount() {
        const { entities, botInfo } = this.props
        let entityTags = entities.map<OF.ITag>(e =>
            ({
                key: e.entityId,
                name: e.entityName
            }))

        const callbacks = (botInfo && botInfo.callbacks || [])
        const apiOptions = callbacks.map<OF.IDropdownOption>(v =>
            ({
                key: v,
                text: v
            }))

        const templates = (botInfo && botInfo.templates || [])
        const cardOptions = templates.map<OF.IDropdownOption>(v =>
            ({
                key: v.name,
                text: v.name
            }))

        this.openState = {
            ...initialState,
            apiOptions,
            cardOptions,
            entityTags,
            isEditing: !!this.props.action
        }

        this.setState(this.openState)
    }

    componentWillReceiveProps(nextProps: Props) {
        let nextState: Partial<ComponentState> = {}

        // Update local copy of entity tags if they have changed
        if (nextProps.entities !== this.props.entities) {
            const entityTags = nextProps.entities.map<OF.ITag>(e =>
                ({
                    key: e.entityId,
                    name: e.entityName
                }))

            nextState = {
                ...nextState,
                entityTags
            }
        }

        if (nextProps.open === true) {
            // Reset state every time dialog was closed and is opened
            if (this.props.open === false) {
                nextState = {
                    ...this.openState,
                    editorKey: this.state.editorKey + 1,
                }
            }

            // If we are given an action, set edit mode and apply properties
            if (nextProps.action) {
                const action = nextProps.action

                const negativeEntityTags = convertEntityIdsToTags(action.negativeEntities.filter(entityId => entityId !== action.suggestedEntity), nextProps.entities)
                const expectedEntityTags = convertEntityIdsToTags((action.suggestedEntity ? [action.suggestedEntity] : []), nextProps.entities)
                /**
                 * Special processing for local API responses:
                 * TODO: Remove this after schema redesign
                 * Current this is depending on knowledge that the name of function is the first part of the payload separated by a space
                 * It should be explicit field of the payload object instead of substring.
                 */
                const actionType = action.metadata.actionType
                let payload = action.payload
                let selectedApiOptionKey: string | null = null;
                let selectedCardOptionKey: string | null = null;

                if (actionType === ActionTypes.API_LOCAL) {
                    const splitPayload = action.payload.split(' ')
                    selectedApiOptionKey = splitPayload[0]
                    payload = splitPayload.slice(1).join(' ')
                }

                let argumentEditorStates: {[slot: string]: EditorState } = {};
                if (actionType === ActionTypes.CARD) {
                    let actionPayload = JSON.parse(action.payload) as ActionPayload;
                    selectedCardOptionKey = actionPayload.payload;
                    for (let actionArgument of actionPayload.arguments) {
                        let value = ContentState.createFromText(actionArgument.value);
                        let argEditorState = EditorState.createWithContent(value);
                        argumentEditorStates[actionArgument.parameter] = argEditorState;
                    }
                }

                // LARSTODO - include arguements here
                // TODO: If we allow to store raw state of editor then restoring it is very easy
                // Currently there is issue where we don't know how to recreate the entities from the plain text
                // const contentState = convertFromRaw(JSON.parse(action.payload))
                const existingEntityMatches = (payload.match(/(\$[\w]+)/g) || [])
                    .map(match => {
                        // Get entity name by removing first character '$name' -> 'name'
                        const entityName = match.substring(1)
                        const startIndex = payload.indexOf(match)
                        const endIndex = startIndex + match.length
                        const entity = nextProps.entities.find(e => e.entityName === entityName)

                        return {
                            startIndex,
                            endIndex,
                            entity
                        }
                    })

                // Get editor state
                const contentState = ContentState.createFromText(payload)
                let editorState = EditorState.createWithContent(contentState)

                /**
                 * Note: Remove this when we change the action.payload to save entity position directly
                 * This is kind of a hack to force the entities into the content state without having the actual map
                 * This relies on there being single block created by the above `createFromText` so that the anchorKey
                 * and focusKeys from the default selection state are valid
                 */
                const contentStateWithMentions = existingEntityMatches
                    .reduce((newContentState, entityMatch) => {
                        const fakeMapMention = convertEntityToMention(entityMatch.entity);
                        (fakeMapMention as any).toJS = () => fakeMapMention

                        const contentStateWithEntity = newContentState.createEntity(
                            EditorUtilities.entityType,
                            'IMMUTABLE',
                            {
                                mention: fakeMapMention
                            }
                        )

                        const entityKey = contentStateWithEntity.getLastCreatedEntityKey()
                        const selectionState = editorState.getSelection()
                        const updatedSelectionState: any = selectionState.merge({
                            anchorOffset: entityMatch.startIndex,
                            focusOffset: entityMatch.endIndex
                        });

                        return Modifier.applyEntity(
                            contentStateWithEntity,
                            updatedSelectionState,
                            entityKey
                        )
                    }, contentState)

                // Overwrite editor state with content state which has the entities
                editorState = EditorState.createWithContent(contentStateWithMentions)

                // Set cursor to end
                editorState = EditorState.moveSelectionToEnd(editorState)
                editorState = EditorState.moveFocusToEnd(editorState)

                const requiredEntityTagsFromPayload = EditorUtilities.getEntities(editorState).map(convertContentEntityToTag)
                const requiredEntityTags = convertEntityIdsToTags(action.requiredEntities, nextProps.entities)
                    .filter(t => !requiredEntityTagsFromPayload.some(tag => tag.key === t.key))

                nextState = {
                    ...nextState,
                    isPayloadValid: actionType === ActionTypes.API_LOCAL || action.payload.length !== 0,
                    selectedActionTypeOptionKey: action.metadata.actionType,
                    selectedApiOptionKey,
                    selectedCardOptionKey,
                    mentionEditorState: editorState,
                    argumentEditorStates: argumentEditorStates,
                    editorKey: this.state.editorKey + 1,
                    expectedEntityTags,
                    negativeEntityTags,
                    requiredEntityTagsFromPayload,
                    requiredEntityTags,
                    isEditing: true
                }
            }
        }

        this.setState(prevState => nextState)
    }

    onChangeWaitCheckbox = () => {
        this.setState(prevState => ({
            isTerminal: !prevState.isTerminal
        }))
    }

    onChangedApiOption = (apiOption: OF.IDropdownOption) => {
        this.setState({
            selectedApiOptionKey: apiOption.key
        })
    }

    onChangedCardOption = (cardOption: OF.IDropdownOption) => {
        this.setState({
            selectedCardOptionKey: cardOption.key
        })
    }

    onClickSyncBotInfo() {
        this.props.fetchBotInfoAsync();
    }

    onClickViewCard() {
        this.setState({
            isCardViewerModalOpen: true
        })
    }

    onCloseCardViewer = () => {
        this.setState({
            isCardViewerModalOpen: false
        })
    }

    getActionArguments(): ActionArgument[] {

        let actionArguments: ActionArgument[] = [];
        for (let parameter of Object.keys(this.state.argumentEditorStates)) {
            let argPayload = this.state.argumentEditorStates[parameter].getCurrentContent().getPlainText();
            if (argPayload.length > 0) {
                actionArguments.push(new ActionArgument({parameter: parameter, value: argPayload}))
            }
        }
        return actionArguments;
    }

    onClickSubmit = () => {
        const contentState = this.state.mentionEditorState.getCurrentContent()
        // LARSTODO - process argumentEditorState
        // const rawContent = convertToRaw(contentState)
        let payload = contentState.getPlainText()

        if (this.state.selectedActionTypeOptionKey === ActionTypes.API_LOCAL) {
            payload = `${this.state.selectedApiOptionKey} ${payload}`
        }

        if (this.state.selectedActionTypeOptionKey === ActionTypes.CARD) {
            let actionArguments: ActionArgument[] = [];
            for (let parameter of Object.keys(this.state.argumentEditorStates)) {
                let argPayload = this.state.argumentEditorStates[parameter].getCurrentContent().getPlainText();
                actionArguments.push(new ActionArgument({parameter: parameter, value: argPayload}))
            }
            let actionPayload = new ActionPayload(
                {
                    payload: this.state.selectedCardOptionKey.toString(),
                    arguments: this.getActionArguments()
                }
            )
            payload = JSON.stringify(actionPayload);
        }

        const newOrEditedAction = new ActionBase({
            actionId: null,
            /**
             * Future Idea:
             * Store compound object with both formats to get best of both
             * {
             *   "plainText": rawText,
             *   "rawContent": rawContent
             * }
             * 
             * This would allow backwards compatible parsing from downstream systems by updating them to look at the plainText field
             * but this component would load from the rawContent which preserves entity relationships in native format for the editor.
             * 
             * Then whenever this component is used to modify content, it would update the plainText before saving to keep them in sync.
             */
            payload,
            isTerminal: this.state.isTerminal,
            requiredEntities: [...this.state.requiredEntityTagsFromPayload, ...this.state.requiredEntityTags].map<string>(tag => tag.key),
            negativeEntities: [...this.state.expectedEntityTags, ...this.state.negativeEntityTags].map<string>(tag => tag.key),
            suggestedEntity: (this.state.expectedEntityTags.length > 0) ? this.state.expectedEntityTags.map<string>(tag => tag.key)[0] : null,
            version: null,
            packageCreationId: null,
            packageDeletionId: null,
            metadata: new ActionMetaData({
                actionType: this.state.selectedActionTypeOptionKey as string
            })
        })

        if (this.state.isEditing) {
            newOrEditedAction.actionId = this.props.action.actionId
        }

        this.props.onClickSubmit(newOrEditedAction)
    }

    onClickCancel = () => {
        this.props.onClickCancel()
    }

    onClickDelete = () => {
        this.setState({
            isConfirmDeleteModalOpen: true
        })
    }

    onCancelDelete = () => {
        this.setState({
            isConfirmDeleteModalOpen: false
        })
    }

    onConfirmDelete = () => {
        this.setState(
            { isConfirmDeleteModalOpen: false },
            () => {
                this.props.onClickDelete(this.props.action)
            })
    }

    onClickCreateEntity = () => {
        this.setState({
            isEntityEditorModalOpen: true
        })
    }

    onCloseEntityEditor = () => {
        this.setState({
            isEntityEditorModalOpen: false,
            selectedApiOptionKey: null,
            selectedCardOptionKey: null
        })
    }

    onDismissModal = () => {
        this.props.onClickCancel()
    }

    onChangedActionType = (actionTypeOption: OF.IDropdownOption) => {
        const isPayloadValid = actionTypeOption.key === ActionTypes.API_LOCAL
            ? true
            : this.state.mentionEditorState.getCurrentContent().hasText()
        // LARSTODO - payload validity
        this.setState({
            isPayloadValid,
            selectedActionTypeOptionKey: actionTypeOption.key
        })
    }

    onResolveExpectedEntityTags = (filterText: string, selectedTags: OF.ITag[]): OF.ITag[] => {
        // TODO: Look at using different control such as a dropdown which implies using single value.
        // It is not possible to have more than 1 suggested entity
        // If there is already an entity selected return empty list to prevent adding more
        if (selectedTags.length > 0) {
            return []
        }

        return getSuggestedTags(
            filterText,
            this.state.entityTags,
            [...selectedTags, ...this.state.requiredEntityTagsFromPayload, ...this.state.requiredEntityTags]
        )
    }

    onRenderExpectedTag = (props: IBlisPickerItemProps<OF.ITag>): JSX.Element => {
        const renderProps = { ...props }
        renderProps.highlight = true
        return <BlisTagItem key={props.index} {...renderProps}>{props.item.name}</BlisTagItem>
    }

    onChangeExpectedEntityTags = (tags: OF.ITag[]) => {
        this.setState(prevState => ({
            expectedEntityTags: tags,
            negativeEntityTags: prevState.negativeEntityTags.filter(t => !tags.some(tag => tag.key === t.key))
        }))
    }

    onResolveRequiredEntityTags = (filterText: string, selectedTags: OF.ITag[]): OF.ITag[] => {
        return getSuggestedTags(
            filterText,
            this.state.entityTags,
            [...selectedTags, ...this.state.requiredEntityTagsFromPayload, ...this.state.negativeEntityTags, ...this.state.expectedEntityTags]
        )
    }

    onChangeRequiredEntityTags = (tags: OF.ITag[]) => {
        this.setState({
            requiredEntityTags: tags
        })
    }

    onRenderRequiredEntityTag = (props: IBlisPickerItemProps<OF.ITag>): JSX.Element => {
        const renderProps = { ...props }
        const locked = this.state.requiredEntityTagsFromPayload.some(t => t.key === props.key)

        // Strickout and lock/highlight if also the suggested entity
        renderProps.strike = false
        renderProps.locked = locked
        renderProps.highlight = locked

        return <BlisTagItem key={props.index} {...renderProps}>{props.item.name}</BlisTagItem>
    }

    onResolveNegativeEntityTags(filterText: string, selectedTags: OF.ITag[]): OF.ITag[] {
        return getSuggestedTags(
            filterText,
            this.state.entityTags,
            [...selectedTags, ...this.state.expectedEntityTags, ...this.state.requiredEntityTagsFromPayload, ...this.state.requiredEntityTags]
        )
    }

    onChangeNegativeEntityTags(tags: OF.ITag[]) {
        this.setState({
            negativeEntityTags: tags
        })
    }

    onRenderNegativeEntityTag = (props: IBlisPickerItemProps<OF.ITag>): JSX.Element => {
        const renderProps = { ...props }
        const suggestedEntityKey = this.state.expectedEntityTags.length > 0 ? this.state.expectedEntityTags[0].key : null

        // Strickout and lock/highlight if also the suggested entity
        renderProps.strike = true
        renderProps.locked = suggestedEntityKey === props.key
        renderProps.highlight = suggestedEntityKey === props.key

        return <BlisTagItem key={props.index} {...renderProps}>{props.item.name}</BlisTagItem>
    }

    onChangeMentionEditor = (editorState: EditorState, slot: string = null) => {
        const requiredEntityTagsFromPayload = EditorUtilities.getEntities(editorState).map(convertContentEntityToTag)
        // If we added entity to the payload which was already in the list of required entities remove it to avoid duplicates.
        const requiredEntityTags = this.state.requiredEntityTags.filter(tag => !requiredEntityTagsFromPayload.some(t => t.key === tag.key))
        const isPayloadValid = this.state.selectedActionTypeOptionKey === ActionTypes.API_LOCAL || editorState.getCurrentContent().hasText()

        if (!slot) {
            this.setState({
                isPayloadValid,
                mentionEditorState: editorState,
                requiredEntityTagsFromPayload,
                requiredEntityTags
            })            
        } else {
            let newArguments = {...this.state.argumentEditorStates}
            newArguments[slot] = editorState;
            this.setState({
                isPayloadValid,
                argumentEditorStates: newArguments,
                requiredEntityTagsFromPayload,
                requiredEntityTags
            })
        }
    }

    render() {
        // Disable payload if we're editing existing action and no API or CARD data available
        const isPayloadDisabled = 
            (this.state.selectedActionTypeOptionKey === ActionTypes.API_LOCAL
                && (this.state.isEditing || this.state.apiOptions.length === 0))
            ||
            (this.state.selectedActionTypeOptionKey === ActionTypes.CARD
                && (this.state.isEditing || this.state.cardOptions.length === 0));

        // Available Mentions: All entities - expected entity - required entities from payload - blocking entities
        const unavailableTags = [...this.state.expectedEntityTags, ...this.state.requiredEntityTagsFromPayload, ...this.state.negativeEntityTags]
        const getMentionsAvailableForPayload = this.props.entities
            .filter(e => !unavailableTags.some(t => t.key === e.entityId))
            .map(convertEntityToMention)

        return (
            <Modal
                isOpen={this.props.open}
                onDismiss={() => this.onDismissModal()}
                isBlocking={false}
                containerClassName="blis-modal blis-modal--medium blis-modal--border"
            >
                <div className="blis-modal_header">
                    <span className="ms-font-xxl ms-fontWeight-semilight">{this.state.isEditing ? 'Edit Action' : 'Create an Action'}</span>
                </div>

                <div className="blis-modal_body">
                    <div>
                        <TC.Dropdown
                            label="Action Type"
                            options={actionTypeOptions}
                            onChanged={acionTypeOption => this.onChangedActionType(acionTypeOption)}
                            selectedKey={this.state.selectedActionTypeOptionKey}
                            disabled={this.state.isEditing}
                            tipType={ToolTip.TipType.ACTION_TYPE}
                        />
                        {this.state.selectedActionTypeOptionKey === ActionTypes.API_LOCAL
                            && (<div>
                                <TC.Dropdown
                                    label="API"
                                    className="blis-dropdownWithButton-dropdown"
                                    options={this.state.apiOptions}
                                    onChanged={this.onChangedApiOption}
                                    selectedKey={this.state.selectedApiOptionKey}
                                    disabled={this.state.apiOptions.length === 0 || this.state.isEditing}
                                    placeHolder={this.state.apiOptions.length === 0 ? 'NONE DEFINED' : 'API name...'}
                                    tipType={ToolTip.TipType.ACTION_API}
                                    hasButton={true}
                                />
                                <div className="blis-dropdownWithButton-buttoncontainer">
                                    <OF.PrimaryButton
                                        className="blis-dropdownWithButton-button"
                                        onClick={() => this.onClickSyncBotInfo()}
                                        ariaDescription="Refresh"
                                        text=""
                                        iconProps={{ iconName: 'Sync' }}
                                    />
                                </div>
                            </div>
                            )}

                            {this.state.selectedActionTypeOptionKey === ActionTypes.CARD
                            && (<div>
                                <TC.Dropdown
                                    label="Template"
                                    className="blis-dropdownWithButton-dropdown"
                                    options={this.state.cardOptions}
                                    onChanged={this.onChangedCardOption}
                                    selectedKey={this.state.selectedCardOptionKey}
                                    disabled={this.state.cardOptions.length === 0 || this.state.isEditing}
                                    placeHolder={this.state.cardOptions.length === 0 ? 'NONE DEFINED' : 'Template name...'}
                                    tipType={ToolTip.TipType.ACTION_CARD}
                                    hasButton={true}
                                />
                                <div className="blis-dropdownWithButton-buttoncontainer">
                                    <OF.PrimaryButton
                                        className="blis-dropdownWithButton-button"
                                        onClick={() => this.onClickSyncBotInfo()}
                                        ariaDescription="Refresh"
                                        text=""
                                        iconProps={{ iconName: 'Sync' }}
                                    />
                                </div>
                                <div className="blis-dropdownWithButton-buttoncontainer">
                                    <OF.PrimaryButton
                                        className="blis-dropdownWithButton-button"
                                        onClick={() => this.onClickViewCard()}
                                        ariaDescription="Refresh"
                                        text=""
                                        iconProps={{ iconName: 'RedEye' }}
                                    />
                                </div>
                            </div>
                            )}

                            {this.state.selectedActionTypeOptionKey === ActionTypes.CARD && this.state.selectedCardOptionKey
                            && (this.props.botInfo.templates.find(t => t.name === this.state.selectedCardOptionKey).variables.map(slot =>
                                {
                                    return (
                                        <ActionPayloadEditor
                                            label={slot.key}
                                            allSuggestions={getMentionsAvailableForPayload}
                                            editorState={this.state.argumentEditorStates[slot.key] || EditorState.createEmpty()}
                                            key={this.state.editorKey + slot.key}
                                            placeholder={''}
                                            onChange={eState => this.onChangeMentionEditor(eState, slot.key)}
                                            disabled={isPayloadDisabled}
                                            tipType={ToolTip.TipType.ACTION_ARGUMENTS}
                                        />
                                    )
                                })
                            )}

                        {this.state.selectedActionTypeOptionKey !== ActionTypes.CARD
                        && (<div className={(this.state.isPayloadValid ? '' : 'editor--error')}>
                            <div>
                                <ActionPayloadEditor
                                    label={this.state.selectedActionTypeOptionKey === ActionTypes.API_LOCAL ?
                                        'Arguments (Comma Separated)' : 'Response...'}
                                    allSuggestions={getMentionsAvailableForPayload}
                                    editorState={this.state.mentionEditorState}
                                    key={this.state.editorKey}
                                    placeholder={this.state.selectedActionTypeOptionKey === ActionTypes.API_LOCAL ? "Arguments..." : "Phrase..."}
                                    onChange={this.onChangeMentionEditor}
                                    disabled={isPayloadDisabled}
                                    tipType={this.state.selectedActionTypeOptionKey === ActionTypes.API_LOCAL ?
                                        ToolTip.TipType.ACTION_ARGUMENTS : ToolTip.TipType.ACTION_RESPONSE_TEXT}
                                />
                            </div>
                            {!this.state.isPayloadValid &&
                                (<div>
                                    <p className="ms-TextField-errorMessage css-18uf7rs errorMessage_26f1f271">
                                        <OF.Icon iconName="Error" /><span aria-live="assertive" data-automation-id="error-message">Response is required</span>
                                    </p>
                                </div>)}
                        </div>
                        )}

                        {this.state.selectedActionTypeOptionKey !== ActionTypes.CARD
                        && (<div className="blis-action-creator--expected-entities">
                            <TC.TagPicker
                                label="Expected Entity in Response..."
                                onResolveSuggestions={(text, tags) => this.onResolveExpectedEntityTags(text, tags)}
                                onRenderItem={this.onRenderExpectedTag}
                                getTextFromItem={item => item.name}
                                onChange={tags => this.onChangeExpectedEntityTags(tags)}
                                pickerSuggestionsProps={
                                    {
                                        suggestionsHeaderText: 'Entities',
                                        noResultsFoundText: 'No Entities Found'
                                    }
                                }
                                selectedItems={this.state.expectedEntityTags}
                                tipType={ToolTip.TipType.ACTION_SUGGESTED}
                            />
                        </div>
                        )}

                        <div className="blis-action-creator--required-entities">
                            <BlisTagPicker
                                nonRemovableTags={this.state.requiredEntityTagsFromPayload}
                                nonRemoveableStrikethrough={false}
                                label="Required Entities"
                                onResolveSuggestions={(text, tags) => this.onResolveRequiredEntityTags(text, tags)}
                                onRenderItem={this.onRenderRequiredEntityTag}
                                getTextFromItem={item => item.name}
                                onChange={tags => this.onChangeRequiredEntityTags(tags)}
                                pickerSuggestionsProps={
                                    {
                                        suggestionsHeaderText: 'Entities',
                                        noResultsFoundText: 'No Entities Found'
                                    }
                                }
                                selectedItems={this.state.requiredEntityTags}
                                tipType={ToolTip.TipType.ACTION_REQUIRED}
                            />
                        </div>

                        <div className="blis-action-creator--blocking-entities">
                            <BlisTagPicker
                                nonRemovableTags={this.state.expectedEntityTags}
                                label="Blocking Entities"
                                onResolveSuggestions={(text, tags) => this.onResolveNegativeEntityTags(text, tags)}
                                onRenderItem={this.onRenderNegativeEntityTag}
                                getTextFromItem={item => item.name}
                                onChange={tags => this.onChangeNegativeEntityTags(tags)}
                                pickerSuggestionsProps={
                                    {
                                        suggestionsHeaderText: 'Entities',
                                        noResultsFoundText: 'No Entities Found'
                                    }
                                }
                                selectedItems={this.state.negativeEntityTags}
                                tipType={ToolTip.TipType.ACTION_NEGATIVE}
                            />
                        </div>

                        <br />
                        <div>
                            <TC.Checkbox
                                label="Wait for Response?"
                                checked={this.state.isTerminal}
                                onChange={() => this.onChangeWaitCheckbox()}
                                style={{ marginTop: '1em', display: 'inline-block' }}
                                disabled={this.state.isEditing}
                                tipType={ToolTip.TipType.ACTION_WAIT}
                            />
                        </div>
                    </div>
                </div>

                <div className="blis-modal_footer blis-modal-buttons">
                    <div className="blis-modal-buttons_primary">
                        <OF.PrimaryButton
                            disabled={this.state.selectedActionTypeOptionKey == ActionTypes.API_LOCAL
                                ? this.state.selectedApiOptionKey === null
                                : !this.state.isPayloadValid}
                            onClick={() => this.onClickSubmit()}
                            ariaDescription="Submit"
                            text={this.state.isEditing ? 'Save' : 'Create'}
                        />

                        <OF.DefaultButton
                            onClick={() => this.onClickCancel()}
                            ariaDescription="Cancel"
                            text="Cancel"
                        />

                        {this.state.isEditing &&
                            <OF.DefaultButton
                                onClick={() => this.onClickDelete()}
                                ariaDescription="Delete"
                                text="Delete"
                            />}
                    </div>
                    <div className="blis-modal-buttons_secondary">
                        <OF.PrimaryButton
                            onClick={() => this.onClickCreateEntity()}
                            ariaDescription="Create Entity"
                            text="Entity"
                            iconProps={{ iconName: 'CirclePlus' }}
                        />
                    </div>
                </div>
                <ConfirmDeleteModal
                    open={this.state.isConfirmDeleteModalOpen}
                    onCancel={() => this.onCancelDelete()}
                    onConfirm={() => this.onConfirmDelete()}
                    title="Are you sure you want to delete this action?"
                />
                <EntityCreatorEditor
                    app={this.props.app}
                    open={this.state.isEntityEditorModalOpen}
                    entity={null}
                    handleClose={() => this.onCloseEntityEditor()}
                    handleOpenDeleteModal={() => {}}
                    entityTypeFilter={null}
                />
                <AdaptiveCardViewer
                    open={this.state.isCardViewerModalOpen && this.state.selectedCardOptionKey != null}
                    onDismiss={() => this.onCloseCardViewer()}
                    template={this.state.selectedCardOptionKey && this.props.botInfo.templates.find(t => t.name === this.state.selectedCardOptionKey)}
                    actionArguments={this.state.isCardViewerModalOpen && this.getActionArguments()}
                />
            </Modal>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        fetchBotInfoAsync
    }, dispatch);
}
const mapStateToProps = (state: State, ownProps: any) => {
    return {
        entities: state.entities,
        botInfo: state.bot.botInfo
    }
}

export interface ReceiveProps {
    app: BlisAppBase
    open: boolean
    action: ActionBase | null
    onClickSubmit: (action: ActionBase) => void
    onClickCancel: () => void
    onClickDelete: (action: ActionBase) => void
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceiveProps;

export default connect<typeof stateProps, typeof dispatchProps, ReceiveProps>(mapStateToProps, mapDispatchToProps)(ActionCreatorEditor)