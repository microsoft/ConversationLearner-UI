import * as React from 'react'
import { EditorState, ContentState, Modifier } from 'draft-js'
import { returntypeof } from 'react-redux-typescript'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { fetchBotInfoAsync } from '../../actions/fetchActions'
import { Modal } from 'office-ui-fabric-react/lib/Modal'
import { ActionBase, ActionTypes, ActionMetaData, BlisAppBase, EntityBase } from 'blis-models'
import ConfirmDeleteModal from './ConfirmDeleteModal'
import EntityCreatorEditor from './EntityCreatorEditor'
import ActionPayloadEditor, { utilities as EditorUtilities, IMention } from './ActionPayloadEditor'
import { State } from '../../types'
import * as ToolTip from '../ToolTips'
import * as OF from 'office-ui-fabric-react';
import { BlisTagItem, IBlisPickerItemProps } from './BlisTagItem'

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
    if (filterText.length === 0) {
        return []
    }

    return allTags
        .filter(tag => !tagsToExclude.some(t => t.key === tag.key))
        .filter(tag => tag.name.toLowerCase().startsWith(filterText.toLowerCase()))
}

const actionTypeOptions = Object.values(ActionTypes).map(v =>
    ({
        key: v,
        text: v
    }))

interface ComponentState {
    apiOptions: OF.IDropdownOption[]
    selectedApiOptionKey: string | number | null
    isEditing: boolean
    isEntityEditorModalOpen: boolean
    isConfirmDeleteModalOpen: boolean
    isPayloadFocused: boolean
    isPayloadValid: boolean
    selectedActionTypeOptionKey: string | number
    entityTags: OF.ITag[]
    selectedExpectedEntityTags: OF.ITag[]
    requiredEntityTagsFromPayload: OF.ITag[]
    selectedRequiredEntityTags: OF.ITag[]
    selectedNegativeEntityTags: OF.ITag[]
    mentionEditorState: EditorState
    editorKey: number
    isTerminal: boolean
}

