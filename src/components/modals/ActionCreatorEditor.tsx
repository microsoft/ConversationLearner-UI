import * as React from 'react'
import { Value } from 'slate'
import { returntypeof } from 'react-redux-typescript'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Plain from 'slate-plain-serializer'
import { fetchBotInfoAsync } from '../../actions/fetchActions'
import { Modal } from 'office-ui-fabric-react/lib/Modal'
import { ActionBase, ActionTypes, BlisAppBase, EntityBase, EntityType, RenderedActionArgument, TextAction, ApiAction, CardAction, IActionArgument } from 'blis-models'
import ConfirmDeleteModal from './ConfirmDeleteModal'
import EntityCreatorEditor from './EntityCreatorEditor'
import AdaptiveCardViewer from './AdaptiveCardViewer/AdaptiveCardViewer'
import * as ActionPayloadEditor from './ActionPayloadEditor'
import { State } from '../../types'
import * as ToolTip from '../ToolTips'
import * as TC from '../tipComponents/Components'
import * as OF from 'office-ui-fabric-react';
import { BlisTagItem, IBlisPickerItemProps } from './BlisTagItem'
import BlisTagPicker from '../BlisTagPicker'
import './ActionCreatorEditor.css'
import HelpIcon from '../HelpIcon'
import { withRouter } from 'react-router-dom'
import { RouteComponentProps } from 'react-router'
import { autobind } from 'office-ui-fabric-react/lib/Utilities'
import { injectIntl, InjectedIntlProps } from 'react-intl'
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

