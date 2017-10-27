import * as React from 'react'
import { returntypeof } from 'react-redux-typescript'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Modal } from 'office-ui-fabric-react/lib/Modal'
import { PrimaryButton, Checkbox, DefaultButton, Dropdown, IDropdownOption, TagPicker, TextField, ITag, Label } from 'office-ui-fabric-react'
import { ActionBase, ActionTypes, BlisAppBase, EntityBase } from 'blis-models'
import ConfirmDeleteModal from './ConfirmDeleteModal'
import EntityCreatorEditor from './EntityCreatorEditor'
import ActionPayloadEditor from './ActionPayloadEditor'
import { State } from '../../types'

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
    selectedRequiredEntityTags: ITag[]
    selectedNegativeEntityTags: ITag[]
    payload: string
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
    selectedRequiredEntityTags: [],
    selectedNegativeEntityTags: [],
    payload: '',
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
                key: e.entityName,
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
                    ...this.openState
                }
            }

            // If we are given an action, set edit mode and apply properties
            if (nextProps.action) {
                const action = nextProps.action

                const selectedNegativeEntityTags = this.convertEntityIdsToTags(action.negativeEntities, nextProps.entities)
                const selectedRequiredEntityTags = this.convertEntityIdsToTags(action.requiredEntities, nextProps.entities)
                const selectedExpectedEntityTags = []

                const expectedEntity: EntityBase = action.metadata && (action.metadata as any).entitySuggestion
                if (expectedEntity) {
                    selectedExpectedEntityTags.push({
                        key: expectedEntity.entityName,
                        name: expectedEntity.entityName
                    })
                }

                // Get all tags that are not already set as reuired tags
                const tagsAvailableForPayload = this.state.entityTags.filter(t => selectedRequiredEntityTags.every(tag => tag.key !== t.key))

                nextState = {
                    ...nextState,
                    selectedApiOptionKey: action.metadata.actionType,
                    payload: action.payload,
                    selectedExpectedEntityTags,
                    selectedNegativeEntityTags,
                    selectedRequiredEntityTags,
                    tagsAvailableForPayload,
                    isEditing: true
                }
            }
        }

        this.setState(prevState => nextState)
    }

    convertEntityIdsToTags(ids: string[], entities: EntityBase[]): ITag[] {
        return ids
            .map<EntityBase>(entityId => entities.find(e => e.entityId === entityId))
            .map<ITag>(entity => ({
                key: entity.entityName,
                name: entity.entityName
            }))
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
        this.props.onClickSubmit(this.props.action)
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
        if (selectedTags.length > 0) {
            return []
        }

        return getSuggestedTags(
            filterText,
            this.state.entityTags,
            [...selectedTags, ...this.state.selectedRequiredEntityTags]
        )
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

    onMatchTagInPayload(tag: ITag) {
        console.log(`onMatchTagInPayload: `, tag)

        const isTagAlreadyIncluded = this.state.selectedRequiredEntityTags.find(t => t.key === tag.key)
        if (isTagAlreadyIncluded) {
            console.error(`You attempted to add tag: ${tag.name} to the list of required entities, but was already included.`)
            return
        }

        this.setState({
            selectedRequiredEntityTags: [...this.state.selectedRequiredEntityTags, tag],
            tagsAvailableForPayload: this.state.tagsAvailableForPayload.filter(t => t.key !== tag.key)
        })
    }

    onUnmatchTagInPayload(tag: ITag) {
        console.log(`onUnmatchTagInPayload: `, tag)

        this.setState(prevState =>
            ({
                selectedRequiredEntityTags: prevState.selectedRequiredEntityTags.filter(t => t.key !== tag.key)
            }))
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
                            : <ActionPayloadEditor
                                tags={this.state.tagsAvailableForPayload}
                                value={this.state.payload}
                                onMatchTag={tag => this.onMatchTagInPayload(tag)}
                                onUnmatchTag={tag => this.onUnmatchTagInPayload(tag)}
                            />
                        }

                        <Label>Expected Entity in Response...</Label>
                        <TagPicker
                            onResolveSuggestions={(text, tags) => this.onResolveExpectedEntityTags(text, tags)}
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

                        <Label>Disallow Action when Entities are <b>NOT</b> in Memory...</Label>
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

                        <Label>Disallow Action when Entities <b>ARE</b> in Memory...</Label>
                        <TagPicker
                            onResolveSuggestions={(text, tags) => this.onResolveNegativeEntityTags(text, tags)}
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
                            disabled={this.state.payload.length === 0}
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