const initialState: ComponentState = {
    apiOptions: [],
    selectedApiOptionKey: null,
    isEditing: false,
    isEntityEditorModalOpen: false,
    isConfirmDeleteModalOpen: false,
    isPayloadFocused: false,
    isPayloadValid: false,
    selectedActionTypeOptionKey: actionTypeOptions[0].key,
    entityTags: [],
    selectedExpectedEntityTags: [],
    requiredEntityTagsFromPayload: [],
    selectedRequiredEntityTags: [],
    selectedNegativeEntityTags: [],
    mentionEditorState: EditorState.createEmpty(),
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

        const callbacks = (botInfo.callbacks || [])
        const apiOptions = callbacks.map<OF.IDropdownOption>(v =>
            ({
                key: v,
                text: v
            }))

        this.openState = {
            ...initialState,
            apiOptions,
            entityTags,
            isEditing: !!this.props.action
        }

        this.setState(this.openState)
    }

    componentWillReceiveProps(nextProps: Props) {
        let nextState: Partial<ComponentState> = {}

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

                const selectedNegativeEntityTags = convertEntityIdsToTags(action.negativeEntities, nextProps.entities)
                const selectedRequiredEntityTags = convertEntityIdsToTags(action.requiredEntities, nextProps.entities)
                const selectedExpectedEntityTags = convertEntityIdsToTags((action.suggestedEntity ? [action.suggestedEntity] : []), nextProps.entities)

                /**
                 * Special processing for local API responses:
                 * TODO: Remove this after schema redesign
                 * Current this is depending on knowledge that the name of function is the first part of the payload separated by a space
                 * It should be explicit field of the payload object instead of substring.
                 */
                const actionType = action.metadata.actionType
                let payload = action.payload
                let selectedApiOptionKey: string | null = null

                if (actionType === ActionTypes.API_LOCAL) {
                    const splitPayload = action.payload.split(' ')
                    selectedApiOptionKey = splitPayload[0]
                    payload = splitPayload.slice(1).join(' ')
                }

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

                nextState = {
                    ...nextState,
                    isPayloadValid: actionType === ActionTypes.API_LOCAL || action.payload.length !== 0,
                    selectedActionTypeOptionKey: action.metadata.actionType,
                    selectedApiOptionKey,
                    mentionEditorState: editorState,
                    editorKey: this.state.editorKey + 1,
                    selectedExpectedEntityTags,
                    selectedNegativeEntityTags,
                    requiredEntityTagsFromPayload,
                    selectedRequiredEntityTags,
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

    onClickSyncAPI() {
        this.props.fetchBotInfoAsync();
    }

    onClickSubmit = () => {
        const contentState = this.state.mentionEditorState.getCurrentContent()
        // const rawContent = convertToRaw(contentState)
        let payload = contentState.getPlainText()

        if (this.state.selectedActionTypeOptionKey === ActionTypes.API_LOCAL) {
            payload = `${this.state.selectedApiOptionKey} ${payload}`
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
            requiredEntities: this.state.selectedRequiredEntityTags.map<string>(tag => tag.key),
            negativeEntities: this.state.selectedNegativeEntityTags.map<string>(tag => tag.key),
            suggestedEntity: this.state.selectedExpectedEntityTags.map<string>(tag => tag.key)[0],
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
            isEntityEditorModalOpen: false
        })
    }

    onDismissModal = () => {
        this.props.onClickCancel()
    }

    onChangedActionType = (actionTypeOption: OF.IDropdownOption) => {
        const isPayloadValid = actionTypeOption.key === ActionTypes.API_LOCAL
            ? true
            : this.state.mentionEditorState.getCurrentContent().hasText()
            
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
            [...selectedTags, ...this.state.selectedRequiredEntityTags]
        )
    }

    onRenderExpectedTag = (props: IBlisPickerItemProps<OF.ITag>): JSX.Element => {
        const renderProps = { ...props }
        renderProps.highlight = true
        return <BlisTagItem { ...renderProps }>{props.item.name}</BlisTagItem>
    }

    onChangeExpectedEntityTags = (nextTags: OF.ITag[]) => {
        this.setState((prevState: ComponentState) => {
            const nextState: Partial<ComponentState> = {
                selectedExpectedEntityTags: nextTags
            }

            const previousTags = prevState.selectedExpectedEntityTags
            // If we added a tag, also add it to the negative entities list
            if (nextTags.length > previousTags.length) {
                const addedTag = nextTags.find(tag => previousTags.every(t => t.key !== tag.key))
                if (addedTag) {
                    nextState.selectedNegativeEntityTags = [...previousTags, addedTag]
                }
            }
            // If we removed a tag, also remove it from negative entities list
            else if (nextTags.length < previousTags.length) {
                const removedTag = previousTags.find(tag => nextTags.every(t => t.key !== tag.key))
                if (removedTag) {
                    nextState.selectedNegativeEntityTags = prevState.selectedNegativeEntityTags.filter(tag => tag.key !== removedTag.key)
                }
            }

            return nextState
        })
    }

    onResolveRequiredEntityTags = (filterText: string, selectedTags: OF.ITag[]): OF.ITag[] => {
        return getSuggestedTags(
            filterText,
            this.state.entityTags,
            [...selectedTags, ...this.state.selectedNegativeEntityTags, ...this.state.selectedExpectedEntityTags]
        )
    }

    onChangeRequiredEntityTags = (tags: OF.ITag[]) => {
        this.setState({
            selectedRequiredEntityTags: tags
        })
    }

    onRenderRequiredEntityTag = (props: IBlisPickerItemProps<OF.ITag>): JSX.Element => {
        const renderProps = { ...props }
        const locked = this.state.requiredEntityTagsFromPayload.some(t => t.key === props.key)

        // Strickout and lock/highlight if also the suggested entity
        renderProps.strike = true
        renderProps.locked = locked
        renderProps.highlight = locked

        return <BlisTagItem {...renderProps}>{props.item.name}</BlisTagItem>
    }

    onResolveNegativeEntityTags(filterText: string, selectedTags: OF.ITag[]): OF.ITag[] {
        return getSuggestedTags(
            filterText,
            this.state.entityTags,
            [...selectedTags, ...this.state.selectedRequiredEntityTags]
        )
    }

    onChangeNegativeEntityTags(tags: OF.ITag[]) {
        this.setState({
            selectedNegativeEntityTags: tags
        })
    }

    onRenderNegativeEntityTag = (props: IBlisPickerItemProps<OF.ITag>): JSX.Element => {
        const renderProps = { ...props }
        const suggestedEntityKey = this.state.selectedExpectedEntityTags.length > 0 ? this.state.selectedExpectedEntityTags[0].key : null

        // Strickout and lock/highlight if also the suggested entity
        renderProps.strike = true
        renderProps.locked = suggestedEntityKey === props.key
        renderProps.highlight = suggestedEntityKey === props.key

        return <BlisTagItem {...renderProps}>{props.item.name}</BlisTagItem>
    }

    onChangeMentionEditor = (editorState: EditorState) => {
        const getEntities = EditorUtilities.getEntities
        const entityTagsFromPreviousEditorState = getEntities(this.state.mentionEditorState).map(convertContentEntityToTag)
        // Get entity tags from total required entities tags that are not from the payload
        const unmatchedRequiredEntityTags = this.state.selectedRequiredEntityTags.filter(t => !entityTagsFromPreviousEditorState.some(e => e.key === t.key))
        const entityTagsFromNewEditorState = EditorUtilities.getEntities(editorState).map(convertContentEntityToTag)
        const selectedRequiredEntityTags = [...entityTagsFromNewEditorState, ...unmatchedRequiredEntityTags]
        const nextContentState = editorState.getCurrentContent()
        const isPayloadValid = this.state.selectedActionTypeOptionKey === ActionTypes.API_LOCAL || nextContentState.hasText()

        this.setState({
            isPayloadValid,
            mentionEditorState: editorState,
            requiredEntityTagsFromPayload: entityTagsFromNewEditorState,
            selectedRequiredEntityTags
        })
    }

    render() {
        // Disable payload if action type is local api and we're editing existing action or there are no api callbacks
        const isPayloadDisabled = this.state.selectedActionTypeOptionKey === ActionTypes.API_LOCAL
            && (this.state.isEditing || this.state.apiOptions.length === 0)

        /**
         * Available Mentions: All entities - expected entity - required entities
         */
        const getMentionsAvailableForPayload = this.props.entities
            .filter(e => !this.state.selectedExpectedEntityTags.some(t => t.key === e.entityId))
            .filter(e => !this.state.selectedRequiredEntityTags.some(t => t.key === e.entityId))
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
                        {ToolTip.Wrap(
                            (<OF.Dropdown
                                label="Action Type"
                                options={actionTypeOptions}
                                onChanged={acionTypeOption => this.onChangedActionType(acionTypeOption)}
                                selectedKey={this.state.selectedActionTypeOptionKey}
                                disabled={this.state.isEditing}
                            />),
                            ToolTip.TipType.ACTION_TYPE, OF.DirectionalHint.bottomRightEdge)
                        }

                        {this.state.selectedActionTypeOptionKey === ActionTypes.API_LOCAL
                            && (<div>
                                {ToolTip.Wrap(
                                    (<div>
                                        <OF.Dropdown
                                            className="blis-dropdownWithButton-dropdown"
                                            label='API'
                                            options={this.state.apiOptions}
                                            onChanged={this.onChangedApiOption}
                                            selectedKey={this.state.selectedApiOptionKey}
                                            disabled={this.state.apiOptions.length === 0 || this.state.isEditing}
                                            placeHolder={this.state.apiOptions.length === 0 ? "NONE DEFINED" : "API name..."}
                                        />
                                        <div className="blis-dropdownWithButton-buttoncontainer">
                                            <OF.PrimaryButton
                                                className="blis-dropdownWithButton-button"
                                                onClick={() => this.onClickSyncAPI()}
                                                ariaDescription="Refresh"
                                                text=""
                                                iconProps={{ iconName: 'Sync' }}
                                            />
                                        </div>
                                    </div>),
                                    ToolTip.TipType.ACTION_API, OF.DirectionalHint.bottomRightEdge)
                                }
                            </div>
                            )}

                        <div className={(this.state.isPayloadValid ? '' : 'editor--error')}>
                            {ToolTip.Wrap(
                                (<div>
                                    <OF.Label>{this.state.selectedActionTypeOptionKey === ActionTypes.API_LOCAL
                                        ? "Arguments (Comma Separated)"
                                        : "Response..."
                                    }</OF.Label>
                                    <ActionPayloadEditor
                                        allSuggestions={getMentionsAvailableForPayload}
                                        editorState={this.state.mentionEditorState}
                                        key={this.state.editorKey}
                                        placeholder={this.state.selectedActionTypeOptionKey === ActionTypes.API_LOCAL ? "Arguments..." : "Phrase..."}
                                        onChange={this.onChangeMentionEditor}
                                        disabled={isPayloadDisabled}
                                    />
                                </div>),
                                this.state.selectedActionTypeOptionKey === ActionTypes.API_LOCAL ? ToolTip.TipType.ACTION_ARGUMENTS : ToolTip.TipType.ACTION_RESPONSE_TEXT,
                                OF.DirectionalHint.bottomRightEdge)
                            }
                            {!this.state.isPayloadValid &&
                                (<div>
                                    <p className="ms-TextField-errorMessage css-18uf7rs errorMessage_26f1f271">
                                        <OF.Icon iconName="Error" /><span aria-live="assertive" data-automation-id="error-message">Response is required</span>
                                    </p>
                                </div>)}
                        </div>

                        {ToolTip.Wrap(
                            (<div><OF.Label>Expected Entity in Response...</OF.Label>
                                <OF.TagPicker
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
                                    selectedItems={this.state.selectedExpectedEntityTags}
                                /></div>),
                            ToolTip.TipType.ACTION_SUGGESTED, OF.DirectionalHint.bottomRightEdge)
                        }
                        {ToolTip.Wrap(
                            (<div><OF.Label>Required Entities</OF.Label>
                                <OF.TagPicker
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
                                    selectedItems={this.state.selectedRequiredEntityTags}
                                /></div>),
                            ToolTip.TipType.ACTION_REQUIRED, OF.DirectionalHint.bottomRightEdge)
                        }
                        {ToolTip.Wrap(
                            (<div><OF.Label>Blocking Entities</OF.Label>
                                <OF.TagPicker
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
                                    selectedItems={this.state.selectedNegativeEntityTags}
                                /></div>),
                            ToolTip.TipType.ACTION_NEGATIVE, OF.DirectionalHint.bottomRightEdge)
                        }

                        <br />
                        {ToolTip.Wrap(
                            (<div><OF.Checkbox
                                label="Wait For Response?"
                                defaultChecked={true}
                                onChange={() => this.onChangeWaitCheckbox()}
                                style={{ marginTop: '1em', display: 'inline-block' }}
                                disabled={this.state.isEditing}
                            /></div>),
                            ToolTip.TipType.ACTION_WAIT, OF.DirectionalHint.bottomLeftEdge)
                        }
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
                    handleOpenDeleteModal={() => { }}
                    entityTypeFilter={null}
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