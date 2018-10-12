/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import { Value } from 'slate'
import { returntypeof } from 'react-redux-typescript'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Plain from 'slate-plain-serializer'
import actions from '../../actions'
import { Modal } from 'office-ui-fabric-react/lib/Modal'
import { ActionBase, ActionTypes, AppBase, EntityBase, EntityType, RenderedActionArgument, SessionAction, TextAction, ApiAction, CardAction, IActionArgument, Callback, Template, ActionPayload, CardPayload, TextPayload } from '@conversationlearner/models'
import ConfirmCancelModal from './ConfirmCancelModal'
import EntityCreatorEditor from './EntityCreatorEditor'
import AdaptiveCardViewer from './AdaptiveCardViewer/AdaptiveCardViewer'
import * as ActionPayloadEditor from './ActionPayloadEditor'
import { State } from '../../types'
import * as ToolTip from '../ToolTips'
import * as TC from '../tipComponents'
import * as OF from 'office-ui-fabric-react';
import { CLTagItem, ICLPickerItemProps } from './CLTagItem'
import CLTagPicker from '../CLTagPicker'
import './ActionCreatorEditor.css'
import HelpIcon from '../HelpIcon'
import { withRouter } from 'react-router-dom'
import { RouteComponentProps } from 'react-router'
import { autobind } from 'office-ui-fabric-react'
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl'
import { FM } from '../../react-intl-messages'

const TEXT_SLOT = '#TEXT_SLOT#';

const convertEntityToOption = (entity: EntityBase): ActionPayloadEditor.IOption =>
    ({
        id: entity.entityId,
        name: entity.entityName
    })

const convertEntityToTag = (entity: EntityBase): OF.ITag =>
    ({
        key: entity.entityId,
        name: entity.entityName
    })

const convertOptionToTag = (option: ActionPayloadEditor.IOption): OF.ITag =>
    ({
        key: option.id,
        name: option.name
    })

const convertCallbackToOption = (callback: Callback): OF.IDropdownOption =>
    ({
        key: callback.name,
        text: callback.name
    })

const convertTemplateToOption = (template: Template): OF.IDropdownOption =>
    ({
        key: template.name,
        text: template.name
    })

const convertEntityIdsToTags = (ids: string[], entities: EntityBase[]): OF.ITag[] => {
    return entities
        .filter(e => ids.some(id => id === e.entityId))
        .map<OF.ITag>(convertEntityToTag)
}

const getSuggestedTags = (filterText: string, allTags: OF.ITag[], tagsToExclude: OF.ITag[]): OF.ITag[] => {
    filterText = (filterText.startsWith(ActionPayloadEditor.triggerCharacter) ? filterText.substring(1) : filterText).trim()

    const availableTags = allTags
        .filter(tag => !tagsToExclude.some(t => t.key === tag.key))

    if (filterText.length === 0) {
        return availableTags
    }

    return availableTags
        .filter(tag => tag.name.toLowerCase().startsWith(filterText.toLowerCase()))
}

const tryCreateSlateValue = (actionType: string, slotName: string, content: object | string, options: ActionPayloadEditor.IOption[]): ActionPayloadEditor.SlateValue => {
    try {
        return createSlateValue(content, options)
    }
    catch (e) {
        const error = e as Error
        console.error(`Error occurred while attempting to construct slate value for action.
    Type: ${actionType}
    SlotName: ${slotName}
    content:\n`, content, options)
        console.error(error)
        return Plain.deserialize('Error occurred while attempting to display action. Please re-enter the value and re-save the action.')
    }
}

const createSlateValue = (content: object | string, options: ActionPayloadEditor.IOption[]): ActionPayloadEditor.SlateValue => {
    if (typeof content === 'string') {
        // If string does not starts with { assume it's the old simple string based payload and user will have to manually load and re-save
        // Otherwise, treat as json as load the json representation of the editor which has fully saved entities and doesn't need manual reconstruction
        if (!content.startsWith('{')) {
            console.warn(`You created slate value from basic string: ${content} which may have had entities that are not detected. Please update the payload to fix and re-save.`)
            return Plain.deserialize(content)
        }

        content = JSON.parse(content) as object
    }

    const updatedJson = ActionPayloadEditor.Utilities.updateOptionNames(content, options)
    return Value.fromJSON(updatedJson)
}

const actionTypeOptions = Object.values(ActionTypes)
    .map<OF.IDropdownOption>(actionTypeString => {
        return {
            key: actionTypeString,
            text: actionTypeString
        }
    })

type SlateValueMap = { [slot: string]: ActionPayloadEditor.SlateValue }

interface ComponentState {
    apiOptions: OF.IDropdownOption[]
    renderOptions: OF.IDropdownOption[]
    cardOptions: OF.IDropdownOption[]
    selectedApiOptionKey: string | number | undefined
    selectedRenderOptionKey: string | number | undefined
    selectedCardOptionKey: string | number | undefined
    hasPendingChanges: boolean
    initialEditState: ComponentState | null
    isEditing: boolean
    isEntityEditorModalOpen: boolean
    isCardViewerModalOpen: boolean
    isConfirmDeleteModalOpen: boolean
    isConfirmEditModalOpen: boolean
    showValidationWarning: boolean
    isPayloadFocused: boolean
    isPayloadValid: boolean
    newOrEditedAction: ActionBase | null
    selectedActionTypeOptionKey: string | number
    availableExpectedEntityTags: OF.ITag[]
    entityTags: OF.ITag[]
    expectedEntityTags: OF.ITag[]
    requiredEntityTagsFromPayload: OF.ITag[]
    requiredEntityTags: OF.ITag[]
    negativeEntityTags: OF.ITag[]
    slateValuesMap: SlateValueMap
    secondarySlateValuesMap: SlateValueMap
    isTerminal: boolean
}

