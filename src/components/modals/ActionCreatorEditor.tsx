/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as React from 'react'
import * as CLM from '@conversationlearner/models'
import * as ToolTip from '../ToolTips/ToolTips'
import * as TC from '../tipComponents'
import * as OF from 'office-ui-fabric-react'
import * as Util from '../../Utils/util'
import * as DialogUtils from '../../Utils/dialogUtils'
import * as ActionPayloadEditor from './ActionPayloadEditor'
import Plain from 'slate-plain-serializer'
import actions from '../../actions'
import ActionDeleteModal from './ActionDeleteModal'
import ConditionModal from './ConditionModal'
import ConfirmCancelModal from './ConfirmCancelModal'
import EntityCreatorEditor from './EntityCreatorEditor'
import AdaptiveCardViewer from './AdaptiveCardViewer/AdaptiveCardViewer'
import CLTagPicker from '../CLTagPicker'
import HelpIcon from '../HelpIcon'
import { ImportedAction } from '../../types/models'
import { Value } from 'slate'
import { returntypeof } from 'react-redux-typescript'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { FeatureStrings, State } from '../../types'
import { REPROMPT_SELF } from '../../types/const'
import { CLTagItem, ICLPickerItemProps } from './CLTagItem'
import { withRouter } from 'react-router-dom'
import { RouteComponentProps } from 'react-router'
import { injectIntl, InjectedIntlProps } from 'react-intl'
import { FM } from '../../react-intl-messages'
import './ActionCreatorEditor.css'
import { autobind } from 'core-decorators';
import { TagItemSuggestion } from 'office-ui-fabric-react'
import { IConditionalTag, getEnumConditionName, convertConditionToConditionalTag, isConditionEqual, getUniqueConditions } from 'src/Utils/actionCondition'

const TEXT_SLOT = '#TEXT_SLOT#'

const addConditionPlaceholder: OF.ITag = {
    key: 'addConditionPlaceholder',
    name: 'Add Condition',
}
const addConditionPlaceholderButton = (
    <div className="cl-tag-item-suggestion--add-condition">
        <OF.PrimaryButton
            text="Add Condition"
            iconProps={{ iconName: 'Add' }}
            data-testid="action-creator-modal-button-add-condition"
        />
    </div>
)

const convertEntityToDropdownOption = (entity: CLM.EntityBase): OF.IDropdownOption =>
    ({
        key: entity.entityId,
        text: entity.entityName,
    })

const convertEntityToOption = (entity: CLM.EntityBase): ActionPayloadEditor.IOption =>
    ({
        id: entity.entityId,
        name: entity.entityName
    })

