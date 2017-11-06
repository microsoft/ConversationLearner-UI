import * as React from 'react'
import { EditorState, ContentState, Modifier/* , convertToRaw */ } from 'draft-js'
import { returntypeof } from 'react-redux-typescript'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Modal } from 'office-ui-fabric-react/lib/Modal'
import { PrimaryButton, Checkbox, DefaultButton, Dropdown, IDropdownOption, TagPicker, TextField, ITag, Icon, Label } from 'office-ui-fabric-react'
import { ActionBase, ActionTypes, ActionMetaData, BlisAppBase, EntityBase } from 'blis-models'
import ConfirmDeleteModal from './ConfirmDeleteModal'
import EntityCreatorEditor from './EntityCreatorEditor'
import ActionPayloadEditor, { utilities as EditorUtilities, IMention } from './ActionPayloadEditor'
import { State } from '../../types'
import { BlisTagItem, IBlisPickerItemProps } from './BlisTagItem'

const convertEntityToMention = (entity: EntityBase): IMention =>
    ({
        id: entity.entityId,
        name: entity.entityName,
        displayName: entity.entityName,
    })

const convertEntityToTag = (entity: EntityBase): ITag =>
    ({
        key: entity.entityId,
        name: entity.entityName
    })

const convertContentEntityToTag = (contentEntity: EditorUtilities.IContentEntity): ITag =>
    ({
        key: contentEntity.entity.data.mention.id,
        name: contentEntity.entity.data.mention.displayName
    })

const convertEntityIdsToTags = (ids: string[], entities: EntityBase[]): ITag[] => {
    return ids
        .map<EntityBase>(entityId => entities.find(e => e.entityId === entityId))
        .map<ITag>(convertEntityToTag)
}