const initialState: ComponentState = {
    apiOptions: [],
    renderOptions: [],
    cardOptions: [],
    selectedApiOptionKey: undefined,
    selectedRenderOptionKey: undefined,
    selectedCardOptionKey: undefined,
    hasPendingChanges: false,
    initialEditState: null,
    isEditing: false,
    isEntityEditorModalOpen: false,
    isCardViewerModalOpen: false,
    isConfirmDeleteModalOpen: false,
    isConfirmEditModalOpen: false,
    showValidationWarning: false,
    isPayloadFocused: false,
    isPayloadValid: false,
    newOrEditedAction: null,
    selectedActionTypeOptionKey: actionTypeOptions[0].key,
    availableExpectedEntityTags: [],
    entityTags: [],
    expectedEntityTags: [],
    requiredEntityTagsFromPayload: [],
    requiredEntityTags: [],
    negativeEntityTags: [],
    slateValuesMap: {
        [TEXT_SLOT]: Plain.deserialize('')
    },
    secondarySlateValuesMap: {},
    isTerminal: true
}

class ActionCreatorEditor extends React.Component<Props, ComponentState> {
    state = initialState;

    constructor(props: Props) {
        super(props)
        this.state = this.initProps()
    }

    initProps(): ComponentState {
        const { entities, botInfo } = this.props

        const entityTags = entities.map<OF.ITag>(e =>
            ({
                key: e.entityId,
                name: e.entityName
            }))

        const availableExpectedEntityTags = entities
            .filter(e => e.entityType === EntityType.LUIS)
            .map<OF.ITag>(convertEntityToTag)

        const apiOptions = botInfo.callbacks.map<OF.IDropdownOption>(convertCallbackToOption)
        const cardOptions = botInfo.templates.map<OF.IDropdownOption>(convertTemplateToOption)
    
        return {
            ...initialState,
            apiOptions,
            cardOptions,
            availableExpectedEntityTags,
            entityTags,
            isEditing: !!this.props.action
        }
    }

    componentWillReceiveProps(nextProps: Props) {
        let nextState: any = {}

        if (nextProps.open === true) {

            // Reset state every time dialog was closed and is opened
            if (this.props.open === false) {
                nextState = this.initProps();
            }
            // Otherwise reset only if props have changed
            else {
                if (nextProps.entities !== this.props.entities) {
                    const entityTags = nextProps.entities.map<OF.ITag>(convertEntityToTag)

                    const availableExpectedEntityTags = nextProps.entities
                        .filter(e => e.entityType === EntityType.LUIS)
                        .map<OF.ITag>(convertEntityToTag)

                    nextState = {
                        ...nextState,
                        availableExpectedEntityTags,
                        entityTags
                    }
                }

                if (nextProps.botInfo.callbacks !== this.props.botInfo.callbacks) {
                    const { botInfo } = nextProps
                    const apiOptions = botInfo.callbacks.map<OF.IDropdownOption>(convertCallbackToOption)

                    nextState = {
                        ...nextState,
                        apiOptions
                    }
                }

                if (nextProps.botInfo.templates !== this.props.botInfo.templates) {
                    const { botInfo } = nextProps
                    const cardOptions = botInfo.templates.map<OF.IDropdownOption>(convertTemplateToOption)

                    nextState = {
                        ...nextState,
                        cardOptions
                    }
                }
            }

            // If we are given an action, set edit mode and apply properties
            if (nextProps.action && nextProps.action !== this.props.action) {
                const action = nextProps.action

                const payloadOptions = this.props.entities.map(convertEntityToOption)
                const negativeEntityTags = convertEntityIdsToTags(action.negativeEntities, nextProps.entities)
                const expectedEntityTags = convertEntityIdsToTags((action.suggestedEntity ? [action.suggestedEntity] : []), nextProps.entities)
                let selectedApiOptionKey: string | null = null;
                let selectedCardOptionKey: string | null = null;

                const slateValuesMap = {}
                const secondarySlateValuesMap = {}
                if (action.actionType === ActionTypes.TEXT) {
                    const textAction = new TextAction(action)
                    slateValuesMap[TEXT_SLOT] = tryCreateSlateValue(ActionTypes.TEXT, TEXT_SLOT, textAction.value, payloadOptions)
                } else if (action.actionType === ActionTypes.END_SESSION) {
                    const sessionAction = new SessionAction(action)
                    slateValuesMap[TEXT_SLOT] = tryCreateSlateValue(ActionTypes.TEXT, TEXT_SLOT, sessionAction.value, payloadOptions)
                } else if (action.actionType === ActionTypes.API_LOCAL) {
                    const apiAction = new ApiAction(action)
                    selectedApiOptionKey = apiAction.name
                    const callback = this.props.botInfo.callbacks.find(t => t.name === selectedApiOptionKey)
                    if (callback) {
                        for (let actionArgumentName of callback.logicArguments) {
                            const argument = apiAction.logicArguments.find(a => a.parameter === actionArgumentName)
                            const initialValue = argument ? argument.value : ''
                            slateValuesMap[actionArgumentName] = tryCreateSlateValue(ActionTypes.API_LOCAL, actionArgumentName, initialValue, payloadOptions)
                        }
                        for (let actionArgumentName of callback.renderArguments) {
                            const argument = apiAction.renderArguments.find(a => a.parameter === actionArgumentName)
                            const initialValue = argument ? argument.value : ''
                            secondarySlateValuesMap[actionArgumentName] = tryCreateSlateValue(ActionTypes.API_LOCAL, actionArgumentName, initialValue, payloadOptions)
                        }
                    }

                } else if (action.actionType === ActionTypes.CARD) {
                    const cardAction = new CardAction(action)
                    selectedCardOptionKey = cardAction.templateName
                    const template = this.props.botInfo.templates.find(t => t.name === selectedCardOptionKey)
                    if (template) {
                        // For each template variable initialize to the associated argument value or default to empty string
                        for (let cardTemplateVariable of template.variables) {
                            const argument = cardAction.arguments.find(a => a.parameter === cardTemplateVariable.key)
                            const initialValue = argument ? argument.value : ''
                            slateValuesMap[cardTemplateVariable.key] = tryCreateSlateValue(ActionTypes.CARD, cardTemplateVariable.key, initialValue, payloadOptions)
                        }
                    }
                }

                const requiredEntityTagsFromPayload = Object.values(slateValuesMap)
                    .reduce<OF.ITag[]>((entities, value) => {
                        const newEntities = ActionPayloadEditor.Utilities.getEntitiesFromValue(value).map(convertOptionToTag)
                        // Only add new entities which are not already included from a previous payload
                        return [...entities, ...newEntities.filter(ne => !entities.some(e => e.key === ne.key))]
                    }, [])

                const requiredEntityTags = convertEntityIdsToTags(action.requiredEntities, nextProps.entities)
                    .filter(t => !requiredEntityTagsFromPayload.some(tag => tag.key === t.key))

                nextState = {
                    ...nextState,
                    isPayloadValid: action.actionType === ActionTypes.API_LOCAL || action.payload.length !== 0,
                    selectedActionTypeOptionKey: action.actionType,
                    selectedApiOptionKey,
                    selectedCardOptionKey,
                    slateValuesMap,
                    secondarySlateValuesMap,
                    expectedEntityTags,
                    negativeEntityTags,
                    requiredEntityTagsFromPayload,
                    requiredEntityTags,
                    isTerminal: action.isTerminal,
                    isEditing: true
                }

                nextState.initialEditState = nextState
            }
        }

        this.setState(prevState => nextState)
    }