const convertEntityIdsToTags = (ids: string[], entities: EntityBase[]): OF.ITag[] => {
    return ids
        .map<EntityBase>(entityId => entities.find(e => e.entityId === entityId))
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

const createSlateValue = (content: object | string, options: ActionPayloadEditor.IOption[]): ActionPayloadEditor.SlateValue => {
    if (typeof content === 'string') {
        // If string does not starts with { assume it's the old simple string based payload and user will have to manually load and re-save
        // Otherwise, treat as json as load the json respresentation of the editor which has fully saved entities and doesn't need manual reconstruction
        if (!content.startsWith('{')) {
            console.warn(`You created slate value from basic string: ${content} which may have had entities that are not detected. Please update the payload to fix and re-save.`)
            return Plain.deserialize(content)
        }

        content = JSON.parse(content) as object
    }

    const updatedJson = ActionPayloadEditor.Utilities.updateOptionNames(content, options)
    console.log(`Updated slate value with latest option names: `, updatedJson)
    return Value.fromJSON(updatedJson)
}

const actionTypeOptions = Object.values(ActionTypes)
    .map<OF.IDropdownOption>(actionTypeString => {
        return {
            key: actionTypeString,
            text: `${actionTypeString}`
        }
    })

interface ComponentState {
    apiOptions: OF.IDropdownOption[]
    cardOptions: OF.IDropdownOption[]
    selectedApiOptionKey: string | number | null
    selectedCardOptionKey: string | number | null
    isEditing: boolean
    isEntityEditorModalOpen: boolean
    isCardViewerModalOpen: boolean
    isConfirmDeleteModalOpen: boolean
    isPayloadFocused: boolean
    isPayloadValid: boolean
    selectedActionTypeOptionKey: string | number
    availableExpectedEntityTags: OF.ITag[]
    entityTags: OF.ITag[]
    expectedEntityTags: OF.ITag[]
    requiredEntityTagsFromPayload: OF.ITag[]
    requiredEntityTags: OF.ITag[]
    negativeEntityTags: OF.ITag[]
    slateValuesMap: { [slot: string]: ActionPayloadEditor.SlateValue }
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
    availableExpectedEntityTags: [],
    entityTags: [],
    expectedEntityTags: [],
    requiredEntityTagsFromPayload: [],
    requiredEntityTags: [],
    negativeEntityTags: [],
    slateValuesMap: {
        [TEXT_SLOT]: Plain.deserialize('')
    },
    isTerminal: true
}

class ActionCreatorEditor extends React.Component<Props, ComponentState> {
    private openState: ComponentState = initialState;
    state = initialState;

    componentWillMount() {
        const { entities, botInfo } = this.props
        const entityTags = entities.map<OF.ITag>(e =>
            ({
                key: e.entityId,
                name: e.entityName
            }))

        const availableExpectedEntityTags = entities
            .filter(e => e.entityType !== EntityType.LOCAL)
            .map<OF.ITag>(e =>
                ({
                    key: e.entityId,
                    name: e.entityName
                }))

        const callbacks = (botInfo && botInfo.callbacks || [])
        const apiOptions = callbacks.map<OF.IDropdownOption>(v =>
            ({
                key: v.name,
                text: v.name
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
            availableExpectedEntityTags,
            entityTags,
            isEditing: !!this.props.action
        }

        this.setState(this.openState)
    }

    componentWillReceiveProps(nextProps: Props) {
        let nextState = {}

        // Update local copy of entity tags if they have changed
        if (nextProps.entities !== this.props.entities) {
            const entityTags = nextProps.entities.map<OF.ITag>(e =>
                ({
                    key: e.entityId,
                    name: e.entityName
                }))

            const availableExpectedEntityTags = nextProps.entities
                .filter(e => e.entityType !== EntityType.LOCAL)
                .map<OF.ITag>(e =>
                    ({
                        key: e.entityId,
                        name: e.entityName
                    }))

            nextState = {
                ...nextState,
                availableExpectedEntityTags,
                entityTags
            }
        }

        if (nextProps.botInfo.callbacks !== this.props.botInfo.callbacks) {
            const { botInfo } = nextProps
            const callbacks = (botInfo && botInfo.callbacks || [])
            const apiOptions = callbacks.map<OF.IDropdownOption>(v =>
                ({
                    key: v.name,
                    text: v.name
                }))

            nextState = {
                ...nextState,
                apiOptions
            }
        }

        if (nextProps.botInfo.templates !== this.props.botInfo.templates) {
            const { botInfo } = nextProps
            const templates = (botInfo && botInfo.templates || [])
            const cardOptions = templates.map<OF.IDropdownOption>(v =>
                ({
                    key: v.name,
                    text: v.name
                }))

            nextState = {
                ...nextState,
                cardOptions
            }
        }

        if (nextProps.open === true) {
            // Reset state every time dialog was closed and is opened
            if (this.props.open === false) {
                nextState = {
                    ...this.openState
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

                let slateValuesMap = {}
                if (action.actionType === ActionTypes.TEXT) {
                    const textAction = new TextAction(action)
                    slateValuesMap[TEXT_SLOT] = createSlateValue(textAction.value, payloadOptions)
                } else if (action.actionType === ActionTypes.API_LOCAL) {
                    const apiAction = new ApiAction(action)
                    selectedApiOptionKey = apiAction.name
                    for (let actionArgument of apiAction.arguments) {
                        slateValuesMap[actionArgument.parameter] = createSlateValue(actionArgument.value, payloadOptions)
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
                            slateValuesMap[cardTemplateVariable.key] = createSlateValue(initialValue, payloadOptions)
                        }
                    }
                }

                const requiredEntityTagsFromPayload = Object.values(slateValuesMap)
                    .reduce<OF.ITag[]>((entities, value) => {
                        const newEntities = ActionPayloadEditor.Utilities.getEntitiesFromValue(value).map(convertOptionToTag)
                        return [...entities, ...newEntities]
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
                    expectedEntityTags,
                    negativeEntityTags,
                    requiredEntityTagsFromPayload,
                    requiredEntityTags,
                    isTerminal: action.isTerminal,
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
        const apiCallback = this.props.botInfo.callbacks.find(t => t.name === apiOption.key)
        if (!apiCallback) {
            throw new Error(`Could not find api callback with name: ${apiOption.key}`)
        }

        // Initialize a new empyt slate value for each of the arguments in the callback
        const newSlateValues = apiCallback.arguments
            .reduce((values, argument) => {
                values[argument] = Plain.deserialize('')
                return values
            }, {})

        this.setState({
            selectedApiOptionKey: apiOption.key,
            slateValuesMap: newSlateValues
        })
    }

    onChangedCardOption = (cardOption: OF.IDropdownOption) => {
        const template = this.props.botInfo.templates.find(t => t.name === cardOption.key)
        if (!template) {
            throw new Error(`Could not find template with name: ${cardOption.key}`)
        }

        // Initialize a new empyt slate value for each of the arguments in the callback
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

    // TODO: Investigate alternative to get around need to use EntityIdSerializer directly is to construct mock CardAction and call .renderArguments()
    getRenderedActionArguments(slateValuesMap: { [slot: string]: ActionPayloadEditor.SlateValue }, entities: EntityBase[]): RenderedActionArgument[] {
        return Object.entries(slateValuesMap)
            .filter(([parameter, value]) => value.document.text.length > 0)
            .map<RenderedActionArgument>(([parameter, value]) => ({
                parameter,
                value: Plain.serialize(value)// ActionPayloadEditor.EntityIdSerializer.serialize(value, entityValueMap)
            }))
    }

    onClickSubmit = () => {
        let payload: string = null;

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
                })
                break;
            }
            case ActionTypes.CARD:
                payload = JSON.stringify({
                    payload: this.state.selectedCardOptionKey.toString(),
                    arguments: this.getActionArguments(this.state.slateValuesMap)
                })
                break;
            case ActionTypes.API_LOCAL:
                payload = JSON.stringify({
                    payload: this.state.selectedApiOptionKey.toString(),
                    arguments: this.getActionArguments(this.state.slateValuesMap)
                })
                break;
            default:
                throw new Error(`When attempting to submit action, the selected action type: ${this.state.selectedActionTypeOptionKey} did not have matching type`)
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
            negativeEntities: this.state.negativeEntityTags.map<string>(tag => tag.key),
            suggestedEntity: (this.state.expectedEntityTags.length > 0) ? this.state.expectedEntityTags[0].key : null,
            version: null,
            packageCreationId: null,
            packageDeletionId: null,
            actionType: this.state.selectedActionTypeOptionKey as string
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
        const textPayload = this.state.slateValuesMap[TEXT_SLOT]
        const isPayloadValid = actionTypeOption.key !== ActionTypes.TEXT
            ? true
            : textPayload && (textPayload.document.text.length !== 0)

        this.setState({
            isPayloadValid,
            selectedActionTypeOptionKey: actionTypeOption.key,
            slateValuesMap: {
                [TEXT_SLOT]: Plain.deserialize('')
            }
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
            this.state.availableExpectedEntityTags,
            [...selectedTags, ...this.state.requiredEntityTagsFromPayload, ...this.state.requiredEntityTags]
        )
    }

    onRenderExpectedTag = (props: IBlisPickerItemProps<OF.ITag>): JSX.Element => {
        const renderProps = { ...props }
        renderProps.highlight = true
        return <BlisTagItem key={props.index} {...renderProps}>{props.item.name}</BlisTagItem>
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
            [...selectedTags, ...this.state.requiredEntityTagsFromPayload, ...this.state.requiredEntityTags]
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

        renderProps.strike = true
        // If negative entity is also the suggested entity lock/highlight
        renderProps.locked = false
        renderProps.highlight = suggestedEntityKey === props.key

        return <BlisTagItem key={props.index} {...renderProps}>{props.item.name}</BlisTagItem>
    }

    // Payload editor is trying to submit action
    onSubmitPayloadEditor(): void {
        if (!this.saveDisabled()) {
            this.onClickSubmit();
        }
    }

    onChangePayloadEditor = (value: ActionPayloadEditor.SlateValue, slot: string = null) => {
        console.log(`ActionCreatorEditor.onChangePayloadEditor: `, slot)
        let newArguments = { ...this.state.slateValuesMap }
        newArguments[slot] = value;

        const requiredEntityTagsFromPayload = Object.values(newArguments)
            .map(value => ActionPayloadEditor.Utilities.getEntitiesFromValue(value).map(convertOptionToTag))
            .reduce((a, b) => a.concat(b))

        // If we added entity to a payload which was already in the list of required entities remove it to avoid duplicates.
        const requiredEntityTags = this.state.requiredEntityTags.filter(tag => !requiredEntityTagsFromPayload.some(t => t.key === tag.key))
        const isPayloadValid = this.state.selectedActionTypeOptionKey !== ActionTypes.TEXT
            ? true
            : value.document.text.length !== 0

        this.setState({
            isPayloadValid,
            slateValuesMap: newArguments,
            requiredEntityTagsFromPayload,
            requiredEntityTags
        })
    }

    saveDisabled(): boolean {
        return (this.state.selectedActionTypeOptionKey === ActionTypes.API_LOCAL
            ? this.state.selectedApiOptionKey === null
            : !this.state.isPayloadValid)
    }

    @autobind
    onClickTrainDialogs() {
        const { history } = this.props
        history.push(`/home/${this.props.app.appId}/trainDialogs`, { app: this.props.app, actionFilter: this.props.action })
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
        const optionsAvailableForPayload = this.props.entities
            .filter(e => !unavailableTags.some(t => t.key === e.entityId))
            .map(convertEntityToOption)

        const { intl } = this.props

        return (
            <Modal
                isOpen={this.props.open}
                onDismiss={() => this.onDismissModal()}
                isBlocking={false}
                containerClassName="blis-modal blis-modal--medium"
            >
                <div className="blis-modal_header">
                    <span className={OF.FontClassNames.xxLarge}>{this.state.isEditing ? 'Edit Action' : 'Create an Action'}</span>
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
                            && (<div className="blis-dropdownWithButton-dropdown">
                                <TC.Dropdown
                                    label="API"
                                    options={this.state.apiOptions}
                                    onChanged={(apiOption) => this.onChangedApiOption(apiOption)}
                                    selectedKey={this.state.selectedApiOptionKey}
                                    disabled={this.state.apiOptions.length === 0 || this.state.isEditing}
                                    placeHolder={this.state.apiOptions.length === 0 ? 'NONE DEFINED' : 'API name...'}
                                    tipType={ToolTip.TipType.ACTION_API}
                                />
                                <OF.PrimaryButton
                                    className="blis-dropdownWithButton-button"
                                    onClick={() => this.onClickSyncBotInfo()}
                                    ariaDescription="Refresh"
                                    text=""
                                    iconProps={{ iconName: 'Sync' }}
                                />
                            </div>
                            )}

                        {this.state.selectedActionTypeOptionKey === ActionTypes.CARD
                            && (<div className="blis-dropdownWithButton-dropdown">
                                <TC.Dropdown
                                    label="Template"
                                    options={this.state.cardOptions}
                                    onChanged={(cardOption) => this.onChangedCardOption(cardOption)}
                                    selectedKey={this.state.selectedCardOptionKey}
                                    disabled={this.state.cardOptions.length === 0 || this.state.isEditing}
                                    placeHolder={this.state.cardOptions.length === 0 ? 'NONE DEFINED' : 'Template name...'}
                                    tipType={ToolTip.TipType.ACTION_CARD}
                                />
                                <OF.PrimaryButton
                                    className="blis-dropdownWithButton-button"
                                    onClick={() => this.onClickViewCard()}
                                    ariaDescription="Refresh"
                                    text=""
                                    iconProps={{ iconName: 'RedEye' }}
                                    disabled={this.state.selectedCardOptionKey == null}
                                />
                                <OF.PrimaryButton
                                    className="blis-dropdownWithButton-button"
                                    onClick={() => this.onClickSyncBotInfo()}
                                    ariaDescription="Refresh"
                                    text=""
                                    iconProps={{ iconName: 'Sync' }}
                                />
                            </div>
                            )}

                        {this.state.selectedActionTypeOptionKey === ActionTypes.CARD
                            && this.state.selectedCardOptionKey
                            && (this.props.botInfo.templates.find(t => t.name === this.state.selectedCardOptionKey) ?
                                (this.props.botInfo.templates.find(t => t.name === this.state.selectedCardOptionKey).variables
                                    .map(cardTemplateVariable => {
                                        return (
                                            <React.Fragment key={cardTemplateVariable.key}>
                                                <OF.Label className="blis-label">{cardTemplateVariable.key} <HelpIcon tipType={ToolTip.TipType.ACTION_ARGUMENTS}></HelpIcon></OF.Label>
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
                                ) :
                                <div className="blis-errorpanel" >
                                    <div>ERROR: Can't Find Template: ${this.state.selectedCardOptionKey}</div>
                                </div>
                            )
                        }

                        {this.state.selectedActionTypeOptionKey === ActionTypes.API_LOCAL
                            && this.state.selectedApiOptionKey
                            && (this.props.botInfo.callbacks.find(t => t.name === this.state.selectedApiOptionKey) ?
                                (this.props.botInfo.callbacks.find(t => t.name === this.state.selectedApiOptionKey).arguments
                                    .map(apiArgument => {
                                        return (
                                            <React.Fragment key={apiArgument}>
                                                <OF.Label>{apiArgument} <HelpIcon tipType={ToolTip.TipType.ACTION_ARGUMENTS}></HelpIcon></OF.Label>
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
                                    })
                                ) :
                                <div className="blis-errorpanel" >
                                    <div>ERROR: Missing API: ${this.state.selectedApiOptionKey}</div>
                                </div>
                            )
                        }

                        {this.state.selectedActionTypeOptionKey === ActionTypes.TEXT
                            && (<div className={(this.state.isPayloadValid ? '' : 'editor--error')}>
                                <div>
                                    <OF.Label>Response... <HelpIcon tipType={this.state.selectedActionTypeOptionKey === ActionTypes.API_LOCAL ?
                                        ToolTip.TipType.ACTION_ARGUMENTS : ToolTip.TipType.ACTION_RESPONSE_TEXT} /></OF.Label>
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
                                        <p className="ms-TextField-errorMessage css-83 errorMessage_9719d15e">
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
                            <TC.TagPicker
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
                            disabled={this.saveDisabled()}
                            onClick={() => this.onClickSubmit()}
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
                            onClick={() => this.onClickCancel()}
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
                                onClick={() => this.onClickDelete()}
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
                    <div className="blis-modal-buttons_secondary">
                        {this.state.isEditing &&
                            <OF.PrimaryButton
                                onClick={this.onClickTrainDialogs}
                                iconProps={{ iconName: 'QueryList' }}
                                ariaDescription={intl.formatMessage({
                                    id: FM.ACTIONCREATOREDITOR_TRAINDIALOGSBUTTON_ARIADESCRIPTION,
                                    defaultMessage: 'Train Dialogs'
                                })}
                                text={intl.formatMessage({
                                    id: FM.ACTIONCREATOREDITOR_TRAINDIALOGSBUTTON_TEXT,
                                    defaultMessage: 'Trail Dialogs'
                                })}
                            />
                        }
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
                <AdaptiveCardViewer
                    open={this.state.isCardViewerModalOpen && this.state.selectedCardOptionKey != null}
                    onDismiss={() => this.onCloseCardViewer()}
                    template={this.state.selectedCardOptionKey && this.props.botInfo.templates.find(t => t.name === this.state.selectedCardOptionKey)}
                    actionArguments={this.state.isCardViewerModalOpen && this.getRenderedActionArguments(this.state.slateValuesMap, this.props.entities)}
                    hideUndefined={false}
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
type Props = typeof stateProps & typeof dispatchProps & ReceiveProps & InjectedIntlProps & RouteComponentProps<any>

export default connect<typeof stateProps, typeof dispatchProps, ReceiveProps>(mapStateToProps, mapDispatchToProps)(withRouter(injectIntl(ActionCreatorEditor)))