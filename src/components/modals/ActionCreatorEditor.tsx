/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import * as CLM from '@conversationlearner/models'
import * as ToolTip from '../ToolTips/ToolTips'
import * as TC from '../tipComponents'
import * as OF from 'office-ui-fabric-react';
import * as ActionPayloadEditor from './ActionPayloadEditor'
import { Value } from 'slate'
import { returntypeof } from 'react-redux-typescript'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Plain from 'slate-plain-serializer'
import actions from '../../actions'
import { formatMessageId } from '../../Utils/util'
import { Modal } from 'office-ui-fabric-react/lib/Modal'
import ConfirmCancelModal from './ConfirmCancelModal'
import EntityCreatorEditor from './EntityCreatorEditor'
import AdaptiveCardViewer from './AdaptiveCardViewer/AdaptiveCardViewer'
import { State } from '../../types'
import { CLTagItem, ICLPickerItemProps } from './CLTagItem'
import CLTagPicker from '../CLTagPicker'
import './ActionCreatorEditor.css'
import HelpIcon from '../HelpIcon'
import { withRouter } from 'react-router-dom'
import { RouteComponentProps } from 'react-router'
import { injectIntl, InjectedIntlProps } from 'react-intl'
import { FM } from '../../react-intl-messages'

const TEXT_SLOT = '#TEXT_SLOT#'

const convertEntityToOption = (entity: CLM.EntityBase): ActionPayloadEditor.IOption =>
    ({
        id: entity.entityId,
        name: entity.entityName
    })

const convertEntityToTag = (entity: CLM.EntityBase): OF.ITag =>
    ({
        key: entity.entityId,
        name: entity.entityName
    })

const convertOptionToTag = (option: ActionPayloadEditor.IOption): OF.ITag =>
    ({
        key: option.id,
        name: option.name
    })

const convertCallbackToOption = (callback: CLM.Callback): OF.IDropdownOption =>
    ({
        key: callback.name,
        text: callback.name
    })

const convertTemplateToOption = (template: CLM.Template): OF.IDropdownOption =>
    ({
        key: template.name,
        text: template.name
    })

const convertEntityIdsToTags = (ids: string[], entities: CLM.EntityBase[]): OF.ITag[] => {
    return entities
        .filter(e => ids.some(id => id === e.entityId))
        .map<OF.ITag>(convertEntityToTag)
}

// Entities that can be chosen for required / blocking
const conditionalEntityTags = (entities: CLM.EntityBase[]): IConditionalTag[] => {

    // Ignore resolvers and negative entities
    const filteredEntities = entities.filter(e => !e.doNotMemorize && !e.positiveId)

    let tags: IConditionalTag[] = []
    filteredEntities.forEach(e => {
        if (e.entityType === CLM.EntityType.ENUM && e.enumValues) {
            for (let enumValue of e.enumValues) {
                tags.push({
                    key: enumValue.enumValueId!,
                    name: `${e.entityName} = ${enumValue.enumValue}`,
                    condition: {
                        entityId: e.entityId,
                        valueId: enumValue.enumValueId!,
                        condition: CLM.ConditionType.EQUAL
                    }
                })
            }
        }
        else {
            tags.push({
                key: e.entityId,
                name: e.entityName,
                condition: null
            })
        }
    })
    return tags
}

// Entities that can be picked as expected entity
const expectedEntityTags = (entities: CLM.EntityBase[]): OF.ITag[] => {
    // Must be LUIS entity and not the negative
    return entities
        .filter(e => e.entityType === CLM.EntityType.LUIS && !e.positiveId)
        .map<OF.ITag>(convertEntityToTag)

}

// Returns true if conditions can't be true at the same time
const isConditionMutuallyExclusive = (tag1: OF.ITag, tag2: OF.ITag): boolean => {
    const ctag1 = tag1 as IConditionalTag
    const ctag2 = tag2 as IConditionalTag
    if (!ctag1.condition || !ctag2.condition) {
        return false
    }

    // Open for future condition type checks for now equal is only one
    if (ctag1.condition.entityId === ctag2.condition.entityId) {
        return true
    }
    return false;
}