    areSlateValuesChanged(slateValuesMap: SlateValueMap, prevSlateValuesMap: SlateValueMap) {
        const currentEntries = Object.entries(slateValuesMap)
        const prevEntries = Object.entries(prevSlateValuesMap)

        // If the objects have different amount of entries, return true
        if (currentEntries.length !== prevEntries.length) {
            return true
        }

        // Otherwise, go through each value and compare text
        // 1. First pair/zip the values by key
        const pairedValues = currentEntries.map(([k, v]) => {
            const prevValue = prevSlateValuesMap[k]
            return {
                key: k,
                current: v,
                prev: prevValue
            }
        })

        return pairedValues.some(pv => !pv.prev || pv.current.document.text !== pv.prev.document.text)
    }

    areTagsIdentical(tags1: OF.ITag[], tags2: OF.ITag[]): boolean {
        if (tags1.length !== tags2.length) {
            return false
        }
        return tags1.reduce((acc, x, i) => { return acc && tags1[i].key === tags2[i].key }, true);

    }
    componentDidUpdate(prevProps: Props, prevState: ComponentState) {
        const initialEditState = this.state.initialEditState
        if (!initialEditState) {
            return
        }
        
        const isAnyPayloadChanged = this.areSlateValuesChanged(this.state.slateValuesMap, initialEditState.slateValuesMap)
            || this.areSlateValuesChanged(this.state.secondarySlateValuesMap, initialEditState.secondarySlateValuesMap)
        
        const expectedEntitiesChanged = !initialEditState || !this.areTagsIdentical(this.state.expectedEntityTags, initialEditState.expectedEntityTags)
        const requiredEntitiesChanged = !initialEditState || !this.areTagsIdentical(this.state.requiredEntityTags, initialEditState.requiredEntityTags)
        const disqualifyingEntitiesChanged = !initialEditState || !this.areTagsIdentical(this.state.negativeEntityTags, initialEditState.negativeEntityTags)


        const isTerminalChanged = initialEditState!.isTerminal !== this.state.isTerminal
        const hasPendingChanges = isAnyPayloadChanged
            || expectedEntitiesChanged
            || requiredEntitiesChanged
            || disqualifyingEntitiesChanged
            || isTerminalChanged

        if (prevState.hasPendingChanges !== hasPendingChanges) {
            this.setState({
                hasPendingChanges
            })
        }
    }

    @autobind
    onChangeWaitCheckbox() {
        this.setState(prevState => ({
            isTerminal: !prevState.isTerminal
        }))
    }

    onChangedApiOption = (apiOption: OF.IDropdownOption) => {
        const callback = this.props.botInfo.callbacks.find(t => t.name === apiOption.key)
        if (!callback) {
            throw new Error(`Could not find api callback with name: ${apiOption.key}`)
        }

        // Initialize a new empty slate value for each of the arguments in the callback
        const newSlateValues = callback.logicArguments
            .reduce((values, argument) => {
                // Preserve old values if any transfer
                const oldValue = this.state.slateValuesMap[argument]
                values[argument] = oldValue || Plain.deserialize('')
                return values
            }, {})

        const newSecondarySlateValues = callback.renderArguments
            .reduce((values, argument) => {
                // Preserve old values if any transfer
                const oldValue = this.state.secondarySlateValuesMap[argument]
                values[argument] = oldValue || Plain.deserialize('')
                return values
            }, {})

        this.setState({
            selectedApiOptionKey: apiOption.key,
            slateValuesMap: newSlateValues,
            secondarySlateValuesMap: newSecondarySlateValues
        })
    }

    onChangedCardOption = (cardOption: OF.IDropdownOption) => {
        const template = this.props.botInfo.templates.find(t => t.name === cardOption.key)
        if (!template) {
            throw new Error(`Could not find template with name: ${cardOption.key}`)
        }

        // Initialize a new empty slate value for each of the arguments in the callback
        const newSlateValues = template.variables
            .reduce((values, variable) => {
                values[variable.key] = Plain.deserialize('')
                return values
            }, {})

        this.setState({
            selectedCardOptionKey: cardOption.key,
            slateValuesMap: newSlateValues
        })
    }

