import * as React from 'react'
import { EditorState, ContentState /*, convertToRaw */} from 'draft-js'
import { returntypeof } from 'react-redux-typescript'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Modal } from 'office-ui-fabric-react/lib/Modal'
import { PrimaryButton, Checkbox, DefaultButton, Dropdown, IDropdownOption, TagPicker, TextField, ITag, Label } from 'office-ui-fabric-react'
import { ActionBase, ActionTypes, ActionMetaData, BlisAppBase, EntityBase } from 'blis-models'
import ConfirmDeleteModal from './ConfirmDeleteModal'
import EntityCreatorEditor from './EntityCreatorEditor'
import ActionPayloadEditor, { utilities as payloadUtilities, IMention } from './ActionPayloadEditor'
import { State } from '../../types'
import { BlisTagItem, IBlisPickerItemProps } from './BlisTagItem'

const convertEntityToMention = (entity: EntityBase): IMention =>
    ({
        id: entity.entityId,
        name: entity.entityName,
        displayName: entity.entityName,
    })

const convertContentEntityToTag = (contentEntity: payloadUtilities.IContentEntity) =>
    ({
        key: contentEntity.entity.data.mention.id,
        name: contentEntity.entity.data.mention.displayName
    })

const convertEntityIdsToTags = (ids: string[], entities: EntityBase[]): ITag[] => {
    return ids
        .map<EntityBase>(entityId => entities.find(e => e.entityId === entityId))
        .map<ITag>(entity => ({
            key: entity.entityId,
            name: entity.entityName
        }))
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
    selectedActionTypeOptionKey: string | number
    entityTags: ITag[]
    selectedExpectedEntityTags: ITag[]
    requiredEntityTagsFromPayload: ITag[]
    selectedRequiredEntityTags: ITag[]
    selectedNegativeEntityTags: ITag[]
    mentionEditorState: EditorState
    editorKey: number
    tagsAvailableForPayload: ITag[]
    isTerminal: boolean
}

const initialState: ComponentState = {
    apiOptions: [],
    selectedApiOptionKey: null,
    isEditing: false,
    isEntityEditorModalOpen: false,
    isConfirmDeleteModalOpen: false,
    selectedActionTypeOptionKey: actionTypeOptions[0].key,
    entityTags: [],
    selectedExpectedEntityTags: [],
    requiredEntityTagsFromPayload: [],
    selectedRequiredEntityTags: [],
    selectedNegativeEntityTags: [],
    mentionEditorState: EditorState.createEmpty(),
    editorKey: 0,
    tagsAvailableForPayload: [],
    isTerminal: true
}

class ActionEditor extends React.Component<Props, ComponentState> {
    private openState: ComponentState = initialState
    state = initialState

    componentWillMount() {
        console.log(`componentWillMount`)
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
            tagsAvailableForPayload: entityTags,
            isEditing: !!this.props.action
        }