const convertEnumValueToDropdownOptions = (enumValueObject: CLM.EnumValue): OF.IDropdownOption =>
    ({
        // TODO: Change EnumValue definition on entities to always have an id
        // It only doesn't have id for new created values
        key: enumValueObject.enumValueId!,
        text: enumValueObject.enumValue
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

const convertEntityIdsToTags = (ids: string[], entities: CLM.EntityBase[], expand = true): IConditionalTag[] => {
    return entities
        .filter(e => ids.some(id => id === e.entityId))
        .map(e => convertEntityToConditionalTags(e, expand))
        .reduce((a, b) => [...a, ...b], [])
}

/**
 * If entity is ENUM convert each value into EQUAL condition
 * Otherwise convert with no condition
 */
const convertEntityToConditionalTags = (entity: CLM.EntityBase, expand = true): IConditionalTag[] => {
    if (expand && entity.entityType === CLM.EntityType.ENUM && entity.enumValues) {
        const enumEntityTag: IConditionalTag = {
            key: entity.entityId,
            name: entity.entityName,
            condition: null,
        }

        const conditionalTags = entity.enumValues.map<IConditionalTag>(enumValue =>
            ({
                key: enumValue.enumValueId!,
                name: getEnumConditionName(entity, enumValue),
                condition: {
                    entityId: entity.entityId,
                    valueId: enumValue.enumValueId!,
                    condition: CLM.ConditionType.EQUAL,
                }
            }))

        return [enumEntityTag, ...conditionalTags]
    }

    return [{
        key: entity.entityId,
        name: entity.entityName,
        condition: null,
    }]
}

// Entities that can be chosen for required / blocking
const conditionalEntityTags = (entities: CLM.EntityBase[], actions: CLM.ActionBase[]): IConditionalTag[] => {
    // Might have duplicates since different actions can have same conditions
    const actionConditionTags = actions
        .map(a => [...a.requiredConditions, ...a.negativeConditions])
        .reduce((a, b) => [...a, ...b], [])
        .map(c => convertConditionToConditionalTag(c, entities))

    const entityTags = entities
        // Ignore resolvers and negative entities
        .filter(e => !e.doNotMemorize && !e.positiveId)
        // Convert each entity to condition tag
        .map(e => convertEntityToConditionalTags(e))
        .reduce((a, b) => [...a, ...b], [])

    const uniqueConditionTags = [
        ...entityTags,
        ...actionConditionTags,
    ].reduce<IConditionalTag[]>((conditions, condition) => {
        const isConditionDuplicate = conditions.some(c => c.key === condition.key)
        if (!isConditionDuplicate) {
            conditions.push(condition)
        }

        return conditions
    }, [])

    return uniqueConditionTags
}

// Entities that can be picked as expected entity
const availableExpectedEntityTags = (entities: CLM.EntityBase[]): OF.ITag[] => {
    // Must be LUIS entity and not the negative
    return entities
        .filter(e => e.entityType === CLM.EntityType.LUIS && !e.positiveId)
        .map(e => convertEntityToConditionalTags(e))
        .reduce((a, b) => [...a, ...b], [])
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
    const fText = (filterText.startsWith(ActionPayloadEditor.triggerCharacter) ? filterText.substring(1) : filterText).trim()

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

const createSlateValue = (content: object | string, options: ActionPayloadEditor.IOption[]): ActionPayloadEditor.SlateValue => {
    let objectContent: object | null = null
    if (typeof content === 'string') {
        // If string does not starts with { assume it's the old simple string based payload and user will have to manually load and re-save
        // Otherwise, treat as json as load the json representation of the editor which has fully saved entities and doesn't need manual reconstruction
        if (!content.startsWith('{')) {
            console.warn(`You created slate value from basic string: ${content} which may have had entities that are not detected. Please update the payload to fix and re-save.`)
            return Plain.deserialize(content)
        }

        objectContent = JSON.parse(content) as object
    }

    const updatedJson = ActionPayloadEditor.Utilities.updateOptionNames(objectContent || content, options)
    return Value.fromJSON(updatedJson)
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

const actionTypeOptions = (Object.values(CLM.ActionTypes) as string[])
    .map<OF.IDropdownOption>(actionTypeString => {
        return {
            key: actionTypeString,
            text: actionTypeString === CLM.ActionTypes.API_LOCAL
                // TODO: Change to "Code" action
                ? "API"
                : actionTypeString
        }
    })

interface ModelOption extends OF.IDropdownOption {
    data: CLM.AppBase
}

const convertModelToDropdownOption = (model: CLM.AppBase): ModelOption =>
    ({
        key: model.appId,
        text: model.appName,
        data: model,
    })

type SlateValueMap = { [slot: string]: ActionPayloadEditor.SlateValue }



interface ComponentState {
    entityOptions: OF.IDropdownOption[]
    enumValueOptions: OF.IDropdownOption[]
    apiOptions: OF.IDropdownOption[]
    renderOptions: OF.IDropdownOption[]
    cardOptions: OF.IDropdownOption[]
    modelOptions: ModelOption[]
    conditionCreatorType: "required" | "disqualified"
    selectedEntityOptionKey: string | undefined
    selectedEnumValueOptionKey: string | undefined
    selectedApiOptionKey: string | number | undefined
    selectedRenderOptionKey: string | number | undefined
    selectedCardOptionKey: string | number | undefined
    selectedModelOptionKey: string | number | undefined
    hasPendingChanges: boolean
    initialEditState: ComponentState | null
    isEditing: boolean
    isEntityEditorModalOpen: boolean
    isCardViewerModalOpen: boolean
    isConditionCreatorModalOpen: boolean
    isConfirmDeleteModalOpen: boolean
    isConfirmDeleteInUseModalOpen: boolean
    isConfirmEditModalOpen: boolean
    isConfirmDuplicateActionModalOpen: boolean
    validationWarnings: string[]
    isPayloadFocused: boolean
    isPayloadMissing: boolean
    entityWarning: boolean
    newOrEditedAction: CLM.ActionBase | null
    selectedActionTypeOptionKey: string | number
    availableExpectedEntityTags: OF.ITag[]
    availableConditionalTags: OF.ITag[]
    expectedEntityTags: OF.ITag[]
    requiredEntityTagsFromPayload: OF.ITag[]
    requiredConditionTags: IConditionalTag[]
    negativeConditionTags: IConditionalTag[]
    slateValuesMap: SlateValueMap
    secondarySlateValuesMap: SlateValueMap
    isTerminal: boolean
    reprompt: boolean
    isEntryNode: boolean
    selectedCardIndex: number
}

const initialState: Readonly<ComponentState> = {
    entityOptions: [],
    enumValueOptions: [],
    apiOptions: [],
    renderOptions: [],
    cardOptions: [],
    modelOptions: [],
    conditionCreatorType: "required",
    selectedEntityOptionKey: undefined,
    selectedEnumValueOptionKey: undefined,
    selectedApiOptionKey: undefined,
    selectedRenderOptionKey: undefined,
    selectedCardOptionKey: undefined,
    selectedModelOptionKey: undefined,
    hasPendingChanges: false,
    initialEditState: null,
    isEditing: false,
    isEntityEditorModalOpen: false,
    isCardViewerModalOpen: false,
    isConditionCreatorModalOpen: false,
    isConfirmDeleteModalOpen: false,
    isConfirmDeleteInUseModalOpen: false,
    isConfirmEditModalOpen: false,
    isConfirmDuplicateActionModalOpen: false,
    validationWarnings: [],
    isPayloadFocused: false,
    isPayloadMissing: true,
    entityWarning: false,
    newOrEditedAction: null,
    selectedActionTypeOptionKey: actionTypeOptions[0].key,
    availableExpectedEntityTags: [],
    availableConditionalTags: [],
    expectedEntityTags: [],
    requiredEntityTagsFromPayload: [],
    requiredConditionTags: [],
    negativeConditionTags: [],
    slateValuesMap: {
        [TEXT_SLOT]: Plain.deserialize('')
    },
    secondarySlateValuesMap: {},
    isTerminal: true,
    reprompt: false,
    isEntryNode: false,
    selectedCardIndex: 0
}

class ActionCreatorEditor extends React.Component<Props, ComponentState> {
    state = initialState;

    constructor(props: Props) {
        super(props)
        this.state = this.initProps()
    }

    initProps(): ComponentState {
        const { actions, entities, botInfo } = this.props
        const apiOptions = botInfo.callbacks.map<OF.IDropdownOption>(convertCallbackToOption)
        const cardOptions = botInfo.templates.map<OF.IDropdownOption>(convertTemplateToOption)
        const modelOptions = this.props.models.map(convertModelToDropdownOption)
        const entityOptions = entities
            .filter(e => e.entityType === CLM.EntityType.ENUM)
            .map(e => convertEntityToDropdownOption(e))

        return {
            ...initialState,
            entityOptions,
            apiOptions,
            cardOptions,
            modelOptions,
            availableExpectedEntityTags: availableExpectedEntityTags(entities),
            availableConditionalTags: conditionalEntityTags(entities, actions).sort((a, b) => a.name.localeCompare(b.name)),
            isEditing: !!this.props.action
        }
    }

    async componentDidMount() {
        await this.initializeActionPresets(this.props)
    }

    async componentDidUpdate(prevProps: Props, prevState: ComponentState) {
        let newState: Partial<ComponentState> | undefined

        if (this.props.open === true) {

            // Reset state every time dialog was closed and is opened
            if (prevProps.open === false) {
                newState = this.initProps();
            }
            // Otherwise reset only if props have changed
            else {
                if (this.props.entities !== prevProps.entities) {
                    newState = {
                        ...newState,
                        availableExpectedEntityTags: availableExpectedEntityTags(this.props.entities),
                        availableConditionalTags: conditionalEntityTags(this.props.entities, this.props.actions).sort((a, b) => a.name.localeCompare(b.name)),
                    }
                }

                if (this.props.botInfo.callbacks !== prevProps.botInfo.callbacks) {
                    const { botInfo } = this.props
                    const apiOptions = botInfo.callbacks.map<OF.IDropdownOption>(convertCallbackToOption)
                    newState = {
                        ...newState,
                        apiOptions
                    }
                }

                if (this.props.botInfo.templates !== prevProps.botInfo.templates) {
                    const { botInfo } = this.props
                    const cardOptions = botInfo.templates.map<OF.IDropdownOption>(convertTemplateToOption)
                    newState = {
                        ...newState,
                        cardOptions
                    }
                }
            }

            // If we are given an action, set edit mode and apply properties
            if (this.props.action && this.props.action !== prevProps.action) {
                const action = this.props.action

                const payloadOptions = prevProps.entities.map(convertEntityToOption)
                const negativeConditionTags = convertEntityIdsToTags(action.negativeEntities, this.props.entities, false)
                const expectedEntityTags = convertEntityIdsToTags((action.suggestedEntity ? [action.suggestedEntity] : []), this.props.entities)
                let selectedApiOptionKey: string | undefined
                let selectedCardOptionKey: string | undefined
                let selectedModelOptionKey: string | undefined
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
                        const contentString: string = JSON.parse(textAction.payload).text
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
                    const callback = prevProps.botInfo.callbacks.find(t => t.name === selectedApiOptionKey)
                    if (callback) {
                        for (const actionArgumentName of callback.logicArguments) {
                            const argument = apiAction.logicArguments.find(a => a.parameter === actionArgumentName)
                            const initialValue = argument ? argument.value : ''
                            slateValuesMap[actionArgumentName] = tryCreateSlateValue(CLM.ActionTypes.API_LOCAL, actionArgumentName, initialValue, payloadOptions)
                        }
                        for (const actionArgumentName of callback.renderArguments) {
                            const argument = apiAction.renderArguments.find(a => a.parameter === actionArgumentName)
                            const initialValue = argument ? argument.value : ''
                            secondarySlateValuesMap[actionArgumentName] = tryCreateSlateValue(CLM.ActionTypes.API_LOCAL, actionArgumentName, initialValue, payloadOptions)
                        }
                    }

                }
                else if (action.actionType === CLM.ActionTypes.CARD) {
                    const cardAction = new CLM.CardAction(action)
                    selectedCardOptionKey = cardAction.templateName
                    const template = prevProps.botInfo.templates.find(t => t.name === selectedCardOptionKey)
                    if (template) {
                        // For each template variable initialize to the associated argument value or default to empty string
                        for (const cardTemplateVariable of template.variables) {
                            const argument = cardAction.arguments.find(a => a.parameter === cardTemplateVariable.key)
                            const initialValue = argument ? argument.value : ''
                            slateValuesMap[cardTemplateVariable.key] = tryCreateSlateValue(CLM.ActionTypes.CARD, cardTemplateVariable.key, initialValue, payloadOptions)
                        }
                    }
                }
                else if (action.actionType === CLM.ActionTypes.SET_ENTITY) {
                    const entity = prevProps.entities.find(e => e.entityId === action.entityId)
                    if (!entity) {
                        throw new Error(`The action references an entity by id: ${action.entityId} but it was not found.`)
                    }
                    if (entity.entityType !== CLM.EntityType.ENUM) {
                        throw new Error(`The action references entity: ${entity.entityName} but its type ${entity.entityType} was not ${CLM.EntityType.ENUM}.`)
                    }

                    if (!entity.enumValues) {
                        throw new Error(`The action references entity: ${entity.entityName} has no enum values.`)
                    }

                    const enumValueOptions = entity.enumValues.map(ev => convertEnumValueToDropdownOptions(ev))
                    newState = {
                        ...newState,
                        enumValueOptions,
                        selectedEntityOptionKey: action.entityId,
                        selectedEnumValueOptionKey: action.enumValueId,
                    }
                }
                else if (action.actionType === CLM.ActionTypes.DISPATCH) {
                    const dispatchAction = new CLM.DispatchAction(action)
                    selectedModelOptionKey = dispatchAction.modelId
                }
                else if (action.actionType === CLM.ActionTypes.CHANGE_MODEL) {
                    const changeModelAction = new CLM.ChangeModelAction(action)
                    selectedModelOptionKey = changeModelAction.modelId
                }

                const requiredEntityTagsFromPayload = Object.values(slateValuesMap)
                    .reduce<OF.ITag[]>((entities, value) => {
                        const newEntities = ActionPayloadEditor.Utilities.getNonOptionalEntitiesFromValue(value).map(convertOptionToTag)
                        // Only add new entities which are not already included from a previous payload
                        return [...entities, ...newEntities.filter(ne => !entities.some(e => e.key === ne.key))]
                    }, [])

                const requiredConditionTags = convertEntityIdsToTags(action.requiredEntities, this.props.entities, false)
                    .filter(t => !requiredEntityTagsFromPayload.some(tag => tag.key === t.key))

                if (action.requiredConditions) {
                    const tags = action.requiredConditions.map(c => convertConditionToConditionalTag(c, prevProps.entities))
                    requiredConditionTags.push(...tags)
                }

                if (action.negativeConditions) {
                    const tags = action.negativeConditions.map(c => convertConditionToConditionalTag(c, prevProps.entities))
                    negativeConditionTags.push(...tags)
                }

                newState = {
                    ...newState,
                    isPayloadMissing: action.actionType === CLM.ActionTypes.TEXT && action.payload.length === 0,
                    entityWarning,
                    selectedActionTypeOptionKey: action.actionType,
                    selectedApiOptionKey,
                    selectedCardOptionKey,
                    selectedModelOptionKey,
                    slateValuesMap,
                    secondarySlateValuesMap,
                    expectedEntityTags,
                    negativeConditionTags,
                    requiredEntityTagsFromPayload,
                    requiredConditionTags,
                    isTerminal: action.isTerminal,
                    reprompt: action.repromptActionId !== undefined,
                    isEntryNode: action.isEntryNode,
                    isEditing: true
                }

                newState.initialEditState = newState as ComponentState
            }

            if (newState) {
                // TODO: Find solution without casting, should be set state merge with partial state
                this.setState(newState as ComponentState)
            }
        }

        // Set initial text value (used for dummy import actions)
        if (this.props.open === true && prevProps.open === false) {
            await this.initializeActionPresets(this.props)
        }

        const initialEditState = this.state.initialEditState
        if (!initialEditState) {
            return
        }

        const isAnyPayloadChanged = this.areSlateValuesChanged(this.state.slateValuesMap, initialEditState.slateValuesMap)
            || this.areSlateValuesChanged(this.state.secondarySlateValuesMap, initialEditState.secondarySlateValuesMap)

        const expectedEntitiesChanged = !initialEditState || !this.areTagsIdentical(this.state.expectedEntityTags, initialEditState.expectedEntityTags)
        const requiredEntitiesChanged = !initialEditState || !this.areTagsIdentical(this.state.requiredConditionTags, initialEditState.requiredConditionTags)
        const disqualifyingEntitiesChanged = !initialEditState || !this.areTagsIdentical(this.state.negativeConditionTags, initialEditState.negativeConditionTags)

        const isTerminalChanged = initialEditState.isTerminal !== this.state.isTerminal
        const isRepromptChanged = initialEditState.reprompt !== this.state.reprompt
        const isEntryNodeChanged = initialEditState.isEntryNode !== this.state.isEntryNode
        const isSelectedApiChanged = initialEditState.selectedApiOptionKey !== this.state.selectedApiOptionKey
        const isSelectedCardChanged = initialEditState.selectedCardOptionKey !== this.state.selectedCardOptionKey
        const isSelectedModelChanged = initialEditState.selectedModelOptionKey !== this.state.selectedCardOptionKey

        const hasPendingChanges = isAnyPayloadChanged
            || isSelectedApiChanged
            || isSelectedCardChanged
            || expectedEntitiesChanged
            || requiredEntitiesChanged
            || disqualifyingEntitiesChanged
            || isTerminalChanged
            || isRepromptChanged
            || isEntryNodeChanged
            || isSelectedModelChanged

        if (prevState.hasPendingChanges !== hasPendingChanges) {
            this.setState({
                hasPendingChanges
            })
        }
    }

    async initializeActionPresets(props: Props) {
        if (props.importedAction) {
            let values = Plain.deserialize(DialogUtils.cleanText(props.importedAction.text))
            this.onChangePayloadEditor(values, TEXT_SLOT)
            await Util.setStateAsync(this, {
                isTerminal: props.importedAction.isTerminal,
                reprompt: props.importedAction.reprompt,
                isEntryNode: props.importedAction.isEntryNode
            })

            // If a good card match exists switch to card view
            const bestCard = this.bestCardMatch(props.importedAction)
            if (bestCard) {
                const actionTypeOption = actionTypeOptions.find(ao => ao.key === CLM.ActionTypes.CARD)
                await this.onChangeActionType(actionTypeOption)
            }
        }
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
                currentEntities: v ? ActionPayloadEditor.Utilities.getNonOptionalEntitiesFromValue(v) : [],
                prevEntities: prevValue ? ActionPayloadEditor.Utilities.getNonOptionalEntitiesFromValue(prevValue) : []
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

        const unattachedEntities: string[] = []
        primaryEntries.forEach(([k, v]) => {
            const text: string = v.document.text
            const tags = text.split(/[^0-9A-Za-z$-]/).filter(t => t.startsWith("$"))
            const entities = ActionPayloadEditor.Utilities.getAllEntitiesFromValue(v)
                .map(e => `$${e.name}`)
            tags.forEach(tag => {
                if (!entities.find(e => e === tag)) {
                    unattachedEntities.push(tag)
                }
            })
        })

        secondaryEntries.forEach(([k, v]) => {
            const text: string = v.document.text
            const tags = text.split(" ").filter(t => t.startsWith("$"))
            const entities = ActionPayloadEditor.Utilities.getAllEntitiesFromValue(v)
                .map(e => `$${e.name}`)
            tags.forEach(tag => {
                if (!entities.find(e => e === tag)) {
                    unattachedEntities.push(tag)
                }
            })
        })
        return unattachedEntities
    }

    @autobind
    onChangeWaitCheckbox() {
        this.setState(prevState => ({
            isTerminal: !prevState.isTerminal
        }))
    }

    @autobind
    onChangeRepromptCheckbox() {
        this.setState(prevState => ({
            reprompt: !prevState.reprompt
        }))
    }

    @autobind
    onChangeIsEntryNodeCheckbox() {
        this.setState(prevState => ({
            isEntryNode: !prevState.isEntryNode
        }))
    }

    @autobind
    onChangeModelType(event: React.FormEvent<HTMLDivElement>, option?: OF.IDropdownOption | undefined) {
        if (!option) {
            return
        }

        this.setState({
            selectedModelOptionKey: option.key,
        })
    }

    onChangeEntityOption = (event: React.FormEvent<HTMLDivElement>, entityOption: OF.IDropdownOption) => {
        const entity = this.props.entities.find(e => e.entityId === entityOption.key)

        if (entity && entity.enumValues) {
            const enumValueOptions = entity.enumValues.map(ev => convertEnumValueToDropdownOptions(ev))

            this.setState({
                selectedEntityOptionKey: typeof entityOption.key === 'string'
                    ? entityOption.key
                    : undefined,
                enumValueOptions
            })
        }
    }

    onChangeEnumValueOption = (event: React.FormEvent<HTMLDivElement>, enumValueOption: OF.IDropdownOption) => {
        this.setState({
            selectedEnumValueOptionKey: typeof enumValueOption.key === 'string'
                ? enumValueOption.key
                : undefined,
        })
    }

    onChangeApiOption = (event: React.FormEvent<HTMLDivElement>, apiOption: OF.IDropdownOption) => {
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

    @autobind
    async onChangeCardOption(cardOption: OF.IDropdownOption | undefined) {
        if (!cardOption) {
            return
        }

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

        await Util.setStateAsync(this, {
            selectedCardOptionKey: cardOption.key,
            slateValuesMap: newSlateValues
        })

        if (this.props.importedAction) {
            if (template.variables.length > 0) {
                const semiSplit = DialogUtils.cleanText(this.props.importedAction.text).split(';')

                // TEMP CCI parsing to extract title
                // Assume first value is question followed by first button
                let firstSplit = semiSplit[0].split('?')
                // If no question mark, assume is first period
                if (firstSplit.length === 1) {
                    firstSplit = semiSplit[0].split('.')
                }
                const rawTitle = firstSplit.slice(0, firstSplit.length - 1).join()

                const title = Plain.deserialize(`${rawTitle}?`)
                this.onChangePayloadEditor(title, template.variables[0].key)

                let buttons: any[]
                if (this.props.importedAction.buttons.length > 0) {
                    buttons = this.props.importedAction.buttons.map(t => Plain.deserialize(t))

                }
                else {
                    // TEMP CCI button extraction
                    // Gather button text
                    let rawButtons: string[]
                    if (firstSplit[1]) {
                        rawButtons = [firstSplit[firstSplit.length - 1], ...semiSplit.slice(1, semiSplit.length)]
                    }
                    else {
                        rawButtons = semiSplit.slice(1, semiSplit.length)
                    }
                    buttons = rawButtons.map(t => Plain.deserialize(t))
                }
                if (buttons) {
                    buttons.forEach((button, index) => {
                        if ((index + 1) < template.variables.length) {
                            this.onChangePayloadEditor(button, template.variables[index + 1].key)
                        }
                    })
                }
            }
        }
    }

    onClickSyncBotInfo() {
        this.props.fetchBotInfoThunkAsync(this.props.browserId, this.props.app.appId)
    }

    async onClickViewCard() {
        if (!this.state.selectedCardOptionKey) {
            await this.onNextCard()
        }
        this.setState({
            isCardViewerModalOpen: true
        })
    }

    onCloseCardViewer = () => {
        this.setState({
            isCardViewerModalOpen: false
        })
    }

    @autobind
    async onNextCard() {
        let selectedCardIndex = this.state.cardOptions.findIndex(cd => cd.key === this.state.selectedCardOptionKey)
        selectedCardIndex = selectedCardIndex + 1
        if (selectedCardIndex === this.state.cardOptions.length) {
            selectedCardIndex = 0
        }
        this.setState({ selectedCardIndex })
        await this.onChangeCardOption(this.state.cardOptions[selectedCardIndex])
    }

    @autobind
    async onPreviousCard() {
        let selectedCardIndex = this.state.cardOptions.findIndex(cd => cd.key === this.state.selectedCardOptionKey)
        selectedCardIndex = selectedCardIndex - 1
        if (selectedCardIndex < 0) {
            selectedCardIndex = this.state.cardOptions.length - 1
        }
        this.setState({ selectedCardIndex })
        await this.onChangeCardOption(this.state.cardOptions[selectedCardIndex])
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
            case CLM.ActionTypes.SET_ENTITY:
                // TODO: Fix types with discriminated unions
                // If action being saved is set entity action, entityId and enumValueId should be defined
                const entityId = this.state.selectedEntityOptionKey!
                const enumValueId = this.state.selectedEnumValueOptionKey!
                const setEntityPayload: CLM.SetEntityPayload = {
                    entityId,
                    enumValueId,
                }
                payload = JSON.stringify(setEntityPayload)
                break;
            case CLM.ActionTypes.CHANGE_MODEL: {
                const model = this.props.models.find(m => m.appId === this.state.selectedModelOptionKey)
                if (!model) {
                    throw new Error(`Could not construct payload for ${CLM.ActionTypes.CHANGE_MODEL}. Model id ${this.state.selectedModelOptionKey} did not match any available models.`)
                }

                // TODO: Rename to ModelPayload?
                const modelPayload: CLM.ModelPayload = {
                    modelId: model.appId,
                    modelName: model.appName,
                }

                payload = JSON.stringify(modelPayload)
                break;
            }
            default:
                throw new Error(`When attempting to submit action, the selected action type: ${this.state.selectedActionTypeOptionKey} did not have matching type`)
        }

        const requiredTags = this.state.requiredConditionTags.filter(t => !t.condition)
        const negativeTags = this.state.negativeConditionTags.filter(t => !t.condition)
        const requiredConditions = this.state.requiredConditionTags.filter(t => t.condition).map(t => t.condition!)
        const negativeConditions = this.state.negativeConditionTags.filter(t => t.condition).map(t => t.condition!)

        // TODO: This should be new type such as ActionInput for creation only.
        const action = new CLM.ActionBase({
            actionId: null!,
            payload,
            createdDateTime: new Date().toJSON(),
            isTerminal: this.state.isTerminal,
            repromptActionId: this.state.reprompt ? REPROMPT_SELF : undefined,
            requiredEntitiesFromPayload: this.state.requiredEntityTagsFromPayload.map<string>(tag => tag.key),
            requiredEntities: [...this.state.requiredEntityTagsFromPayload, ...requiredTags].map<string>(tag => tag.key),
            negativeEntities: negativeTags.map<string>(tag => tag.key),
            requiredConditions,
            negativeConditions,
            suggestedEntity: (this.state.expectedEntityTags.length > 0)
                ? this.state.expectedEntityTags[0].key
                : undefined,
            version: 0,
            packageCreationId: 0,
            packageDeletionId: 0,
            actionType: CLM.ActionTypes[this.state.selectedActionTypeOptionKey],
            entityId: this.state.selectedEntityOptionKey,
            isEntryNode: this.state.isEntryNode,
            enumValueId: this.state.selectedEnumValueOptionKey,
            clientData: this.props.action
                ? this.props.action.clientData
                : { actionHashes: [] }
        })

        if (this.state.isEditing && this.props.action) {
            action.actionId = this.props.action.actionId
        }
        return action
    }

    @autobind
    async onClickSaveCreate() {
        const newOrEditedAction = this.convertStateToModel()
        const validationWarnings: string[] = []

        if (!Util.isActionUnique(newOrEditedAction, this.props.actions)) {
            this.setState({
                isConfirmDuplicateActionModalOpen: true,
                validationWarnings: [Util.formatMessageId(this.props.intl, FM.ACTIONCREATOREDITOR_WARNING_DUPLICATEFOUND)],
                newOrEditedAction,
            })

            return
        }

        // Otherwise need to validate changes
        try {

            // If editing look for training dialog invalidations
            if (this.state.isEditing) {
                const invalidTrainingDialogIds = await ((this.props.fetchActionEditValidationThunkAsync(this.props.app.appId, this.props.editingPackageId, newOrEditedAction) as any) as Promise<string[]>)
                if (invalidTrainingDialogIds) {
                    if (invalidTrainingDialogIds.length > 0) {
                        validationWarnings.push(Util.formatMessageId(this.props.intl, FM.ACTIONCREATOREDITOR_CONFIRM_EDIT_WARNING))
                    }
                }
            }

            // Note any untagged entities
            const untaggedEntities = this.untaggedEntities()
            untaggedEntities.forEach(e =>
                validationWarnings.push(`"${e}" ${Util.formatMessageId(this.props.intl, FM.ACTIONCREATOREDITOR_CONFIRM_MISSINGLABEL_WARNING)}`)
            )

            if (validationWarnings.length > 0) {
                this.setState({
                    isConfirmEditModalOpen: true,
                    validationWarnings,
                    newOrEditedAction,
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

    @autobind
    onClickCancel() {
        this.props.handleClose()
    }

    @autobind
    async onClickDelete() {
        if (!this.props.action) {
            return
        }

        try {
            const invalidTrainingDialogIds = await ((this.props.fetchActionDeleteValidationThunkAsync(this.props.app.appId, this.props.editingPackageId, this.props.action.actionId) as any) as Promise<string[]>)
            if (invalidTrainingDialogIds && invalidTrainingDialogIds.length > 0) {
                const validationWarnings = [Util.formatMessageId(this.props.intl, FM.ACTIONCREATOREDITOR_CONFIRM_DELETE_WARNING)]

                this.setState({
                    isConfirmDeleteInUseModalOpen: true,
                    validationWarnings,
                });
            }
            else {
                this.setState({
                    isConfirmDeleteModalOpen: true,
                    validationWarnings: [],
                });
            }
        }
        catch (e) {
            const error = e as Error
            console.warn(`Error when attempting to validate delete: `, error)
        }
    }

    @autobind
    onClickCreateConditionCreator(condition: CLM.Condition) {
        const conditionalTag = convertConditionToConditionalTag(condition, this.props.entities)

        if (this.state.conditionCreatorType === "required") {
            const isUnique = !this.state.requiredConditionTags
                .filter(ct => ct.condition)
                // condition guaranteed to exist based on filter above
                .some(ct => isConditionEqual(ct.condition!, condition))

            if (isUnique) {
                this.setState(prevState => ({
                    requiredConditionTags: [...prevState.requiredConditionTags, conditionalTag],
                }))
            }
        }
        else if (this.state.conditionCreatorType === "disqualified") {
            const isUnique = !this.state.negativeConditionTags
                .filter(ct => ct.condition)
                // condition guaranteed to exist based on filter above
                .some(ct => isConditionEqual(ct.condition!, condition))

            if (isUnique) {
                this.setState(prevState => ({
                    negativeConditionTags: [...prevState.negativeConditionTags, conditionalTag],
                }))
            }
        }

        this.setState({
            isConditionCreatorModalOpen: false,
        })
    }

    @autobind
    onClickCancelConditionCreator() {
        this.setState({
            isConditionCreatorModalOpen: false,
        })
    }

    @autobind
    onCancelDeleteInUse() {
        this.setState({
            isConfirmDeleteInUseModalOpen: false,
        })
    }

    @autobind
    onCancelDelete() {
        this.setState({
            isConfirmDeleteModalOpen: false,
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
    onCancelDuplicate() {
        this.setState({
            isConfirmDuplicateActionModalOpen: false,
            newOrEditedAction: null
        })
    }

    @autobind
    onConfirmEdit() {
        if (!this.state.newOrEditedAction) {
            console.warn(`You clicked to confirm edit, but there is no action to save`)
            return
        }

        const validationWarnings = [...this.state.validationWarnings]
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

    @autobind
    onConfirmDelete(option: boolean) {
        if (!this.props.action) {
            console.warn(`You clicked to confirm deletion, but there is no action to delete`)
            return
        }

        this.props.handleDelete(this.props.action, option)
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

    @autobind
    async onChangeActionType(actionTypeOption: OF.IDropdownOption | undefined) {
        if (!actionTypeOption) {
            return
        }

        const textPayload = this.state.slateValuesMap[TEXT_SLOT]
        const isPayloadMissing = (actionTypeOption.key === CLM.ActionTypes.TEXT && textPayload && textPayload.document.text.length === 0)
        const isTerminal = [CLM.ActionTypes.END_SESSION, CLM.ActionTypes.DISPATCH, CLM.ActionTypes.CHANGE_MODEL].includes(actionTypeOption.key as CLM.ActionTypes)
            ? true
            : actionTypeOption.key === CLM.ActionTypes.SET_ENTITY
                ? false
                : this.state.isTerminal

        // Reprompt and Entry node only allowed on CARD and TEXT actions
        const reprompt = (actionTypeOption.key === CLM.ActionTypes.CARD || actionTypeOption.key === CLM.ActionTypes.TEXT)
            ? this.state.reprompt
            : false
        const isEntryNode = (actionTypeOption.key === CLM.ActionTypes.CARD || actionTypeOption.key === CLM.ActionTypes.TEXT)
            ? this.state.isEntryNode
            : false

        await Util.setStateAsync(this, {
            isPayloadMissing,
            isTerminal,
            reprompt,
            isEntryNode,
            selectedActionTypeOptionKey: actionTypeOption.key,
            selectedEntityOptionKey: undefined,
            selectedEnumValueOptionKey: undefined,
            selectedApiOptionKey: undefined,
            selectedCardOptionKey: undefined,
            slateValuesMap: {
                [TEXT_SLOT]: Plain.deserialize('')
            },
            secondarySlateValuesMap: {},
            expectedEntityTags: [],
            requiredEntityTagsFromPayload: [],
            requiredConditionTags: [],
            negativeConditionTags: [],
        })

        // If have preset text, pick the best matching card
        if (this.state.selectedActionTypeOptionKey === CLM.ActionTypes.CARD && this.props.importedAction) {
            const bestCard = this.bestCardMatch(this.props.importedAction)
            if (bestCard) {
                await this.onChangeCardOption(bestCard)
            }
        }
    }

    // Return card that best matches the given text
    bestCardMatch(importedAction: ImportedAction): OF.IDropdownOption | null {
        const template = DialogUtils.bestTemplateMatch(importedAction, this.props.botInfo.templates)
        if (template) {
            return convertTemplateToOption(template)
        }
        return null
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
            [...selectedTags, ...this.state.requiredEntityTagsFromPayload, ...this.state.requiredConditionTags]
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
            negativeConditionTags: (!newExpectedEntityTag || prevState.negativeConditionTags.some(tag => tag.key === newExpectedEntityTag.key))
                ? prevState.negativeConditionTags
                : [...prevState.negativeConditionTags, newExpectedEntityTag]
        }))
    }

    onResolveRequiredConditionTags = (filterText: string, selectedTags: OF.ITag[]): OF.ITag[] => {
        const suggestedTags = getSuggestedTags(
            filterText,
            this.state.availableConditionalTags,
            [...selectedTags, ...this.state.requiredEntityTagsFromPayload, ...this.state.negativeConditionTags, ...this.state.expectedEntityTags],
            this.state.requiredConditionTags
        )

        return [
            addConditionPlaceholder,
            ...suggestedTags,
        ]
    }

    onChangeRequiredConditionTags = (tags: IConditionalTag[]) => {
        const containsAddConditionPlaceholder = tags.some(t => t.key === addConditionPlaceholder.key)
        // Assume if list has this item the user clicked the suggestion and intends to add condition
        if (containsAddConditionPlaceholder) {
            this.setState({
                isConditionCreatorModalOpen: true,
                conditionCreatorType: "required",
            })
            return
        }

        this.setState({
            requiredConditionTags: tags
        })
    }

    onRenderRequiredConditionTag = (props: ICLPickerItemProps<OF.ITag>): JSX.Element => {
        const renderProps = { ...props }
        const locked = this.state.requiredEntityTagsFromPayload.some(t => t.key === props.key)

        // Strike-out and lock/highlight if also the suggested entity
        renderProps.strike = false
        renderProps.locked = locked
        renderProps.highlight = locked

        return <CLTagItem key={props.index} {...renderProps}>{props.item.name}</CLTagItem>
    }

    @autobind
    onRenderConditionSuggestion(tag: OF.ITag, itemProps: OF.ISuggestionItemProps<OF.ITag>): JSX.Element {
        return tag.key === addConditionPlaceholder.key
            ? addConditionPlaceholderButton
            : <TagItemSuggestion>{tag.name}</TagItemSuggestion>
    }

    onResolveNegativeConditionTags = (filterText: string, selectedTags: OF.ITag[]): OF.ITag[] => {
        const suggestedTags = getSuggestedTags(
            filterText,
            this.state.availableConditionalTags,
            [...selectedTags, ...this.state.requiredEntityTagsFromPayload, ...this.state.requiredConditionTags]
        )

        return [
            addConditionPlaceholder,
            ...suggestedTags,
        ]
    }

    onChangeNegativeConditionTags = (tags: IConditionalTag[]) => {
        const containsAddConditionPlaceholder = tags.some(t => t.key === addConditionPlaceholder.key)
        // Assume if list has this item the user clicked the suggestion and intends to add condition
        if (containsAddConditionPlaceholder) {
            this.setState({
                isConditionCreatorModalOpen: true,
                conditionCreatorType: "disqualified",
            })
            return
        }

        this.setState({
            negativeConditionTags: tags
        })
    }

    onRenderNegativeConditionTag = (props: ICLPickerItemProps<OF.ITag>): JSX.Element => {
        const renderProps = { ...props }
        const suggestedEntityKey = this.state.expectedEntityTags.length > 0 ? this.state.expectedEntityTags[0].key : null

        renderProps.strike = true
        // If negative entity is also the suggested entity lock/highlight
        renderProps.locked = false
        renderProps.highlight = suggestedEntityKey === props.key

        return <CLTagItem key={props.index} {...renderProps}>{props.item.name}</CLTagItem>
    }

    onDismissPicker(event: any, selectedItem?: OF.ITag | undefined) {
        if (event && typeof event.preventDefault === "function") {
            event.preventDefault()
        }
    }

    // Payload editor is trying to submit action
    async onSubmitPayloadEditor(): Promise<void> {
        if (!this.saveDisabled()) {
            await this.onClickSaveCreate();
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
        const requiredConditionTags = this.state.requiredConditionTags.filter(tag => !requiredEntityTagsFromPayload.some(t => t.key === tag.key))

        const isPayloadMissing = (this.state.selectedActionTypeOptionKey === CLM.ActionTypes.TEXT && value.document.text.length === 0)

        const nextState: Partial<ComponentState> = {
            entityWarning: false,
            isPayloadMissing,
            requiredEntityTagsFromPayload,
            requiredConditionTags,
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
            case CLM.ActionTypes.SET_ENTITY:
                return this.state.selectedEntityOptionKey === undefined
                    || this.state.selectedEnumValueOptionKey === undefined
            case CLM.ActionTypes.CHANGE_MODEL:
                return this.state.selectedModelOptionKey === undefined
            default:
                return false
        }
    }

    saveDisabled(): boolean {
        // If editing
        if (this.props.action) {
            const actionType = this.props.action.actionType
            if (actionType === CLM.ActionTypes.SET_ENTITY
                || actionType === CLM.ActionTypes.DISPATCH) {
                return true
            }
        }
        // If creating
        else {
            const actionType = this.state.selectedActionTypeOptionKey as CLM.ActionTypes
            if (actionType === CLM.ActionTypes.DISPATCH) {
                return true
            }
        }

        return this.areInputsInvalid()
            || (this.state.isEditing && !this.state.hasPendingChanges)
            || (!this.state.isTerminal && (this.state.expectedEntityTags.length > 0))
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
        const tdString = JSON.stringify(this.props.trainDialogs)
        return tdString.indexOf(this.props.action.actionId) > -1
    }

    @autobind
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
            ? Util.formatMessageId(intl, FM.ACTIONCREATOREDITOR_WARNING_ENTITY)
            : this.state.isPayloadMissing
                ? Util.formatMessageId(intl, FM.ACTIONCREATOREDITOR_WARNING_PAYLOAD) : null

        // Disable payload if we're editing existing action and no API or CARD data available
        const isPayloadDisabled =
            (this.state.selectedActionTypeOptionKey === CLM.ActionTypes.API_LOCAL
                && (this.state.apiOptions.length === 0))
            || (this.state.selectedActionTypeOptionKey === CLM.ActionTypes.CARD
                && (this.state.cardOptions.length === 0));

        // Available Mentions: All entities - expected entity - required entities from payload - disqualified entities
        const unavailableTags = [...this.state.expectedEntityTags, ...this.state.negativeConditionTags]
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

        const uniqueConditions = getUniqueConditions(this.props.actions)
        return (
            <OF.Modal
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
                            onChange={(event, actionTypeOption) => this.onChangeActionType(actionTypeOption)}
                            selectedKey={this.state.selectedActionTypeOptionKey}
                            disabled={disabled}
                            tipType={ToolTip.TipType.ACTION_TYPE}
                        />

                        {this.state.selectedActionTypeOptionKey === CLM.ActionTypes.DISPATCH
                            && <div data-testid="action-dispatch-warning" className="cl-text--warning">
                                <OF.Icon iconName="Warning" className="cl-icon" /> Warning:&nbsp;
                                <span>{Util.formatMessageId(intl, FM.ACTIONCREATOREDITOR_WARNING_DISPATCH_EDIT, { actionType: CLM.ActionTypes.DISPATCH })}</span>
                            </div>}

                        {this.state.selectedActionTypeOptionKey === CLM.ActionTypes.SET_ENTITY
                            && <div data-testid="action-set-entity-warning" className="cl-text--warning">
                                <OF.Icon iconName="Warning" className="cl-icon" /> Warning:&nbsp;
                                {this.state.isEditing
                                    ? <span>{Util.formatMessageId(intl, FM.ACTIONCREATOREDITOR_WARNING_SET_ENTITY_EDIT, { actionType: CLM.ActionTypes.SET_ENTITY })}</span>
                                    : <span>{Util.formatMessageId(intl, FM.ACTIONCREATOREDITOR_WARNING_SET_ENTITY_CREATION)} </span>}
                            </div>}

                        {this.state.selectedActionTypeOptionKey === CLM.ActionTypes.API_LOCAL
                            && <div>
                                <div className="cl-inputWithButton-input">
                                    <TC.Dropdown
                                        data-testid="dropdown-api-option"
                                        label="API"
                                        options={this.state.apiOptions}
                                        onChange={this.onChangeApiOption}
                                        selectedKey={this.state.selectedApiOptionKey}
                                        disabled={this.state.apiOptions.length === 0}
                                        placeholder={this.state.apiOptions.length === 0 ? 'NONE DEFINED' : 'API name...'}
                                        tipType={ToolTip.TipType.ACTION_API1}
                                    />
                                    <OF.IconButton
                                        className="ms-Button--primary cl-inputWithButton-button"
                                        onClick={() => this.onClickSyncBotInfo()}
                                        ariaDescription="Refresh"
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
                                                                        data-testid={`action-logic-argument-${apiArgument}`}
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
                                                                        data-testid={`action-render-argument-${apiArgument}`}
                                                                    />
                                                                </React.Fragment>
                                                            )
                                                        })}
                                                </div>}
                                        </div>
                                        : <div className="cl-errorpanel" data-testid="action-creator-editor-error-callback">
                                            <div>
                                                {this.props.action && CLM.ActionBase.isPlaceholderAPI(this.props.action)
                                                    ? `Placeholder API: ${this.state.selectedApiOptionKey}`
                                                    : `ERROR: Bot Missing Callback: ${this.state.selectedApiOptionKey}`}
                                            </div>
                                        </div>)
                                }
                            </div>
                        }

                        {this.state.selectedActionTypeOptionKey === CLM.ActionTypes.CARD
                            && <div>
                                <div className="cl-inputWithButton-input">
                                    <TC.Dropdown
                                        data-testid="action-card-template"
                                        label="Template"
                                        options={this.state.cardOptions}
                                        onChange={(event, cardOption) => this.onChangeCardOption(cardOption)}
                                        selectedKey={this.state.selectedCardOptionKey}
                                        disabled={this.state.cardOptions.length === 0}
                                        placeholder={this.state.cardOptions.length === 0 ? 'NONE DEFINED' : 'Template name...'}
                                        tipType={ToolTip.TipType.ACTION_CARD}
                                    />
                                    <OF.IconButton
                                        className="ms-Button--primary cl-inputWithButton-button"
                                        onClick={() => this.onClickViewCard()}
                                        ariaDescription="Refresh"
                                        iconProps={{ iconName: 'RedEye' }}
                                        disabled={this.state.cardOptions.length === 0}
                                    />
                                    <OF.IconButton
                                        className="ms-Button--primary cl-inputWithButton-button"
                                        onClick={() => this.onClickSyncBotInfo()}
                                        ariaDescription="Refresh"
                                        iconProps={{ iconName: 'Sync' }}
                                    />
                                </div>
                                {this.state.selectedCardOptionKey
                                    && (template
                                        ? template.variables
                                            .map(cardTemplateVariable => {
                                                return (
                                                    <React.Fragment key={cardTemplateVariable.key}>
                                                        <OF.Label className="cl-label">{cardTemplateVariable.key} <HelpIcon tipType={ToolTip.TipType.ACTION_CARD} /></OF.Label>
                                                        <ActionPayloadEditor.Editor
                                                            options={optionsAvailableForPayload}
                                                            value={this.state.slateValuesMap[cardTemplateVariable.key]}
                                                            placeholder={''}
                                                            onChange={eState => this.onChangePayloadEditor(eState, cardTemplateVariable.key)}
                                                            onSubmit={() => this.onSubmitPayloadEditor()}
                                                            disabled={isPayloadDisabled}
                                                            data-testid={`action-card-argument-${cardTemplateVariable.key}`}
                                                        />
                                                    </React.Fragment>
                                                )
                                            })
                                        : <div className="cl-errorpanel" data-testid="action-creator-editor-error-template">
                                            <div>ERROR: Bot Missing Template: {this.state.selectedCardOptionKey}</div>
                                        </div>)
                                }
                            </div>
                        }

                        {this.state.selectedActionTypeOptionKey === CLM.ActionTypes.TEXT
                            && (<div className={(payloadError ? 'editor--error' : '')}>
                                <div data-testid="action-text-response">
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
                                        data-testid="action-text-response-editor"
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
                                        data-testid={"action-end-session-editor"}
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

                        {this.state.selectedActionTypeOptionKey === CLM.ActionTypes.SET_ENTITY
                            && (
                                <>
                                    <div>
                                        <TC.Dropdown
                                            data-testid="action-set-entity"
                                            label="Entity"
                                            options={this.state.entityOptions}
                                            onChange={this.onChangeEntityOption}
                                            selectedKey={this.state.selectedEntityOptionKey}
                                            placeholder={this.state.entityOptions.length === 0 ? 'NONE DEFINED' : 'Entity name...'}
                                            disabled={this.state.entityOptions.length === 0}
                                            tipType={ToolTip.TipType.ACTION_SET_ENTITY}
                                        />
                                    </div>

                                    <div>
                                        <TC.Dropdown
                                            data-testid="action-set-enum"
                                            label="Enum Value"
                                            options={this.state.enumValueOptions}
                                            onChange={this.onChangeEnumValueOption}
                                            selectedKey={this.state.selectedEnumValueOptionKey}
                                            placeholder={this.state.enumValueOptions.length === 0 ? 'NONE DEFINED' : 'Enum value...'}
                                            disabled={!this.state.selectedEntityOptionKey}
                                            tipType={ToolTip.TipType.ACTION_SET_ENTITY_VALUE}
                                        />
                                    </div>
                                </>
                            )}

                        {(this.state.selectedActionTypeOptionKey === CLM.ActionTypes.DISPATCH
                            || this.state.selectedActionTypeOptionKey === CLM.ActionTypes.CHANGE_MODEL)
                            && <TC.Dropdown
                                data-testid="action-creator-dropdown-model-name"
                                label="Model"
                                options={this.state.modelOptions.filter(mo => mo.data.appId !== this.props.app.appId)}
                                onChange={this.onChangeModelType}
                                selectedKey={this.state.selectedModelOptionKey}
                                tipType={ToolTip.TipType.ACTION_CHANGE_MODEL}
                                disabled={this.state.selectedActionTypeOptionKey === CLM.ActionTypes.DISPATCH}
                            />}

                        {this.state.selectedActionTypeOptionKey !== CLM.ActionTypes.CARD
                            && this.state.selectedActionTypeOptionKey !== CLM.ActionTypes.END_SESSION
                            && this.state.selectedActionTypeOptionKey !== CLM.ActionTypes.SET_ENTITY
                            && this.state.selectedActionTypeOptionKey !== CLM.ActionTypes.DISPATCH
                            && this.state.selectedActionTypeOptionKey !== CLM.ActionTypes.CHANGE_MODEL
                            && (<div className="cl-action-creator--expected-entity">
                                <TC.TagPicker
                                    data-testid="action-expected-entity"
                                    label="Expected Entity in User reply..."
                                    onResolveSuggestions={this.onResolveExpectedEntityTags}
                                    onRenderItem={this.onRenderExpectedTag}
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

                        {this.state.selectedActionTypeOptionKey !== CLM.ActionTypes.DISPATCH
                            && <>
                                <div className="cl-action-creator--required-entities">
                                    <CLTagPicker
                                        data-testid="action-required-entities"
                                        nonRemovableTags={this.state.requiredEntityTagsFromPayload}
                                        nonRemoveableStrikethrough={false}
                                        label="Required Conditions"
                                        onResolveSuggestions={this.onResolveRequiredConditionTags}
                                        onRenderItem={this.onRenderRequiredConditionTag}
                                        onRenderSuggestionsItem={this.onRenderConditionSuggestion}
                                        onChange={this.onChangeRequiredConditionTags}
                                        pickerSuggestionsProps={
                                            {
                                                suggestionsHeaderText: 'Conditions',
                                                noResultsFoundText: 'No Conditions Found'
                                            }
                                        }
                                        selectedItems={this.state.requiredConditionTags}
                                        tipType={ToolTip.TipType.ACTION_REQUIRED}
                                    />
                                </div>

                                <div className="cl-action-creator--disqualifying-entities">
                                    <TC.TagPicker
                                        data-testid="action-disqualifying-entities"
                                        label="Disqualifying Conditions"
                                        onResolveSuggestions={this.onResolveNegativeConditionTags}
                                        onRenderItem={this.onRenderNegativeConditionTag}
                                        onRenderSuggestionsItem={this.onRenderConditionSuggestion}
                                        onChange={this.onChangeNegativeConditionTags}
                                        pickerSuggestionsProps={
                                            {
                                                suggestionsHeaderText: 'Conditions',
                                                noResultsFoundText: 'No Conditions Found'
                                            }
                                        }
                                        selectedItems={this.state.negativeConditionTags}
                                        tipType={ToolTip.TipType.ACTION_NEGATIVE}
                                    />
                                </div>
                            </>}

                        <div>
                            <OF.Label>Options</OF.Label>
                            <TC.Checkbox
                                data-testid="action-creator-wait-checkbox"
                                label={Util.formatMessageId(intl, FM.ACTIONCREATOREDITOR_CHECKBOX_TERMINAL_LABEL)}
                                checked={this.state.isTerminal}
                                onChange={this.onChangeWaitCheckbox}

                                disabled={this.state.reprompt || [CLM.ActionTypes.END_SESSION, CLM.ActionTypes.SET_ENTITY, CLM.ActionTypes.DISPATCH, CLM.ActionTypes.CHANGE_MODEL].includes(this.state.selectedActionTypeOptionKey as CLM.ActionTypes)}
                                tipType={ToolTip.TipType.ACTION_WAIT}
                            />
                        </div>

                        {this.state.selectedActionTypeOptionKey !== CLM.ActionTypes.CHANGE_MODEL
                            && <>
                                <TC.Checkbox
                                    data-testid="action-creator-reprompt-checkbox"
                                    label={Util.formatMessageId(intl, FM.ACTIONCREATOREDITOR_CHECKBOX_REPROMPT_LABEL)}
                                    checked={this.state.reprompt}
                                    onChange={this.onChangeRepromptCheckbox}
                                    disabled={!this.state.isTerminal || [CLM.ActionTypes.END_SESSION, CLM.ActionTypes.SET_ENTITY, CLM.ActionTypes.DISPATCH].includes(this.state.selectedActionTypeOptionKey as CLM.ActionTypes)}
                                    tipType={ToolTip.TipType.ACTION_REPROMPT}
                                />
                                {Util.isFeatureEnabled(this.props.settings.features, FeatureStrings.CCI) &&
                                    <TC.Checkbox
                                        data-testid="action-creator-entry-node-checkbox"
                                        label={Util.formatMessageId(intl, FM.ACTIONCREATOREDITOR_CHECKBOX_ENTRY_NODE_LABEL)}
                                        checked={this.state.isEntryNode}
                                        onChange={this.onChangeIsEntryNodeCheckbox}
                                        disabled={[CLM.ActionTypes.END_SESSION, CLM.ActionTypes.SET_ENTITY, CLM.ActionTypes.DISPATCH].includes(this.state.selectedActionTypeOptionKey as CLM.ActionTypes)}
                                        tipType={ToolTip.TipType.ACTION_IS_ENTRY_NODE}
                                    />
                                }
                                <div
                                    data-testid="action-warning-nowait-expected"
                                    className="cl-error-message-label"
                                    style={{ display: !this.state.isTerminal && this.state.expectedEntityTags.length ? "block" : "none", gridGap: "0" }}
                                >
                                    {Util.formatMessageId(intl, FM.ACTIONCREATOREDITOR_WARNING_NON_WAIT_HAS_EXPECTED_ENTITY)}
                                </div>
                            </>
                        }
                    </div>
                </div>

                <div className="cl-modal_footer cl-modal-buttons">
                    <div className="cl-modal-buttons_secondary">
                        {this.state.isEditing &&
                            <OF.DefaultButton
                                onClick={this.onClickTrainDialogs}
                                iconProps={{ iconName: 'QueryList' }}
                                ariaDescription={Util.formatMessageId(intl, FM.ACTIONCREATOREDITOR_TRAINDIALOGSBUTTON_ARIADESCRIPTION)}
                                text={Util.formatMessageId(intl, FM.ACTIONCREATOREDITOR_TRAINDIALOGSBUTTON_TEXT)}
                                data-testid="action-creator-editor-train-dialog-filter-button"
                            />
                        }
                        <OF.DefaultButton
                            data-testid="action-button-create-entity"
                            onClick={this.onClickCreateEntity}
                            ariaDescription={Util.formatMessageId(intl, FM.BUTTON_ENTITY)}
                            text={Util.formatMessageId(intl, FM.BUTTON_ENTITY)}
                            iconProps={{ iconName: 'CirclePlus' }}
                        />
                    </div>
                    <div className="cl-modal-buttons_primary">
                        <OF.PrimaryButton
                            data-testid="action-creator-create-button"
                            disabled={this.saveDisabled()}
                            onClick={this.onClickSaveCreate}
                            ariaDescription={this.state.isEditing ?
                                Util.formatMessageId(intl, FM.ACTIONCREATOREDITOR_SAVEBUTTON_ARIADESCRIPTION) :
                                Util.formatMessageId(intl, FM.BUTTON_CREATE)}
                            text={this.state.isEditing ?
                                Util.formatMessageId(intl, FM.ACTIONCREATOREDITOR_SAVEBUTTON_TEXT) :
                                Util.formatMessageId(intl, FM.BUTTON_CREATE)}
                            iconProps={{ iconName: 'Accept' }}
                        />

                        <OF.DefaultButton
                            data-testid="action-creator-cancel-button"
                            onClick={this.onClickCancel}
                            ariaDescription={Util.formatMessageId(intl, FM.ACTIONCREATOREDITOR_CANCELBUTTON_ARIADESCRIPTION)}
                            text={Util.formatMessageId(intl, FM.ACTIONCREATOREDITOR_CANCELBUTTON_TEXT)}
                            iconProps={{ iconName: 'Cancel' }}
                        />

                        {this.state.isEditing &&
                            <OF.DefaultButton
                                data-testid="action-creator-delete-button"
                                className="cl-button-delete"
                                onClick={this.onClickDelete}
                                ariaDescription={Util.formatMessageId(intl, FM.ACTIONCREATOREDITOR_DELETEBUTTON_ARIADESCRIPTION)}
                                text={Util.formatMessageId(intl, FM.ACTIONCREATOREDITOR_DELETEBUTTON_TEXT)}
                                iconProps={{ iconName: 'Delete' }}
                            />}
                    </div>
                </div>
                {/* If deleting action in use, used custom modal, otherwise use confirm cancel modal */}
                <ActionDeleteModal
                    open={this.state.isConfirmDeleteInUseModalOpen}
                    onCancel={this.onCancelDeleteInUse}
                    onConfirm={this.onConfirmDelete}
                    title={Util.formatMessageId(intl, FM.ACTIONCREATOREDITOR_CONFIRM_DELETE_TITLE)}
                    message={this.validationWarning}
                />
                <ConfirmCancelModal
                    open={this.state.isConfirmDeleteModalOpen}
                    onCancel={this.onCancelDelete}
                    onConfirm={this.onConfirmDelete}
                    title={Util.formatMessageId(intl, FM.ACTIONCREATOREDITOR_CONFIRM_DELETE_TITLE)}
                />
                <ConfirmCancelModal
                    open={this.state.isConfirmEditModalOpen}
                    onCancel={this.onCancelEdit}
                    onConfirm={this.onConfirmEdit}
                    title={Util.formatMessageId(intl, FM.ACTIONCREATOREDITOR_CONFIRM_EDIT_TITLE)}
                    message={this.validationWarning}
                />
                <ConfirmCancelModal
                    open={this.state.isConfirmDuplicateActionModalOpen}
                    onOk={this.onCancelDuplicate}
                    title={Util.formatMessageId(intl, FM.ACTIONCREATOREDITOR_WARNING_DUPLICATEACTION)}
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
                    curIndex={this.state.selectedCardIndex}
                    totalCards={this.state.cardOptions.length}
                    onDismiss={() => this.onCloseCardViewer()}
                    onNext={() => this.onNextCard()}
                    onPrevious={() => this.onPreviousCard()}
                    template={this.state.selectedCardOptionKey !== null
                        ? this.props.botInfo.templates.find(t => t.name === this.state.selectedCardOptionKey)
                        : undefined}
                    actionArguments={this.state.isCardViewerModalOpen
                        ? this.getRenderedActionArguments(this.state.slateValuesMap, this.props.entities)
                        : []}
                    hideUndefined={false}
                />
                <ConditionModal
                    entities={this.props.entities}
                    conditions={uniqueConditions}
                    isOpen={this.state.isConditionCreatorModalOpen}
                    onClickCreate={this.onClickCreateConditionCreator}
                    onClickCancel={this.onClickCancelConditionCreator}
                />
            </OF.Modal>
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
        models: state.apps.all,
        entities: state.entities,
        actions: state.actions,
        trainDialogs: state.trainDialogs,
        botInfo: state.bot.botInfo,
        browserId: state.bot.browserId,
        settings: state.settings
    }
}

export interface ReceiveProps {
    app: CLM.AppBase
    editingPackageId: string
    open: boolean
    action: CLM.ActionBase | null
    actions: CLM.ActionBase[]
    importedAction?: ImportedAction
    handleEdit: (action: CLM.ActionBase) => void
    handleClose: () => void
    handleDelete: (action: CLM.ActionBase, removeFromDialogs: boolean) => void
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceiveProps & InjectedIntlProps & RouteComponentProps<any>

export default connect<typeof stateProps, typeof dispatchProps, ReceiveProps>(mapStateToProps, mapDispatchToProps)(withRouter(injectIntl(ActionCreatorEditor)))