    onClickSyncBotInfo() {
        this.props.fetchBotInfoThunkAsync(this.props.browserId, this.props.app.appId)
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

    getActionArguments(slateValuesMap: { [slot: string]: ActionPayloadEditor.SlateValue }): IActionArgument[] {
        return Object.entries(slateValuesMap)
            .filter(([parameter, value]) => value.document.text.length > 0)
            .map<IActionArgument>(([parameter, value]) => ({
                parameter,
                value: {
                    json: value.toJSON()
                }
            }))
    }

    /**
     * Pre-render slate values for display in card template
     */
    getRenderedActionArguments(slateValuesMap: { [slot: string]: ActionPayloadEditor.SlateValue }, entities: EntityBase[]): RenderedActionArgument[] {
        return Object.entries(slateValuesMap)
            .filter(([parameter, value]) => value.document.text.length > 0)
            .map<RenderedActionArgument>(([parameter, value]) => ({
                parameter,
                // TODO: Investigate alternative to get around need to use EntityIdSerializer directly is to construct mock CardAction and call .renderArguments()
                // ActionPayloadEditor.EntityIdSerializer.serialize(value, entityValueMap)
                value: Plain.serialize(value)
            }))
    }

    convertStateToModel(): ActionBase {
        let payload: string | null = null

        /**
         * If action type if TEXT
         * Then payload map has single value named TEXT_SLOT:
         * 
         * E.g.
         * {
         *   [TEXT_SLOT]: {...slate value...}
         * }
         * 
         * Otherwise action type is CARD or API and we assume each value in the map is
         * a template variable or argument value respectively
         * 
         * E.g.
         * {
         *   [templateVariable1]: { ...slate value...},
         *   [templateVariable2]: { ...slate value...},
         *   [templateVariable3]: { ...slate value...}
         * }
         */
        switch (this.state.selectedActionTypeOptionKey) {
            case ActionTypes.TEXT: {
                const value = this.state.slateValuesMap[TEXT_SLOT]
                payload = JSON.stringify({
                    json: value.toJSON()
                } as TextPayload)
                break;
            }
            case ActionTypes.CARD:
                payload = JSON.stringify({
                    payload: this.state.selectedCardOptionKey!.toString(),
                    arguments: this.getActionArguments(this.state.slateValuesMap)
                } as CardPayload)
                break;
            case ActionTypes.API_LOCAL:
                payload = JSON.stringify({
                    payload: this.state.selectedApiOptionKey!.toString(),
                    logicArguments: this.getActionArguments(this.state.slateValuesMap),
                    renderArguments: this.getActionArguments(this.state.secondarySlateValuesMap),
                } as ActionPayload)
                break;
            case ActionTypes.END_SESSION:
                const value = this.state.slateValuesMap[TEXT_SLOT]
                payload = JSON.stringify({
                    json: value.toJSON()
                } as TextPayload)
                break;
            default:
                throw new Error(`When attempting to submit action, the selected action type: ${this.state.selectedActionTypeOptionKey} did not have matching type`)
        }

        // TODO: This should be new model such as ActionInput for creation only.
        const model = new ActionBase({
            actionId: null!,
            payload,
            createdDateTime: new Date().toJSON(),
            isTerminal: this.state.isTerminal,
            requiredEntitiesFromPayload: this.state.requiredEntityTagsFromPayload.map<string>(tag => tag.key),
            requiredEntities: [...this.state.requiredEntityTagsFromPayload, ...this.state.requiredEntityTags].map<string>(tag => tag.key),
            negativeEntities: this.state.negativeEntityTags.map<string>(tag => tag.key),
            suggestedEntity: (this.state.expectedEntityTags.length > 0) ? this.state.expectedEntityTags[0].key : null,
            version: 0,
            packageCreationId: 0,
            packageDeletionId: 0,
            actionType: ActionTypes[this.state.selectedActionTypeOptionKey]
        })

        if (this.state.isEditing && this.props.action) {
            model.actionId = this.props.action.actionId
        }
        return model
    }

    @autobind
    async onClickSaveCreate() {
        let newOrEditedAction = this.convertStateToModel();

        // If a new action just create it
        if (!this.state.isEditing) {
            this.props.handleEdit(newOrEditedAction);
            return;
        }

        // Otherwise need to validate changes
        try {
            const invalidTrainingDialogIds = await ((this.props.fetchActionEditValidationThunkAsync(this.props.app.appId, this.props.editingPackageId, newOrEditedAction) as any) as Promise<string[]>)
            if (invalidTrainingDialogIds) {
                if (invalidTrainingDialogIds.length > 0) {
                    this.setState({
                        isConfirmEditModalOpen: true,
                        showValidationWarning: true,
                        newOrEditedAction: newOrEditedAction
                    });
                } else {
                    this.props.handleEdit(newOrEditedAction);
                }
            }
        }
        catch (e) {
            const error = e as Error
            console.warn(`Error when attempting to validate edit: `, error)
        }
    }

    @autobind
    onClickCancel() {
        this.props.handleClose()
    }

    @autobind
    onClickDelete() {
        if (!this.props.action) {
            return
        }

        ((this.props.fetchActionDeleteValidationThunkAsync(this.props.app.appId, this.props.editingPackageId, this.props.action.actionId) as any) as Promise<string[]>)
            .then(invalidTrainingDialogIds => {

                if (invalidTrainingDialogIds) {
                    this.setState(
                    {
                        isConfirmDeleteModalOpen: true,
                        showValidationWarning: invalidTrainingDialogIds.length > 0
                    });
                }
            })
            .catch(error => {
                console.warn(`Error when attempting to validate delete: `, error)
            }
        )
    }

    @autobind
    onCancelDelete() {
        this.setState({
            isConfirmDeleteModalOpen: false
        })
    }

    @autobind
    onCancelEdit() {
        this.setState({
            isConfirmEditModalOpen: false,
            newOrEditedAction: null
        })
    }

    @autobind
    onConfirmEdit() {
        if (!this.state.newOrEditedAction) {
            console.warn(`You clicked to confirm edit, but there is no action to save`)
            return
        }

        this.props.handleEdit(this.state.newOrEditedAction)
        this.setState({
            isConfirmEditModalOpen: false,
            newOrEditedAction: null
        })
    }

    @autobind
    onConfirmDelete() {
        if (!this.props.action) {
            console.warn(`You clicked to confirm deletion, but there is no action to delete`)
            return
        }

        this.props.handleDelete(this.props.action)
        this.setState({
            isConfirmDeleteModalOpen: false
        })
    }

    @autobind
    onClickCreateEntity() {
        this.setState({
            isEntityEditorModalOpen: true
        })
    }

    @autobind
    onCloseEntityEditor() {
        this.setState({
            isEntityEditorModalOpen: false
        })
    }

    onChangedActionType = (actionTypeOption: OF.IDropdownOption) => {
        const textPayload = this.state.slateValuesMap[TEXT_SLOT]
        const isPayloadValid = actionTypeOption.key !== ActionTypes.TEXT && actionTypeOption.key !== ActionTypes.END_SESSION
            ? true
            : textPayload && (textPayload.document.text.length !== 0)

        this.setState({
            isPayloadValid,
            selectedActionTypeOptionKey: actionTypeOption.key,
            slateValuesMap: {
                [TEXT_SLOT]: Plain.deserialize('')
            },
            secondarySlateValuesMap: {}
        })
    }

    onResolveExpectedEntityTags = (filterText: string, selectedTags: OF.ITag[] | undefined): OF.ITag[] => {
        // TODO: Look at using different control such as a dropdown which implies using single value.
        // It is not possible to have more than 1 suggested entity
        // If there is already an entity selected return empty list to prevent adding more
        if (!selectedTags || selectedTags.length > 0) {
            return []
        }

        return getSuggestedTags(
            filterText,
            this.state.availableExpectedEntityTags,
            [...selectedTags, ...this.state.requiredEntityTagsFromPayload, ...this.state.requiredEntityTags]
        )
    }

    onRenderExpectedTag = (props: ICLPickerItemProps<OF.ITag>): JSX.Element => {
        const renderProps = { ...props }
        renderProps.highlight = true
        return <CLTagItem key={props.index} {...renderProps}>{props.item.name}</CLTagItem>
    }

    onChangeExpectedEntityTags = (tags: OF.ITag[]) => {
        const newExpectedEntityTag = tags[0]
        this.setState(prevState => ({
            expectedEntityTags: tags,
            negativeEntityTags: (!newExpectedEntityTag || prevState.negativeEntityTags.some(tag => tag.key === newExpectedEntityTag.key))
                ? prevState.negativeEntityTags
                : [...prevState.negativeEntityTags, newExpectedEntityTag]
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

    onRenderRequiredEntityTag = (props: ICLPickerItemProps<OF.ITag>): JSX.Element => {
        const renderProps = { ...props }
        const locked = this.state.requiredEntityTagsFromPayload.some(t => t.key === props.key)

        // Strike-out and lock/highlight if also the suggested entity
        renderProps.strike = false
        renderProps.locked = locked
        renderProps.highlight = locked

        return <CLTagItem key={props.index} {...renderProps}>{props.item.name}</CLTagItem>
    }

    onResolveNegativeEntityTags = (filterText: string, selectedTags: OF.ITag[]): OF.ITag[] => {
        return getSuggestedTags(
            filterText,
            this.state.entityTags,
            [...selectedTags, ...this.state.requiredEntityTagsFromPayload, ...this.state.requiredEntityTags]
        )
    }

    onChangeNegativeEntityTags = (tags: OF.ITag[]) => {
        this.setState({
            negativeEntityTags: tags
        })
    }

    onRenderNegativeEntityTag = (props: ICLPickerItemProps<OF.ITag>): JSX.Element => {
        const renderProps = { ...props }
        const suggestedEntityKey = this.state.expectedEntityTags.length > 0 ? this.state.expectedEntityTags[0].key : null

        renderProps.strike = true
        // If negative entity is also the suggested entity lock/highlight
        renderProps.locked = false
        renderProps.highlight = suggestedEntityKey === props.key

        return <CLTagItem key={props.index} {...renderProps}>{props.item.name}</CLTagItem>
    }

    // Payload editor is trying to submit action
    onSubmitPayloadEditor(): void {
        if (!this.saveDisabled()) {
            this.onClickSaveCreate();
        }
    }

    onChangePayloadEditor = (value: ActionPayloadEditor.SlateValue, slot: string, isSecondary: boolean = false) => {
        // Update slot with new value
        const slateValuesMap = isSecondary
            ? { ...this.state.secondarySlateValuesMap }
            : { ...this.state.slateValuesMap }
        
        const otherValuesMap = isSecondary
            ? { ...this.state.slateValuesMap }
            : { ...this.state.secondarySlateValuesMap }
        slateValuesMap[slot] = value;

        // Get new required entities from payloads
        // TODO: Would be more optimized to store required entities PER payload in the map instead of single value. This reduces computation for ALL
        // payloads during editing
        const requiredEntityTagsFromPayload = [...Object.values(slateValuesMap), ...Object.values(otherValuesMap)]
            .map(value => ActionPayloadEditor.Utilities.getEntitiesFromValue(value).map(convertOptionToTag))
            .reduce((a, b) => a.concat(b))
            .filter((t, i, xs) => i === xs.findIndex(tag => tag.key === t.key))
            .sort((a, b) => a.name.localeCompare(b.name))

        // If we added entity to a payload which was already in the list of required entities remove it to avoid duplicates.
        const requiredEntityTags = this.state.requiredEntityTags.filter(tag => !requiredEntityTagsFromPayload.some(t => t.key === tag.key))
        const isPayloadValid = (this.state.selectedActionTypeOptionKey !== ActionTypes.TEXT
            && this.state.selectedActionTypeOptionKey !== ActionTypes.END_SESSION)
                ? true
                : value.document.text.length !== 0

        const nextState: Partial<ComponentState> = {
            isPayloadValid,
            requiredEntityTagsFromPayload,
            requiredEntityTags
        }

        if (isSecondary) {
            nextState.secondarySlateValuesMap = slateValuesMap
        }
        else {
            nextState.slateValuesMap = slateValuesMap
        }

        this.setState(nextState as ComponentState)
    }

    saveDisabled(): boolean {
        const areInputsInvalid = (this.state.selectedActionTypeOptionKey === ActionTypes.API_LOCAL
            ? this.state.selectedApiOptionKey === null
            : !this.state.isPayloadValid)

        return areInputsInvalid
            || (this.state.isEditing && !this.state.hasPendingChanges)
    }

    @autobind
    onClickTrainDialogs() {
        const { history } = this.props
        history.push(`/home/${this.props.app.appId}/trainDialogs`, { app: this.props.app, actionFilter: this.props.action })
    }

    isUsedByTrainingDialogs(): boolean {
        if (!this.props.action) {
            return false
        }
        let tdString = JSON.stringify(this.props.trainDialogs)
        return tdString.indexOf(this.props.action.actionId) > -1
    }

    render() {
        // Disable payload if we're editing existing action and no API or CARD data available
        const isPayloadDisabled = 
            (this.state.selectedActionTypeOptionKey === ActionTypes.API_LOCAL
                && (this.state.apiOptions.length === 0))
            || (this.state.selectedActionTypeOptionKey === ActionTypes.CARD
                && (this.state.cardOptions.length === 0));

        // Available Mentions: All entities - expected entity - required entities from payload - disqualified entities
        const unavailableTags = [...this.state.expectedEntityTags, ...this.state.negativeEntityTags]
        const optionsAvailableForPayload = this.props.entities
            .filter(e => !unavailableTags.some(t => t.key === e.entityId))
            // Remove negative entities (Those which have a positiveId)
            .filter(e => typeof e.positiveId !== "string")
            .map(convertEntityToOption)

        const { intl } = this.props

        const disabled = this.state.isEditing && this.isUsedByTrainingDialogs()

        const template = this.state.selectedActionTypeOptionKey === ActionTypes.CARD
                            && this.state.selectedCardOptionKey
                            ? this.props.botInfo.templates.find(t => t.name === this.state.selectedCardOptionKey)
                            : undefined

        const callback = this.state.selectedActionTypeOptionKey === ActionTypes.API_LOCAL
                            && this.state.selectedApiOptionKey
                            ? this.props.botInfo.callbacks.find(t => t.name === this.state.selectedApiOptionKey)
                            : undefined
        return (
            <Modal
                isOpen={this.props.open}
                isBlocking={false}
                containerClassName="cl-modal cl-modal--medium"
            >
                <div className="cl-modal_header">
                    <span className={OF.FontClassNames.xxLarge}>{this.state.isEditing ? 'Edit Action' : 'Create an Action'}</span>
                </div>

                <div className="cl-modal_body">
                    <div className="cl-action-creator-form">
                        <TC.Dropdown
                            data-testid="dropdown-action-type"
                            label="Action Type"
                            options={actionTypeOptions}
                            onChanged={actionTypeOption => this.onChangedActionType(actionTypeOption)}
                            selectedKey={this.state.selectedActionTypeOptionKey}
                            disabled={disabled}
                            tipType={ToolTip.TipType.ACTION_TYPE}
                        />

                        {this.state.selectedActionTypeOptionKey === ActionTypes.API_LOCAL
                            && <div>
                                <div className="cl-dropdownWithButton-dropdown">
                                    <TC.Dropdown
                                        data-testid="dropdown-api-option"
                                        label="API"
                                        options={this.state.apiOptions}
                                        onChanged={this.onChangedApiOption}
                                        selectedKey={this.state.selectedApiOptionKey}
                                        disabled={this.state.apiOptions.length === 0}
                                        placeHolder={this.state.apiOptions.length === 0 ? 'NONE DEFINED' : 'API name...'}
                                        tipType={ToolTip.TipType.ACTION_API}
                                    />
                                    <OF.PrimaryButton
                                        className="cl-dropdownWithButton-button"
                                        onClick={() => this.onClickSyncBotInfo()}
                                        ariaDescription="Refresh"
                                        text=""
                                        iconProps={{ iconName: 'Sync' }}
                                    />
                                </div>
                                {this.state.selectedApiOptionKey
                                    && (callback
                                    ? <div>
                                        {callback.logicArguments.length > 0
                                            && <div>
                                            <OF.Label>Logic Arguments</OF.Label>
                                            {callback.logicArguments
                                                .map(apiArgument => {
                                                    return (
                                                        <React.Fragment key={apiArgument}>
                                                            <OF.Label className="ms-Label--tight">{apiArgument} <HelpIcon tipType={ToolTip.TipType.ACTION_ARGUMENTS}></HelpIcon></OF.Label>
                                                            <ActionPayloadEditor.Editor
                                                                options={optionsAvailableForPayload}
                                                                value={this.state.slateValuesMap[apiArgument]}
                                                                placeholder={''}
                                                                onChange={eState => this.onChangePayloadEditor(eState, apiArgument)}
                                                                onSubmit={() => this.onSubmitPayloadEditor()}
                                                                disabled={isPayloadDisabled}
                                                            />
                                                        </React.Fragment>
                                                    )
                                                })}
                                        </div>}
                                        {callback.renderArguments.length > 0
                                            && <div>
                                            <OF.Label>Render Arguments</OF.Label>
                                            {callback.renderArguments
                                                .map(apiArgument => {
                                                    return (
                                                        <React.Fragment key={apiArgument}>
                                                            <OF.Label className="ms-Label--tight">{apiArgument} <HelpIcon tipType={ToolTip.TipType.ACTION_ARGUMENTS}></HelpIcon></OF.Label>
                                                            <ActionPayloadEditor.Editor
                                                                options={optionsAvailableForPayload}
                                                                value={this.state.secondarySlateValuesMap[apiArgument]}
                                                                placeholder={''}
                                                                onChange={eState => this.onChangePayloadEditor(eState, apiArgument, true)}
                                                                onSubmit={() => this.onSubmitPayloadEditor()}
                                                                disabled={isPayloadDisabled}
                                                            />
                                                        </React.Fragment>
                                                    )
                                                })}
                                        </div>}
                                    </div>
                                    : <div className="cl-errorpanel">
                                        <div>ERROR: Bot Missing Callback: {this.state.selectedApiOptionKey}</div>
                                    </div>)
                                }
                            </div>
                        }

                        {this.state.selectedActionTypeOptionKey === ActionTypes.CARD
                            && <div>
                                <div className="cl-dropdownWithButton-dropdown">
                                    <TC.Dropdown
                                        label="Template"
                                        options={this.state.cardOptions}
                                        onChanged={(cardOption) => this.onChangedCardOption(cardOption)}
                                        selectedKey={this.state.selectedCardOptionKey}
                                        disabled={this.state.cardOptions.length === 0}
                                        placeHolder={this.state.cardOptions.length === 0 ? 'NONE DEFINED' : 'Template name...'}
                                        tipType={ToolTip.TipType.ACTION_CARD}
                                    />
                                    <OF.PrimaryButton
                                        className="cl-dropdownWithButton-button"
                                        onClick={() => this.onClickViewCard()}
                                        ariaDescription="Refresh"
                                        text=""
                                        iconProps={{ iconName: 'RedEye' }}
                                        disabled={this.state.selectedCardOptionKey == null}
                                    />
                                    <OF.PrimaryButton
                                        className="cl-dropdownWithButton-button"
                                        onClick={() => this.onClickSyncBotInfo()}
                                        ariaDescription="Refresh"
                                        text=""
                                        iconProps={{ iconName: 'Sync' }}
                                    />
                                </div>
                                {this.state.selectedCardOptionKey
                                    && (template
                                    ? template.variables
                                        .map(cardTemplateVariable => {
                                            return (
                                                <React.Fragment key={cardTemplateVariable.key}>
                                                    <OF.Label className="cl-label">{cardTemplateVariable.key} <HelpIcon tipType={ToolTip.TipType.ACTION_ARGUMENTS}></HelpIcon></OF.Label>
                                                    <ActionPayloadEditor.Editor
                                                        options={optionsAvailableForPayload}
                                                        value={this.state.slateValuesMap[cardTemplateVariable.key]}
                                                        placeholder={''}
                                                        onChange={eState => this.onChangePayloadEditor(eState, cardTemplateVariable.key)}
                                                        onSubmit={() => this.onSubmitPayloadEditor()}
                                                        disabled={isPayloadDisabled}
                                                    />
                                                </React.Fragment>
                                            )
                                        })
                                    : <div className="cl-errorpanel">
                                        <div>ERROR: Bot Missing Template: {this.state.selectedCardOptionKey}</div>
                                    </div>)
                                }
                            </div>
                        }

                        {this.state.selectedActionTypeOptionKey === ActionTypes.TEXT
                            && (<div className={(this.state.isPayloadValid ? '' : 'editor--error')}>
                                <div>
                                    <OF.Label className="ms-Label--tight">Response... <HelpIcon 
                                        tipType={ToolTip.TipType.ACTION_RESPONSE_TEXT} /></OF.Label>
                                    <ActionPayloadEditor.Editor
                                        options={optionsAvailableForPayload}
                                        value={this.state.slateValuesMap[TEXT_SLOT]}
                                        placeholder="Phrase..."
                                        onChange={eState => this.onChangePayloadEditor(eState, TEXT_SLOT)}
                                        onSubmit={() => this.onSubmitPayloadEditor()}
                                        disabled={isPayloadDisabled}
                                    />
                                </div>
                                {!this.state.isPayloadValid &&
                                    (<div>
                                        <p className="ms-TextField-errorMessage css-83 errorMessage_20d9206e">
                                            <OF.Icon iconName="Error" /><span aria-live="assertive" data-automation-id="error-message">Response is required</span>
                                        </p>
                                    </div>)}
                            </div>
                            )}

                        {this.state.selectedActionTypeOptionKey === ActionTypes.END_SESSION
                            && (<div className={(this.state.isPayloadValid ? '' : 'editor--error')}>
                                <div>
                                    <OF.Label className="ms-Label--tight">Data... <HelpIcon tipType={ToolTip.TipType.ACTION_END_SESSION}/></OF.Label>
                                    <ActionPayloadEditor.Editor
                                        options={optionsAvailableForPayload}
                                        value={this.state.slateValuesMap[TEXT_SLOT]}
                                        placeholder=" "
                                        onChange={eState => this.onChangePayloadEditor(eState, TEXT_SLOT)}
                                        onSubmit={() => this.onSubmitPayloadEditor()}
                                        disabled={isPayloadDisabled}
                                    />
                                </div>
                                {!this.state.isPayloadValid &&
                                    (<div>
                                        <p className="ms-TextField-errorMessage css-83 errorMessage_20d9206e">
                                            <OF.Icon iconName="Error" /><span aria-live="assertive" data-automation-id="error-message">Response is required</span>
                                        </p>
                                    </div>)}
                            </div>
                            )}

                        {this.state.selectedActionTypeOptionKey !== ActionTypes.CARD &&
                         this.state.selectedActionTypeOptionKey !== ActionTypes.END_SESSION &&
                            (<div className="cl-action-creator--expected-entities">
                                <TC.TagPicker
                                    label="Expected Entity in Response..."
                                    onResolveSuggestions={(text, tags) => this.onResolveExpectedEntityTags(text, tags)}
                                    onRenderItem={this.onRenderExpectedTag}
                                    getTextFromItem={item => item.name}
                                    onChange={this.onChangeExpectedEntityTags}
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

                        <div className="cl-action-creator--required-entities">
                            <CLTagPicker
                                nonRemovableTags={this.state.requiredEntityTagsFromPayload}
                                nonRemoveableStrikethrough={false}
                                label="Required Entities"
                                onResolveSuggestions={this.onResolveRequiredEntityTags}
                                onRenderItem={this.onRenderRequiredEntityTag}
                                getTextFromItem={item => item.name}
                                onChange={this.onChangeRequiredEntityTags}
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

                        <div className="cl-action-creator--disqualifying-entities">
                            <TC.TagPicker
                                label="Disqualifying Entities"
                                onResolveSuggestions={this.onResolveNegativeEntityTags}
                                onRenderItem={this.onRenderNegativeEntityTag}
                                getTextFromItem={item => item.name}
                                onChange={this.onChangeNegativeEntityTags}
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

                        <div className="cl-actioncreator-form-section">
                            <TC.Checkbox
                                data-testid="actioncreator-checkbox-wait"
                                label="Wait for Response?"
                                checked={this.state.isTerminal}
                                onChange={this.onChangeWaitCheckbox}
                                style={{ marginTop: '1em', display: 'inline-block' }}
                                disabled={disabled || this.state.selectedActionTypeOptionKey === ActionTypes.END_SESSION}
                                tipType={ToolTip.TipType.ACTION_WAIT}
                            />
                        </div>
                    </div>
                </div>

                <div className="cl-modal_footer cl-modal-buttons">
                    <div className="cl-modal-buttons_secondary">
                        {this.state.isEditing &&
                            <OF.DefaultButton
                                onClick={this.onClickTrainDialogs}
                                iconProps={{ iconName: 'QueryList' }}
                                ariaDescription={intl.formatMessage({
                                    id: FM.ACTIONCREATOREDITOR_TRAINDIALOGSBUTTON_ARIADESCRIPTION,
                                    defaultMessage: 'Train Dialogs'
                                })}
                                text={intl.formatMessage({
                                    id: FM.ACTIONCREATOREDITOR_TRAINDIALOGSBUTTON_TEXT,
                                    defaultMessage: 'Train Dialogs'
                                })}
                            />
                        }
                        <OF.DefaultButton
                            onClick={this.onClickCreateEntity}
                            ariaDescription="Create Entity"
                            text="Entity"
                            iconProps={{ iconName: 'CirclePlus' }}
                        />
                    </div>
                    <div className="cl-modal-buttons_primary">
                        <OF.PrimaryButton
                            data-testid="actioncreator-button-create"
                            disabled={this.saveDisabled()}
                            onClick={this.onClickSaveCreate}
                            ariaDescription={this.state.isEditing ?
                                intl.formatMessage({
                                    id: FM.ACTIONCREATOREDITOR_SAVEBUTTON_ARIADESCRIPTION,
                                    defaultMessage: 'Save'
                                }) :
                                intl.formatMessage({
                                    id: FM.ACTIONCREATOREDITOR_CREATEBUTTON_ARIADESCRIPTION,
                                    defaultMessage: 'Create'
                                })}
                            text={this.state.isEditing ?
                                intl.formatMessage({
                                    id: FM.ACTIONCREATOREDITOR_SAVEBUTTON_TEXT,
                                    defaultMessage: 'Save'
                                }) :
                                intl.formatMessage({
                                    id: FM.ACTIONCREATOREDITOR_CREATEBUTTON_TEXT,
                                    defaultMessage: 'Create'
                                })}
                        />

                        <OF.DefaultButton
                            onClick={this.onClickCancel}
                            ariaDescription={intl.formatMessage({
                                id: FM.ACTIONCREATOREDITOR_CANCELBUTTON_ARIADESCRIPTION,
                                defaultMessage: 'Cancel'
                            })}
                            text={intl.formatMessage({
                                id: FM.ACTIONCREATOREDITOR_CANCELBUTTON_TEXT,
                                defaultMessage: 'Cancel'
                            })}
                        />

                        {this.state.isEditing &&
                            <OF.DefaultButton
                                className="cl-button-delete"
                                onClick={this.onClickDelete}
                                ariaDescription={intl.formatMessage({
                                    id: FM.ACTIONCREATOREDITOR_DELETEBUTTON_ARIADESCRIPTION,
                                    defaultMessage: 'Delete'
                                })}
                                text={intl.formatMessage({
                                    id: FM.ACTIONCREATOREDITOR_DELETEBUTTON_TEXT,
                                    defaultMessage: 'Delete'
                                })}
                            />}
                    </div>
                </div>
                <ConfirmCancelModal
                    open={this.state.isConfirmDeleteModalOpen}
                    onCancel={this.onCancelDelete}
                    onConfirm={this.onConfirmDelete}
                    title={intl.formatMessage({
                        id: FM.ACTIONCREATOREDITOR_CONFIRM_DELETE_TITLE,
                        defaultMessage: 'Are you sure you want to delete this action?'
                    })}
                    message={() => this.state.showValidationWarning &&
                        <div className="cl-text--warning">
                            <OF.Icon iconName="Warning" className="cl-icon" /> Warning:&nbsp;
                            <FormattedMessage
                                id={FM.ACTIONCREATOREDITOR_CONFIRM_DELETE_WARNING}
                                defaultMessage='This Action is used by one or more Training Dialogs.  If you proceed they will removed from training until fixed.'
                            />
                    </div>}
                />
                <ConfirmCancelModal
                    open={this.state.isConfirmEditModalOpen}
                    onCancel={this.onCancelEdit}
                    onConfirm={this.onConfirmEdit}
                    title={intl.formatMessage({
                        id: FM.ACTIONCREATOREDITOR_CONFIRM_EDIT_TITLE,
                        defaultMessage: 'Are you sure you want to edit this action?'
                    })}
                    message={() => this.state.showValidationWarning &&
                        <div className="cl-text--warning">
                        <OF.Icon iconName="Warning" className="cl-icon" /> Warning:&nbsp;
                        <FormattedMessage
                            id={FM.ACTIONCREATOREDITOR_CONFIRM_EDIT_WARNING}
                            defaultMessage='This edit will invalidate one or more Training Dialogs.  If you proceed they will removed from training until fixed.'
                        />
                    </div>}
                />
                <EntityCreatorEditor
                    app={this.props.app}
                    editingPackageId={this.props.editingPackageId}
                    open={this.state.isEntityEditorModalOpen}
                    entity={null}
                    handleClose={this.onCloseEntityEditor}
                    handleDelete={() => { }}
                    entityTypeFilter={null}
                />
                <AdaptiveCardViewer
                    open={this.state.isCardViewerModalOpen && this.state.selectedCardOptionKey !== null}
                    onDismiss={() => this.onCloseCardViewer()}
                    template={this.state.selectedCardOptionKey !== null
                        ? this.props.botInfo.templates.find(t => t.name === this.state.selectedCardOptionKey)
                        : undefined}
                    actionArguments={this.state.isCardViewerModalOpen
                        ? this.getRenderedActionArguments(this.state.slateValuesMap, this.props.entities)
                        : []}
                    hideUndefined={false}
                />
            </Modal>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        fetchBotInfoThunkAsync: actions.bot.fetchBotInfoThunkAsync,
        fetchActionDeleteValidationThunkAsync: actions.action.fetchActionDeleteValidationThunkAsync,
        fetchActionEditValidationThunkAsync: actions.action.fetchActionEditValidationThunkAsync
    }, dispatch);
}
const mapStateToProps = (state: State, ownProps: any) => {
    if (!state.bot.botInfo) {
        throw new Error(`You attempted to render the ActionCreatorEditor which requires botInfo, but botInfo was not defined. This is likely a problem with higher level component. Please open an issue.`)
    }
    
    return {
        entities: state.entities,
        trainDialogs: state.trainDialogs,
        botInfo: state.bot.botInfo,
        browserId: state.bot.browserId
    }
}

export interface ReceiveProps {
    app: AppBase
    editingPackageId: string
    open: boolean
    action: ActionBase | null
    handleEdit: (action: ActionBase) => void
    handleClose: () => void
    handleDelete: (action: ActionBase) => void
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceiveProps & InjectedIntlProps & RouteComponentProps<any>

export default connect<typeof stateProps, typeof dispatchProps, ReceiveProps>(mapStateToProps, mapDispatchToProps)(withRouter(injectIntl(ActionCreatorEditor)))