const getSuggestedTags = (filterText: string, allTags: OF.ITag[], tagsToExclude: OF.ITag[], mutuallyExclusive: OF.ITag[] = []): OF.ITag[] => {
    let fText = (filterText.startsWith(ActionPayloadEditor.triggerCharacter) ? filterText.substring(1) : filterText).trim()

    let availableTags = allTags
        .filter(tag => !tagsToExclude.some(t => t.key === tag.key))

    // Check for mutually exclusive conditions and remove them 
    availableTags = availableTags
        .filter(tag => !mutuallyExclusive.some(t => isConditionMutuallyExclusive(t, tag)))

    if (fText.length === 0) {
        return availableTags
    }

    return availableTags
        .filter(tag => tag.name.toLowerCase().startsWith(fText.toLowerCase()))
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
        return Plain.deserialize("Action references an Entity that doesn't exist. Please re-enter the value and re-save the action.")
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

const actionTypeOptions = Object.values(CLM.ActionTypes)
    .map<OF.IDropdownOption>(actionTypeString => {
        return {
            key: actionTypeString,
            text: actionTypeString === 'API_LOCAL' ? "API" : actionTypeString
        }
    })

type SlateValueMap = { [slot: string]: ActionPayloadEditor.SlateValue }

interface IConditionalTag extends OF.ITag {
    condition: CLM.Condition | null
}

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
    validationWarnings: string[]
    isPayloadFocused: boolean
    isPayloadMissing: boolean
    entityWarning: boolean
    newOrEditedAction: CLM.ActionBase | null
    selectedActionTypeOptionKey: string | number
    availableExpectedEntityTags: OF.ITag[]
    conditionalTags: OF.ITag[]
    expectedEntityTags: OF.ITag[]
    requiredEntityTagsFromPayload: OF.ITag[]
    requiredEntityTags: IConditionalTag[]
    negativeEntityTags: IConditionalTag[]
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
    validationWarnings: [],
    isPayloadFocused: false,
    isPayloadMissing: true,
    entityWarning: false,
    newOrEditedAction: null,
    selectedActionTypeOptionKey: actionTypeOptions[0].key,
    availableExpectedEntityTags: [],
    conditionalTags: [],
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
        const apiOptions = botInfo.callbacks.map<OF.IDropdownOption>(convertCallbackToOption)
        const cardOptions = botInfo.templates.map<OF.IDropdownOption>(convertTemplateToOption)

        return {
            ...initialState,
            apiOptions,
            cardOptions,
            availableExpectedEntityTags: expectedEntityTags(entities),
            conditionalTags: conditionalEntityTags(entities),
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
                    // Ignore resolvers and negative entities
                    const entityTags = nextProps.entities.filter(e => !e.doNotMemorize && !e.positiveId).map<OF.ITag>(convertEntityToTag)

                    nextState = {
                        ...nextState,
                        availableExpectedEntityTags: expectedEntityTags(nextProps.entities),
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
                let selectedApiOptionKey: string | null = null
                let selectedCardOptionKey: string | null = null
                let entityWarning = false

                const slateValuesMap = {}
                const secondarySlateValuesMap = {}
                if (action.actionType === CLM.ActionTypes.TEXT) {
                    const textAction = new CLM.TextAction(action)
                    try {
                        slateValuesMap[TEXT_SLOT] = createSlateValue(textAction.value, payloadOptions)
                    }
                    catch {
                        // Default to raw value
                        let contentString: string = JSON.parse(textAction.payload).text
                        slateValuesMap[TEXT_SLOT] = Plain.deserialize(contentString)
                        entityWarning = true
                    }
                }
                else if (action.actionType === CLM.ActionTypes.END_SESSION) {
                    const sessionAction = new CLM.SessionAction(action)
                    slateValuesMap[TEXT_SLOT] = tryCreateSlateValue(CLM.ActionTypes.TEXT, TEXT_SLOT, sessionAction.value, payloadOptions)
                }
                else if (action.actionType === CLM.ActionTypes.API_LOCAL) {
                    const apiAction = new CLM.ApiAction(action)
                    selectedApiOptionKey = apiAction.name
                    const callback = this.props.botInfo.callbacks.find(t => t.name === selectedApiOptionKey)
                    if (callback) {
                        for (let actionArgumentName of callback.logicArguments) {
                            const argument = apiAction.logicArguments.find(a => a.parameter === actionArgumentName)
                            const initialValue = argument ? argument.value : ''
                            slateValuesMap[actionArgumentName] = tryCreateSlateValue(CLM.ActionTypes.API_LOCAL, actionArgumentName, initialValue, payloadOptions)
                        }
                        for (let actionArgumentName of callback.renderArguments) {
                            const argument = apiAction.renderArguments.find(a => a.parameter === actionArgumentName)
                            const initialValue = argument ? argument.value : ''
                            secondarySlateValuesMap[actionArgumentName] = tryCreateSlateValue(CLM.ActionTypes.API_LOCAL, actionArgumentName, initialValue, payloadOptions)
                        }
                    }

                }
                else if (action.actionType === CLM.ActionTypes.CARD) {
                    const cardAction = new CLM.CardAction(action)
                    selectedCardOptionKey = cardAction.templateName
                    const template = this.props.botInfo.templates.find(t => t.name === selectedCardOptionKey)
                    if (template) {
                        // For each template variable initialize to the associated argument value or default to empty string
                        for (let cardTemplateVariable of template.variables) {
                            const argument = cardAction.arguments.find(a => a.parameter === cardTemplateVariable.key)
                            const initialValue = argument ? argument.value : ''
                            slateValuesMap[cardTemplateVariable.key] = tryCreateSlateValue(CLM.ActionTypes.CARD, cardTemplateVariable.key, initialValue, payloadOptions)
                        }
                    }
                }

                const requiredEntityTagsFromPayload = Object.values(slateValuesMap)
                    .reduce<OF.ITag[]>((entities, value) => {
                        const newEntities = ActionPayloadEditor.Utilities.getNonOptionalEntitiesFromValue(value).map(convertOptionToTag)
                        // Only add new entities which are not already included from a previous payload
                        return [...entities, ...newEntities.filter(ne => !entities.some(e => e.key === ne.key))]
                    }, [])

                const requiredEntityTags = convertEntityIdsToTags(action.requiredEntities, nextProps.entities)
                    .filter(t => !requiredEntityTagsFromPayload.some(tag => tag.key === t.key))

                nextState = {
                    ...nextState,
                    isPayloadMissing: action.actionType === CLM.ActionTypes.TEXT && action.payload.length === 0,
                    entityWarning,
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
                prev: prevValue,
                // TODO: Should these be be getAllEntitiesFromValue
                currentEntities: ActionPayloadEditor.Utilities.getNonOptionalEntitiesFromValue(v),
                prevEntities: ActionPayloadEditor.Utilities.getNonOptionalEntitiesFromValue(prevValue)
            }
        })

        return pairedValues.some(pv => !pv.prev
            || pv.current.document.text !== pv.prev.document.text
            || pv.currentEntities.length !== pv.prevEntities.length)
    }

    areTagsIdentical(tags1: OF.ITag[], tags2: OF.ITag[]): boolean {
        if (tags1.length !== tags2.length) {
            return false
        }
        return tags1.reduce((acc, x, i) => { return acc && tags1[i].key === tags2[i].key }, true);

    }

    // Return list of any strings that look like they should be attached to 
    // entities but aren't
    untaggedEntities(): string[] {
        const primaryEntries = Object.entries(this.state.slateValuesMap)
        const secondaryEntries = Object.entries(this.state.secondarySlateValuesMap)

        let unattachedEntities: string[] = []
        primaryEntries.forEach(([k, v]) => {
            let text: string = v.document.text
            let tags = text.split(/[^0-9A-Za-z$-]/).filter(t => t.startsWith("$"))
            let entities = ActionPayloadEditor.Utilities.getAllEntitiesFromValue(v)
                .map(e => `$${e.name}`)
            tags.forEach(tag => {
                if (!entities.find(e => e === tag)) {
                    unattachedEntities.push(tag)
                }
            })
        })

        secondaryEntries.forEach(([k, v]) => {
            let text: string = v.document.text
            let tags = text.split(" ").filter(t => t.startsWith("$"))
            let entities = ActionPayloadEditor.Utilities.getAllEntitiesFromValue(v)
                .map(e => `$${e.name}`)
            tags.forEach(tag => {
                if (!entities.find(e => e === tag)) {
                    unattachedEntities.push(tag)
                }
            })
        })
        return unattachedEntities
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

    @OF.autobind
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

    getActionArguments(slateValuesMap: { [slot: string]: ActionPayloadEditor.SlateValue }): CLM.IActionArgument[] {
        return Object.entries(slateValuesMap)
            .filter(([parameter, value]) => value.document.text.length > 0)
            .map<CLM.IActionArgument>(([parameter, value]) => ({
                parameter,
                value: {
                    json: value.toJSON()
                }
            }))
    }

    /**
     * Pre-render slate values for display in card template
     */
    getRenderedActionArguments(slateValuesMap: { [slot: string]: ActionPayloadEditor.SlateValue }, entities: CLM.EntityBase[]): CLM.RenderedActionArgument[] {
        return Object.entries(slateValuesMap)
            .filter(([parameter, value]) => value.document.text.length > 0)
            .map<CLM.RenderedActionArgument>(([parameter, value]) => ({
                parameter,
                // TODO: Investigate alternative to get around need to use EntityIdSerializer directly is to construct mock CardAction and call .renderArguments()
                // ActionPayloadEditor.EntityIdSerializer.serialize(value, entityValueMap)
                value: Plain.serialize(value)
            }))
    }

    convertStateToModel(): CLM.ActionBase {
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
            case CLM.ActionTypes.TEXT: {
                const textValue = this.state.slateValuesMap[TEXT_SLOT]
                const tp: CLM.TextPayload = {
                    json: textValue.toJSON()
                }
                payload = JSON.stringify(tp)
                break;
            }
            case CLM.ActionTypes.CARD:
                const cp: CLM.CardPayload = {
                    payload: this.state.selectedCardOptionKey!.toString(),
                    arguments: this.getActionArguments(this.state.slateValuesMap)
                }
                payload = JSON.stringify(cp)
                break;
            case CLM.ActionTypes.API_LOCAL:
                const ap: CLM.ActionPayload = {
                    payload: this.state.selectedApiOptionKey!.toString(),
                    logicArguments: this.getActionArguments(this.state.slateValuesMap),
                    renderArguments: this.getActionArguments(this.state.secondarySlateValuesMap),
                }
                payload = JSON.stringify(ap)
                break;
            case CLM.ActionTypes.END_SESSION:
                const value = this.state.slateValuesMap[TEXT_SLOT]
                const t: CLM.TextPayload = {
                    json: value.toJSON()
                }
                payload = JSON.stringify(t)
                break;
            default:
                throw new Error(`When attempting to submit action, the selected action type: ${this.state.selectedActionTypeOptionKey} did not have matching type`)
        }

        const requiredTags = this.state.requiredEntityTags.filter(t => !t.condition)
        const negativeTags = this.state.negativeEntityTags.filter(t => !t.condition)
        const requiredConditions = this.state.requiredEntityTags.filter(t => t.condition).map(t => t.condition!)
        const negativeConditions = this.state.negativeEntityTags.filter(t => t.condition).map(t => t.condition!)


        // TODO: This should be new model such as ActionInput for creation only.
        const model = new CLM.ActionBase({
            actionId: null!,
            payload,
            createdDateTime: new Date().toJSON(),
            isTerminal: this.state.isTerminal,
            requiredEntitiesFromPayload: this.state.requiredEntityTagsFromPayload.map<string>(tag => tag.key),
            requiredEntities: [...this.state.requiredEntityTagsFromPayload, ...requiredTags].map<string>(tag => tag.key),
            negativeEntities: negativeTags.map<string>(tag => tag.key),
            requiredConditions,
            negativeConditions,
            suggestedEntity: (this.state.expectedEntityTags.length > 0) ? this.state.expectedEntityTags[0].key : null,
            version: 0,
            packageCreationId: 0,
            packageDeletionId: 0,
            actionType: CLM.ActionTypes[this.state.selectedActionTypeOptionKey]
        })

        if (this.state.isEditing && this.props.action) {
            model.actionId = this.props.action.actionId
        }
        return model
    }

    @OF.autobind
    async onClickSaveCreate() {
        let newOrEditedAction = this.convertStateToModel()
        let validationWarnings: string[] = []

        // Otherwise need to validate changes
        try {

            // If editing look for training dialog invalidations
            if (this.state.isEditing) {
                const invalidTrainingDialogIds = await ((this.props.fetchActionEditValidationThunkAsync(this.props.app.appId, this.props.editingPackageId, newOrEditedAction) as any) as Promise<string[]>)
                if (invalidTrainingDialogIds) {
                    if (invalidTrainingDialogIds.length > 0) {
                        validationWarnings.push(formatMessageId(this.props.intl, FM.ACTIONCREATOREDITOR_CONFIRM_EDIT_WARNING))
                    }
                }
            }

            // Note any untagged entities
            let untaggedEntities = this.untaggedEntities()
            untaggedEntities.forEach(e =>
                validationWarnings.push(`"${e}" ${formatMessageId(this.props.intl, FM.ACTIONCREATOREDITOR_CONFIRM_MISSINGLABEL_WARNING)}`)
            )

            if (validationWarnings.length > 0) {
                this.setState({
                    isConfirmEditModalOpen: true,
                    validationWarnings: validationWarnings,
                    newOrEditedAction: newOrEditedAction
                })
            }
            else {
                this.props.handleEdit(newOrEditedAction);
            }
        }
        catch (e) {
            const error = e as Error
            console.warn(`Error when attempting to validate edit: `, error)
        }
    }

    @OF.autobind
    onClickCancel() {
        this.props.handleClose()
    }

    @OF.autobind
    async onClickDelete() {
        if (!this.props.action) {
            return
        }

        try {
            const invalidTrainingDialogIds = await ((this.props.fetchActionDeleteValidationThunkAsync(this.props.app.appId, this.props.editingPackageId, this.props.action.actionId) as any) as Promise<string[]>)
            if (invalidTrainingDialogIds) {
                let validationWarnings = (invalidTrainingDialogIds.length > 0)
                    ? [formatMessageId(this.props.intl, FM.ACTIONCREATOREDITOR_CONFIRM_EDIT_WARNING)]
                    : []

                this.setState(
                    {
                        isConfirmDeleteModalOpen: true,
                        validationWarnings: validationWarnings
                    });
            }
        }
        catch (e) {
            const error = e as Error
            console.warn(`Error when attempting to validate delete: `, error)
        }
    }

    @OF.autobind
    onCancelDelete() {
        this.setState({
            isConfirmDeleteModalOpen: false
        })
    }

    @OF.autobind
    onCancelEdit() {
        this.setState({
            isConfirmEditModalOpen: false,
            newOrEditedAction: null
        })
    }

    @OF.autobind
    onConfirmEdit() {
        if (!this.state.newOrEditedAction) {
            console.warn(`You clicked to confirm edit, but there is no action to save`)
            return
        }

        let validationWarnings = [...this.state.validationWarnings]
        validationWarnings.pop()
        // Move to next validation warning if there is one
        if (validationWarnings.length > 0) {
            this.setState({ validationWarnings })
        }
        else {
            // Otherwise save
            this.props.handleEdit(this.state.newOrEditedAction)
            this.setState({
                isConfirmEditModalOpen: false,
                newOrEditedAction: null
            })
        }
    }

    @OF.autobind
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

    @OF.autobind
    onClickCreateEntity() {
        this.setState({
            isEntityEditorModalOpen: true
        })
    }

    @OF.autobind
    onCloseEntityEditor() {
        this.setState({
            isEntityEditorModalOpen: false
        })
    }

    onChangedActionType = (actionTypeOption: OF.IDropdownOption) => {
        const textPayload = this.state.slateValuesMap[TEXT_SLOT]
        let isPayloadMissing = (actionTypeOption.key === CLM.ActionTypes.TEXT && textPayload.document.text.length === 0)

        this.setState({
            isPayloadMissing,
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

    onChangeExpectedEntityTags = (tags: IConditionalTag[]) => {
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
            this.state.conditionalTags,
            [...selectedTags, ...this.state.requiredEntityTagsFromPayload, ...this.state.negativeEntityTags, ...this.state.expectedEntityTags],
            this.state.requiredEntityTags
        )
    }

    onChangeRequiredEntityTags = (tags: IConditionalTag[]) => {
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
            this.state.conditionalTags,
            [...selectedTags, ...this.state.requiredEntityTagsFromPayload, ...this.state.requiredEntityTags]
        )
    }

    onChangeNegativeEntityTags = (tags: IConditionalTag[]) => {
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
            .map(val => ActionPayloadEditor.Utilities.getNonOptionalEntitiesFromValue(val).map(convertOptionToTag))
            .reduce((a, b) => a.concat(b))
            .filter((t, i, xs) => i === xs.findIndex(tag => tag.key === t.key))
            .sort((a, b) => a.name.localeCompare(b.name))

        // If we added entity to a payload which was already in the list of required entities remove it to avoid duplicates.
        const requiredEntityTags = this.state.requiredEntityTags.filter(tag => !requiredEntityTagsFromPayload.some(t => t.key === tag.key))

        let isPayloadMissing = (this.state.selectedActionTypeOptionKey === CLM.ActionTypes.TEXT && value.document.text.length === 0)

        const nextState: Partial<ComponentState> = {
            entityWarning: false,
            isPayloadMissing,
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

    areInputsInvalid(): boolean {
        switch (this.state.selectedActionTypeOptionKey) {
            case CLM.ActionTypes.TEXT:
                return this.state.isPayloadMissing
            case CLM.ActionTypes.CARD:
                return this.state.selectedCardOptionKey === undefined
            case CLM.ActionTypes.API_LOCAL:
                return this.state.selectedApiOptionKey === undefined
            default:
                return false
        }
    }
    saveDisabled(): boolean {

        return this.areInputsInvalid()
            || (this.state.isEditing && !this.state.hasPendingChanges)
            || (!this.state.isTerminal && (this.state.expectedEntityTags.length > 0))
    }

    @OF.autobind
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

    @OF.autobind
    validationWarning(): JSX.Element | null {
        if (this.state.validationWarnings.length > 0) {
            return (
                <div className="cl-text--warning">
                    <OF.Icon iconName="Warning" className="cl-icon" /> Warning:&nbsp;
                    {this.state.validationWarnings[this.state.validationWarnings.length - 1]}
                </div>
            )
        }
        return null
    }

    render() {
        const { intl } = this.props

        const payloadError = this.state.entityWarning
            ? formatMessageId(intl, FM.ACTIONCREATOREDITOR_WARNING_ENTITY)
            : this.state.isPayloadMissing
                ? formatMessageId(intl, FM.ACTIONCREATOREDITOR_WARNING_PAYLOAD) : null

        // Disable payload if we're editing existing action and no API or CARD data available
        const isPayloadDisabled =
            (this.state.selectedActionTypeOptionKey === CLM.ActionTypes.API_LOCAL
                && (this.state.apiOptions.length === 0))
            || (this.state.selectedActionTypeOptionKey === CLM.ActionTypes.CARD
                && (this.state.cardOptions.length === 0));

        // Available Mentions: All entities - expected entity - required entities from payload - disqualified entities
        const unavailableTags = [...this.state.expectedEntityTags, ...this.state.negativeEntityTags]
        const optionsAvailableForPayload = this.props.entities
            .filter(e => !unavailableTags.some(t => t.key === e.entityId))
            // Remove negative entities (Those which have a positiveId)
            .filter(e => typeof e.positiveId !== "string")
            // Remove do not memorizable entities (Those prebuilt entity types with no default extractor)
            .filter(e => !e.doNotMemorize)
            .map(convertEntityToOption)

        const disabled = this.state.isEditing && this.isUsedByTrainingDialogs()

        const template = this.state.selectedActionTypeOptionKey === CLM.ActionTypes.CARD
            && this.state.selectedCardOptionKey
            ? this.props.botInfo.templates.find(t => t.name === this.state.selectedCardOptionKey)
            : undefined

        const callback = this.state.selectedActionTypeOptionKey === CLM.ActionTypes.API_LOCAL
            && this.state.selectedApiOptionKey
            ? this.props.botInfo.callbacks.find(t => t.name === this.state.selectedApiOptionKey)
            : undefined
        return (
            <Modal
                isOpen={this.props.open}
                isBlocking={false}
                containerClassName="cl-modal cl-modal--medium"
            >
                <div className="cl-modal_header" data-testid="create-an-action-title">
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

                        {this.state.selectedActionTypeOptionKey === CLM.ActionTypes.API_LOCAL
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
                                        tipType={ToolTip.TipType.ACTION_API1}
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
                                                                    <OF.Label className="ms-Label--tight cl-label">{apiArgument} <HelpIcon tipType={ToolTip.TipType.ACTION_ARGUMENTS} /></OF.Label>
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
                                                                    <OF.Label className="ms-Label--tight cl-label">{apiArgument} <HelpIcon tipType={ToolTip.TipType.ACTION_ARGUMENTS} /></OF.Label>
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

                        {this.state.selectedActionTypeOptionKey === CLM.ActionTypes.CARD
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
                                                        <OF.Label className="cl-label">{cardTemplateVariable.key} <HelpIcon tipType={ToolTip.TipType.ACTION_ARGUMENTS} /></OF.Label>
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

                        {this.state.selectedActionTypeOptionKey === CLM.ActionTypes.TEXT
                            && (<div className={(payloadError ? 'editor--error' : '')}>
                                <div>
                                    <OF.Label className="ms-Label--tight cl-label">Bot's response...
                                        <HelpIcon tipType={ToolTip.TipType.ACTION_RESPONSE_TEXT} />
                                    </OF.Label>
                                    <ActionPayloadEditor.Editor
                                        options={optionsAvailableForPayload}
                                        value={this.state.slateValuesMap[TEXT_SLOT]}
                                        placeholder="Phrase..."
                                        onChange={eState => this.onChangePayloadEditor(eState, TEXT_SLOT)}
                                        onSubmit={() => this.onSubmitPayloadEditor()}
                                        disabled={isPayloadDisabled}
                                    />
                                </div>
                                {payloadError &&
                                    (<div>
                                        <p className="cl-input-warning">
                                            <span aria-live="assertive" data-automation-id="error-message">{payloadError}</span>
                                        </p>
                                    </div>)}
                            </div>
                            )}

                        {this.state.selectedActionTypeOptionKey === CLM.ActionTypes.END_SESSION
                            && (<div className={(payloadError ? 'editor--error' : '')}>
                                <div>
                                    <OF.Label className="ms-Label--tight cl-label">Data... <HelpIcon tipType={ToolTip.TipType.ACTION_END_SESSION} /></OF.Label>
                                    <ActionPayloadEditor.Editor
                                        options={optionsAvailableForPayload}
                                        value={this.state.slateValuesMap[TEXT_SLOT]}
                                        placeholder=" "
                                        onChange={eState => this.onChangePayloadEditor(eState, TEXT_SLOT)}
                                        onSubmit={() => this.onSubmitPayloadEditor()}
                                        disabled={isPayloadDisabled}
                                    />
                                </div>
                                {payloadError &&
                                    (<div>
                                        <p className="cl-input-warning">
                                            <span aria-live="assertive" data-automation-id="error-message">{payloadError}</span>
                                        </p>
                                    </div>)}
                            </div>
                            )}

                        {this.state.selectedActionTypeOptionKey !== CLM.ActionTypes.CARD &&
                            this.state.selectedActionTypeOptionKey !== CLM.ActionTypes.END_SESSION &&
                            (<div className="cl-action-creator--expected-entities">
                                <TC.TagPicker
                                    label="Expected Entity in User reply..."
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
                                disabled={this.state.selectedActionTypeOptionKey === CLM.ActionTypes.END_SESSION}
                                tipType={ToolTip.TipType.ACTION_WAIT}
                            />
                        </div>
                        <div
                            className="cl-error-message-label"
                            style={{ display: !this.state.isTerminal && this.state.expectedEntityTags.length ? "block" : "none", gridGap: "0" }}>
                            {formatMessageId(intl, FM.ACTIONCREATOREDITOR_WARNING_NONEMPTYFIELD)}
                        </div>
                    </div>
                </div>

                <div className="cl-modal_footer cl-modal-buttons">
                    <div className="cl-modal-buttons_secondary">
                        {this.state.isEditing &&
                            <OF.DefaultButton
                                onClick={this.onClickTrainDialogs}
                                iconProps={{ iconName: 'QueryList' }}
                                ariaDescription={formatMessageId(intl, FM.ACTIONCREATOREDITOR_TRAINDIALOGSBUTTON_ARIADESCRIPTION)}
                                text={formatMessageId(intl, FM.ACTIONCREATOREDITOR_TRAINDIALOGSBUTTON_TEXT)}
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
                                formatMessageId(intl, FM.ACTIONCREATOREDITOR_SAVEBUTTON_ARIADESCRIPTION) :
                                formatMessageId(intl, FM.ACTIONCREATOREDITOR_CREATEBUTTON_ARIADESCRIPTION)}
                            text={this.state.isEditing ?
                                formatMessageId(intl, FM.ACTIONCREATOREDITOR_SAVEBUTTON_TEXT) :
                                formatMessageId(intl, FM.ACTIONCREATOREDITOR_CREATEBUTTON_TEXT)}
                        />

                        <OF.DefaultButton
                            onClick={this.onClickCancel}
                            ariaDescription={formatMessageId(intl, FM.ACTIONCREATOREDITOR_CANCELBUTTON_ARIADESCRIPTION)}
                            text={formatMessageId(intl, FM.ACTIONCREATOREDITOR_CANCELBUTTON_TEXT)}
                        />

                        {this.state.isEditing &&
                            <OF.DefaultButton
                                className="cl-button-delete"
                                onClick={this.onClickDelete}
                                ariaDescription={formatMessageId(intl, FM.ACTIONCREATOREDITOR_DELETEBUTTON_ARIADESCRIPTION)}
                                text={formatMessageId(intl, FM.ACTIONCREATOREDITOR_DELETEBUTTON_TEXT)}
                            />}
                    </div>
                </div>
                <ConfirmCancelModal
                    open={this.state.isConfirmDeleteModalOpen}
                    onCancel={this.onCancelDelete}
                    onConfirm={this.onConfirmDelete}
                    title={formatMessageId(intl, FM.ACTIONCREATOREDITOR_CONFIRM_DELETE_TITLE)}
                    message={this.validationWarning}
                />
                <ConfirmCancelModal
                    open={this.state.isConfirmEditModalOpen}
                    onCancel={this.onCancelEdit}
                    onConfirm={this.onConfirmEdit}
                    title={formatMessageId(intl, FM.ACTIONCREATOREDITOR_CONFIRM_EDIT_TITLE)}
                    message={this.validationWarning}
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
    app: CLM.AppBase
    editingPackageId: string
    open: boolean
    action: CLM.ActionBase | null
    handleEdit: (action: CLM.ActionBase) => void
    handleClose: () => void
    handleDelete: (action: CLM.ActionBase) => void
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceiveProps & InjectedIntlProps & RouteComponentProps<any>

export default connect<typeof stateProps, typeof dispatchProps, ReceiveProps>(mapStateToProps, mapDispatchToProps)(withRouter(injectIntl(ActionCreatorEditor)))