        this.setState(this.openState)
    }

    componentWillReceiveProps(nextProps: Props) {
        console.log(`componentWillReceiveProps`)

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
                const selectedExpectedEntityTags = []

                const expectedEntity: EntityBase = action.metadata && (action.metadata as any).entitySuggestion
                if (expectedEntity) {
                    selectedExpectedEntityTags.push({
                        key: expectedEntity.entityName,
                        name: expectedEntity.entityName
                    })
                }

                // Get editor state
                // const contentState = convertFromRaw(JSON.parse(action.payload))
                const contentState = ContentState.createFromText(action.payload)
                let editorState = EditorState.createWithContent(contentState)
                editorState = EditorState.moveFocusToEnd(editorState)
                editorState = EditorState.moveSelectionToEnd(editorState)

                // TODO: Remove coupling of mention id.  We're taking advantange that we know mentions use
                // internal id formatted as [<mentionTrigger>]mention and we know the mentionTrigger is '{'
                // This is mostly due to stretching the boundaries of what this plugin was meant to do.
                // We could try to recreate the mention editor if needed, but save that as last resort.
                const requiredEntityTagsFromPayload = payloadUtilities.getEntities(editorState, '{mention').map(convertContentEntityToTag)

                // Get all tags that are not already set as reuired tags
                const tagsAvailableForPayload = this.state.entityTags.filter(t => selectedRequiredEntityTags.every(tag => tag.key !== t.key))

                nextState = {
                    ...nextState,
                    selectedApiOptionKey: action.metadata.actionType,
                    mentionEditorState: editorState,
                    editorKey: this.state.editorKey + 1,
                    selectedExpectedEntityTags,
                    selectedNegativeEntityTags,
                    requiredEntityTagsFromPayload,
                    selectedRequiredEntityTags,
                    tagsAvailableForPayload,
                    isEditing: true
                }
            }
        }

        this.setState(prevState => nextState)
    }

    onChangeWaitCheckbox() {
        this.setState(prevState => ({
            isTerminal: !prevState.isTerminal
        }))
    }

    onChangedApiOption(apiOption: IDropdownOption) {
        this.setState({
            selectedApiOptionKey: apiOption.key
        })
    }

    onClickSubmit() {
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
                actionType: this.state.selectedApiOptionKey as string
            })
        })

        if (this.state.isEditing) {
            newOrEditedAction.actionId = this.props.action.actionId
        }

        this.props.onClickSubmit(newOrEditedAction)
    }

    onClickCancel() {
        this.props.onClickCancel()
    }

    onClickDelete() {
        this.setState({
            isConfirmDeleteModalOpen: true
        })
    }

    onCancelDelete() {
        this.setState({
            isConfirmDeleteModalOpen: false
        })
    }

    onConfirmDelete() {
        this.setState({
            isConfirmDeleteModalOpen: false
        }, () => {
            this.props.onClickDelete(this.props.action)
        })
    }

    onClickCreateEntity() {
        this.setState({
            isEntityEditorModalOpen: true
        })
    }

    onCloseEntityEditor() {
        this.setState({
            isEntityEditorModalOpen: false
        })
    }

    onDismissModal() {
        this.props.onClickCancel()
    }

    onChangedActionType(actionTypeOption: IDropdownOption) {
        console.log(`onChangedActionType: `, actionTypeOption)
        this.setState({
            selectedActionTypeOptionKey: actionTypeOption.key
        })
    }

    onResolveExpectedEntityTags(filterText: string, selectedTags: ITag[]): ITag[] {
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

    onRenderExpectedTag(props: IBlisPickerItemProps<ITag>): JSX.Element {
        const renderProps = { ...props }
        renderProps.highlight = true
        return <BlisTagItem { ...renderProps }>{props.item.name}</BlisTagItem>
    }

    onChangeExpectedEntityTags(nextTags: ITag[]) {
        console.log(`onChangeExpectedEntityTags: `, nextTags)

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

    onResolveRequiredEntityTags(filterText: string, selectedTags: ITag[]): ITag[] {
        return getSuggestedTags(
            filterText,
            this.state.entityTags,
            [...selectedTags, ...this.state.selectedNegativeEntityTags, ...this.state.selectedExpectedEntityTags]
        )
    }

    onChangeRequiredEntityTags(tags: ITag[]) {
        console.log(`onChangeRequiredEntityTags: `, tags)
        this.setState({
            selectedRequiredEntityTags: tags
        })
    }

    onResolveNegativeEntityTags(filterText: string, selectedTags: ITag[]): ITag[] {
        return getSuggestedTags(
            filterText,
            this.state.entityTags,
            [...selectedTags, ...this.state.selectedRequiredEntityTags]
        )
    }

    onChangeNegativeEntityTags(tags: ITag[]) {
        console.log(`onChangeNegativeEntityTags: `, tags)
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
        // TODO: Remove need for '{mention'. Risks possibily with getting out of sync with actual mention
        // which are configured in different file.
        // 1. Consolidate so it's guranteed across files
        // 2. Find better solution where id is not exposing implementation detail
        const entities = payloadUtilities.getEntities(editorState, '{mention')

        this.setState({
            mentionEditorState: editorState,
            selectedRequiredEntityTags: entities.map(convertContentEntityToTag)
        })
    }


    render() {
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
                            ? <div>
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
                            </div>
                            : <div>
                                <Label>Response...</Label>
                                <ActionPayloadEditor
                                    allSuggestions={this.props.entities.map(convertEntityToMention)}
                                    editorState={this.state.mentionEditorState}
                                    placeholder="Phrase..."
                                    onChange={this.onChangeMentionEditor}
                                    key={this.state.editorKey}
                                />
                            </div>
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
                            /* disabled={this.state.payload.length === 0} */
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

export default connect<typeof stateProps, typeof dispatchProps, ReceiveProps>(mapStateToProps, mapDispatchToProps)(ActionEditor)