const getSuggestedTags = (filterText: string, allTags: ITag[], tagsToExclude: ITag[]): ITag[] => {
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
    apiOptions: IDropdownOption[]
    selectedApiOptionKey: string | number | null
    isEditing: boolean
    isEntityEditorModalOpen: boolean
    isConfirmDeleteModalOpen: boolean
    isPayloadFocused: boolean
    isPayloadValid: boolean
    selectedActionTypeOptionKey: string | number
    entityTags: ITag[]
    selectedExpectedEntityTags: ITag[]
    requiredEntityTagsFromPayload: ITag[]
    selectedRequiredEntityTags: ITag[]
    selectedNegativeEntityTags: ITag[]
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
    private openState: ComponentState = initialState
    state = initialState

    componentWillMount() {
        const { entities, botInfo } = this.props
        let entityTags = entities.map<ITag>(e =>
            ({
                key: e.entityId,
                name: e.entityName
            }))

        const callbacks = (botInfo.callbacks || [])
        const apiOptions = callbacks.map<IDropdownOption>(v =>
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

                // TODO: If we allow to store raw state of editor then restoring it is very easy
                // Currently there is issue where we don't know how to recreate the entities from the plain text
                // const contentState = convertFromRaw(JSON.parse(action.payload))

                // TODO: Manually create '$mention' entities by using regex and selection?
                const existingEntityMatches = (action.payload.match(/(\$[\w]+)/g) || [])
                    .map(match => {
                        // Get entity name by removing first character '$name' -> 'name'
                        const entityName = match.substring(1)
                        const startIndex = action.payload.indexOf(match)
                        const endIndex = startIndex + match.length
                        const entity = nextProps.entities.find(e => e.entityName === entityName)

                        return {
                            startIndex,
                            endIndex,
                            entity
                        }
                    })

                // Get editor state
                const contentState = ContentState.createFromText(action.payload)
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
                    isPayloadValid: action.payload.length !== 0,
                    selectedApiOptionKey: action.metadata.actionType,
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

    onChangedApiOption = (apiOption: IDropdownOption) => {
        this.setState({
            selectedApiOptionKey: apiOption.key
        })
    }

    onClickSubmit = () => {
        const contentState = this.state.mentionEditorState.getCurrentContent()
        // const rawContent = convertToRaw(contentState)
        const rawText = contentState.getPlainText()

        const newOrEditedAction = new ActionBase({
            actionId: null,
            payload: rawText, //`${rawText} : ${JSON.stringify(rawContent)}`,
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
        this.setState({
            isConfirmDeleteModalOpen: false
        }, () => {
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

    onChangedActionType = (actionTypeOption: IDropdownOption) => {
        this.setState({
            selectedActionTypeOptionKey: actionTypeOption.key
        })
    }

    onResolveExpectedEntityTags = (filterText: string, selectedTags: ITag[]): ITag[] => {
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

    onRenderExpectedTag = (props: IBlisPickerItemProps<ITag>): JSX.Element => {
        const renderProps = { ...props }
        renderProps.highlight = true
        return <BlisTagItem { ...renderProps }>{props.item.name}</BlisTagItem>
    }

    onChangeExpectedEntityTags = (nextTags: ITag[]) => {
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

    onResolveRequiredEntityTags = (filterText: string, selectedTags: ITag[]): ITag[] => {
        return getSuggestedTags(
            filterText,
            this.state.entityTags,
            [...selectedTags, ...this.state.selectedNegativeEntityTags, ...this.state.selectedExpectedEntityTags]
        )
    }

    onChangeRequiredEntityTags = (tags: ITag[]) => {
        this.setState({
            selectedRequiredEntityTags: tags
        })
    }

    onRenderRequiredEntityTag = (props: IBlisPickerItemProps<ITag>): JSX.Element => {
        const renderProps = { ...props }
        const locked = this.state.requiredEntityTagsFromPayload.some(t => t.key === props.key)

        // Strickout and lock/highlight if also the suggested entity
        renderProps.strike = true
        renderProps.locked = locked
        renderProps.highlight = locked

        return <BlisTagItem {...renderProps}>{props.item.name}</BlisTagItem>
    }

    onResolveNegativeEntityTags(filterText: string, selectedTags: ITag[]): ITag[] {
        return getSuggestedTags(
            filterText,
            this.state.entityTags,
            [...selectedTags, ...this.state.selectedRequiredEntityTags]
        )
    }

    onChangeNegativeEntityTags(tags: ITag[]) {
        this.setState({
            selectedNegativeEntityTags: tags
        })
    }

    onRenderNegativeEntityTag = (props: IBlisPickerItemProps<ITag>): JSX.Element => {
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
        const isPayloadValid = nextContentState.hasText()

        this.setState({
            isPayloadValid,
            mentionEditorState: editorState,
            requiredEntityTagsFromPayload: entityTagsFromNewEditorState,
            selectedRequiredEntityTags
        })
    }

    onBlurPayloadEditor = () => {
        this.setState({
            isPayloadFocused: false,
        })
    }

    onFocusPayloadEditor = () => {
        this.setState({
            isPayloadFocused: true,
        })
    }

    render() {
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
                containerClassName='blis-modal blis-modal--medium blis-modal--border'
            >
                <div className='blis-modal_header'>
                    <span className='ms-font-xxl ms-fontWeight-semilight'>{this.state.isEditing ? "Edit Action" : "Create an Action"}</span>
                </div>

                <div className='blis-modal_body'>
                    <div>
                        <Dropdown
                            label='Action Type'
                            options={actionTypeOptions}
                            onChanged={acionTypeOption => this.onChangedActionType(acionTypeOption)}
                            selectedKey={this.state.selectedActionTypeOptionKey}
                            disabled={this.state.isEditing}
                        />

                        {this.state.selectedActionTypeOptionKey === ActionTypes.API_LOCAL
                            ? (<div>
                                <Dropdown
                                    label='API'
                                    options={this.state.apiOptions}
                                    onChanged={apiOption => this.onChangedApiOption(apiOption)}
                                    selectedKey={this.state.selectedApiOptionKey}
                                    disabled={this.state.apiOptions.length === 0 || this.state.isEditing}
                                    placeHolder={this.state.apiOptions.length === 0 ? "NONE DEFINED" : "API name..."}
                                />
                                {/* <TextField
                                onChanged={this.payloadChanged}
                                label="Arguments (Comma Separated)"
                                placeholder="Arguments..."
                                autoFocus={true}
                                onFocus={this.payloadIsFocused}
                                onKeyDown={this.payloadKeyDown}
                                onBlur={this.payloadBlur}
                                value={this.state.payloadVal}
                                disabled={disabled}
                            /> */}
                                <TextField
                                    label="Arguments (Comma Separated)"
                                    placeholder="Arguments..."
                                    autoFocus={true}
                                    disabled={this.state.apiOptions.length === 0 || this.state.isEditing}
                                />
                            </div>)
                            : (<div className={(this.state.isPayloadValid ? "" : "editor--error") + (this.state.isPayloadFocused ? " editor--active" : "")}>
                                <Label>Response...</Label>
                                <ActionPayloadEditor
                                    allSuggestions={getMentionsAvailableForPayload}
                                    editorState={this.state.mentionEditorState}
                                    key={this.state.editorKey}
                                    placeholder="Phrase..."
                                    onChange={this.onChangeMentionEditor}
                                    onBlur={this.onBlurPayloadEditor}
                                    onFocus={this.onFocusPayloadEditor}
                                />
                                {!this.state.isPayloadValid &&
                                    (<div>
                                        <p className="ms-TextField-errorMessage css-18uf7rs errorMessage_26f1f271">
                                            <Icon iconName='Error' /><span aria-live="assertive" data-automation-id="error-message">Response is required</span>
                                        </p>
                                    </div>)}
                            </div>)
                        }

                        <Label>Expected Entity in Response...</Label>
                        <TagPicker
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
                        />

                        <Label>Required Entities: Disallow Action when Entities are <b>NOT</b> in Memory...</Label>
                        <TagPicker
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
                        />

                        <Label>Blocking Entities: Disallow Action when Entities <b>ARE</b> in Memory...</Label>
                        <TagPicker
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
                        />

                        <br />
                        <Checkbox
                            label='Wait For Response?'
                            defaultChecked={true}
                            onChange={() => this.onChangeWaitCheckbox()}
                            style={{ marginTop: "1em", display: "inline-block" }}
                            disabled={this.state.isEditing}
                        />
                    </div>
                </div>

                <div className="blis-modal_footer blis-modal-buttons">
                    <div className="blis-modal-buttons_primary">
                        <PrimaryButton
                            disabled={!this.state.isPayloadValid}
                            onClick={() => this.onClickSubmit()}
                            ariaDescription="Submit"
                            text={this.state.isEditing ? "Save" : "Create"}
                        />

                        <DefaultButton
                            onClick={() => this.onClickCancel()}
                            ariaDescription='Cancel'
                            text='Cancel'
                        />

                        {this.state.isEditing &&
                            <DefaultButton
                                onClick={() => this.onClickDelete()}
                                ariaDescription='Delete'
                                text='Delete'
                            />}
                    </div>
                    <div className="blis-modal-buttons_secondary">
                        <PrimaryButton
                            onClick={() => this.onClickCreateEntity()}
                            ariaDescription='Create Entity'
                            text='Entity'
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