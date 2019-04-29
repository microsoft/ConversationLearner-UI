/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react';
import * as ActionPayloadRenderers from '../actionPayloadRenderers'
import * as CLM from '@conversationlearner/models'
import * as OF from 'office-ui-fabric-react';
import * as Util from '../../Utils/util'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { returntypeof } from 'react-redux-typescript';
import { State } from '../../types'
import { createActionThunkAsync } from '../../actions/actionActions'
import { toggleAutoTeach } from '../../actions/teachActions'
import ActionCreatorEditor from './ActionCreatorEditor'
import { onRenderDetailsHeader } from '../ToolTips/ToolTips'
import { injectIntl, InjectedIntl, InjectedIntlProps } from 'react-intl'
import { FM } from '../../react-intl-messages'
import AdaptiveCardViewer from './AdaptiveCardViewer/AdaptiveCardViewer'
import ConfirmCancelModal from './ConfirmCancelModal'
import './ActionScorer.css'

const ACTION_BUTTON = 'action_button'
const STUB_BUTTON = 'stub_button'
const MISSING_ACTION = 'missing_action'

interface IRenderableColumn extends OF.IColumn {
    getSortValue: (action: CLM.ScoredBase, component: ActionScorer) => number | string
    render: (x: CLM.ScoredBase, component: ActionScorer, index: number) => React.ReactNode
}

function getColumns(intl: InjectedIntl): IRenderableColumn[] {
    return [
        {
            key: 'select',
            name: '',
            fieldName: 'actionId',
            minWidth: 80,
            maxWidth: 80,
            isResizable: true,
            getSortValue: action => action.actionId,
            render: (action, component, index) => {

                // If I'm not in Teach or clicked on history item, highlight selected
                let selected = false
                if (component.props.dialogType !== CLM.DialogType.TEACH || component.props.historyItemSelected) {
                    // If no selected actionId, first item is selected one
                    if (!component.props.selectedActionId && index === 0) {
                        selected = true
                    }
                    else if (component.props.selectedActionId === action.actionId) {
                        selected = true
                    }
                }

                const buttonText = Util.formatMessageId(intl, selected ? FM.BUTTON_SELECTED : FM.BUTTON_SELECT)
                if (!component.props.canEdit) {
                    return (
                        <OF.PrimaryButton
                            data-testid="action-scorer-button-no-click"
                            disabled={true}
                            ariaDescription={buttonText}
                            text={buttonText}
                        />
                    )
                }

                const isAvailable = component.isUnscoredActionAvailable(action as CLM.UnscoredAction)
                if (!isAvailable) {
                    return (
                        <OF.PrimaryButton
                            data-testid="action-scorer-button-no-click"
                            disabled={!isAvailable}
                            ariaDescription={buttonText}
                            text={buttonText}
                        />
                    )
                }
                else if (selected) {
                    return (
                        <OF.PrimaryButton
                            className="ms-Button--selected"
                            data-testid="action-scorer-button-selected"
                            disabled={!isAvailable}
                            ariaDescription={buttonText}
                            text={buttonText}
                            onClick={component.showAlreadySelectedPopUp}
                        />
                    )
                }
                else {
                    const refFn = (index === 0)
                        ? (ref: any) => { component.primaryScoreButton = ref }
                        : undefined
                    return (
                        <OF.PrimaryButton
                            data-testid="action-scorer-button-clickable"
                            onClick={() => component.handleActionSelection(action.actionId, action)}
                            ariaDescription={buttonText}
                            text={buttonText}
                            componentRef={refFn}
                        />
                    )
                }
            }
        },
        {
            key: 'actionResponse',
            name: Util.formatMessageId(intl, FM.ACTIONSCORER_COLUMNS_RESPONSE),
            fieldName: 'actionResponse',
            minWidth: 100,
            maxWidth: 500,
            isMultiline: true,
            isResizable: true,
            getSortValue: () => '',
            render: (action: CLM.ActionBase, component) => {
                const defaultEntityMap = Util.getDefaultEntityMap(component.props.entities)

                if (action.actionType === CLM.ActionTypes.TEXT) {
                    const textAction = new CLM.TextAction(action)
                    return (
                        <ActionPayloadRenderers.TextPayloadRendererContainer
                            textAction={textAction}
                            entities={component.props.entities}
                            memories={component.props.memories}
                        />)
                }
                else if (action.actionType === CLM.ActionTypes.API_LOCAL) {
                    const apiAction = new CLM.ApiAction(action)
                    const callback = component.props.botInfo.callbacks.find(t => t.name === apiAction.name)
                    return (
                        <ActionPayloadRenderers.ApiPayloadRendererContainer
                            apiAction={apiAction}
                            entities={component.props.entities}
                            memories={component.props.memories}
                            callback={callback}
                        />)
                }
                else if (action.actionType === CLM.ActionTypes.CARD) {
                    const cardAction = new CLM.CardAction(action)
                    return (
                        <ActionPayloadRenderers.CardPayloadRendererContainer
                            isValidationError={false}
                            cardAction={cardAction}
                            entities={component.props.entities}
                            memories={component.props.memories}
                            onClickViewCard={(_, showOriginal) => component.onClickViewCard(action, showOriginal)}
                        />)
                }
                else if (action.actionType === CLM.ActionTypes.END_SESSION) {
                    const sessionAction = new CLM.SessionAction(action)
                    return (
                        <ActionPayloadRenderers.SessionPayloadRendererContainer
                            sessionAction={sessionAction}
                            entities={component.props.entities}
                            memories={component.props.memories}
                        />)
                }
                else if (action.actionType === CLM.ActionTypes.SET_ENTITY) {
                    const [name, value] = Util.setEntityActionDisplay(action, component.props.entities)
                    return <span data-testid="action-scorer-action-set-entity" className={OF.FontClassNames.mediumPlus}>{name}: {value}</span>
                }

                return <span className={OF.FontClassNames.mediumPlus}>{CLM.ActionBase.GetPayload(action, defaultEntityMap)}</span>
            }
        },
        {
            key: 'actionScore',
            name: Util.formatMessageId(intl, FM.ACTIONSCORER_COLUMNS_SCORE),
            fieldName: 'score',
            minWidth: 80,
            maxWidth: 80,
            isResizable: true,
            isSorted: true,
            isSortedDescending: true,
            getSortValue: (scoredBase, component) => {

                // TODO: Fix type so we can use typed property access
                const score = scoredBase['score']

                // If score base does not have score it's either not scorable or not available
                // prioritize not scorable over not available but both at bottom of list
                if (!score) {
                    if (scoredBase['reason'] === CLM.ScoreReason.NotAvailable) {
                        return -100;
                    } else {
                        const isAvailable = component.isUnscoredActionAvailable(scoredBase as CLM.UnscoredAction);
                        return isAvailable
                            ? -1
                            : -10
                    }
                }

                return score
            },
            render: (action, component) => {
                let fieldContent: number | string = (action as CLM.ScoredAction).score
                if (fieldContent) {
                    fieldContent = `${(fieldContent as number * 100).toFixed(1)}%`
                } else if (component.isMasked(action.actionId)) {
                    fieldContent = "Masked"
                } else {
                    const isAvailable = component.isUnscoredActionAvailable(action as CLM.UnscoredAction);
                    if (isAvailable) {
                        fieldContent = (component.props.dialogType !== CLM.DialogType.TEACH || component.props.historyItemSelected)
                            ? '-' : "Training...";
                    }
                    else {
                        fieldContent = "Disqualified";
                    }
                }
                return <span className={OF.FontClassNames.mediumPlus}>{fieldContent}</span>
            }
        },
        {
            key: 'actionEntities',
            name: Util.formatMessageId(intl, FM.ACTIONSCORER_COLUMNS_ENTITIES),
            fieldName: 'entities',
            minWidth: 100,
            maxWidth: 300,
            isResizable: true,
            getSortValue: () => '',
            render: (action, component) => component.renderEntityRequirements(action.actionId)
        },
        {
            key: 'isTerminal',
            name: Util.formatMessageId(intl, FM.ACTIONSCORER_COLUMNS_ISTERMINAL),
            fieldName: 'isTerminal',
            minWidth: 50,
            maxWidth: 50,
            isResizable: true,
            getSortValue: action => action.isTerminal ? 1 : -1,
            render: action => <OF.Icon
                iconName={(action.isTerminal ? "CheckMark" : "Remove")}
                className={`cl-icon${action.isTerminal ? " checkIcon" : " notFoundIcon"}`}
            />
        },
        {
            key: 'actionType',
            name: Util.formatMessageId(intl, FM.ACTIONSCORER_COLUMNS_TYPE),
            fieldName: 'actionType',
            minWidth: 80,
            maxWidth: 80,
            isResizable: true,
            getSortValue: action => action.actionType.toLowerCase(),
            render: action => <span className={OF.FontClassNames.mediumPlus}>{action.actionType}</span>
        },
    ]
}

interface ComponentState {
    actionCreatorModalOpen: boolean
    columns: OF.IColumn[],
    scoredItems: CLM.ScoredBase[],
    sortColumn: IRenderableColumn
    haveEdited: boolean
    cardViewerAction: CLM.ActionBase | null
    cardViewerShowOriginal: boolean
    isAlreadySelectedOpen: boolean
}

class ActionScorer extends React.Component<Props, ComponentState> {
    primaryScoreButton: OF.IButton | null = null;

    constructor(p: Props) {
        super(p);

        const columns = getColumns(this.props.intl)
        this.state = {
            actionCreatorModalOpen: false,
            columns,
            scoredItems: [],
            sortColumn: columns[2], // "score"
            haveEdited: false,
            cardViewerAction: null,
            cardViewerShowOriginal: false,
            isAlreadySelectedOpen: false
        };
    }

    componentDidUpdate(prevProps: Props) {
        if (this.props.scoreResponse !== prevProps.scoreResponse) {
            this.autoSelect()
            this.setState({
                haveEdited: false,
                scoredItems: this.getScoredItems()
            })
        }
        if (this.props.newActionText !== prevProps.newActionText) {
            this.setState({
                actionCreatorModalOpen: this.props.newActionText !== undefined
            })
        }
    }

    componentDidMount() {
        this.autoSelect();
        this.setState({
            scoredItems: this.getScoredItems()
        })
    }

    onClickViewCard(action: CLM.ActionBase, cardViewerShowOriginal: boolean) {
        this.setState({
            cardViewerAction: action,
            cardViewerShowOriginal
        })
    }
    onCloseCardViewer = () => {
        this.setState({
            cardViewerAction: null,
            cardViewerShowOriginal: true
        })
    }

    autoSelect() {
        // If not in interactive mode select action automatically
        if (this.props.autoTeach && this.props.dialogMode === CLM.DialogMode.Scorer) {
            // We assume if DialogMode is Scorer, then we must have ScoreResponse
            // TODO: Fix this with better types
            const scoreResponse = this.props.scoreResponse
            const actions = [...scoreResponse.scoredActions as CLM.ScoredBase[], ...scoreResponse.unscoredActions]
            // Since actions are sorted by score descending (max first), assume first scored action is the "best" action
            const bestAction = actions[0];

            // Make sure there is an available action
            if ((bestAction as CLM.UnscoredAction).reason === CLM.ScoreReason.NotAvailable) {
                // If none available auto teach isn't possible.  User must create a new action
                this.props.toggleAutoTeach(false);
                return;
            }
            const selectedActionId = bestAction.actionId;
            this.handleActionSelection(selectedActionId);

        } else if (!this.state.actionCreatorModalOpen) {
            setTimeout(this.focusPrimaryButton, 100)
        }
    }

    @OF.autobind
    focusPrimaryButton(): void {
        if (this.primaryScoreButton) {
            this.primaryScoreButton.focus();
        }
        else {
            setTimeout(this.focusPrimaryButton, 100)
        }
    }

    onClickCancelActionEditor() {
        this.setState({
            actionCreatorModalOpen: false,
        })
        this.props.onActionCreatorClosed()
    }

    async onClickSubmitActionEditor(action: CLM.ActionBase) {
        await Util.setStateAsync(this, { actionModalOpen: false })
        this.props.onActionCreatorClosed()

        const newAction = await ((this.props.createActionThunkAsync(this.props.app.appId, action) as any) as Promise<CLM.ActionBase>)
        if (newAction
            && (
                newAction.actionType === CLM.ActionTypes.END_SESSION
                    ? this.props.isEndSessionAvailable
                    : true
            )
        ) {
            // See if new action is available, then take it
            const isAvailable = this.isAvailable(newAction);
            if (isAvailable) {
                this.handleActionSelection(newAction.actionId);
            }
        }
    }

    @OF.autobind
    handleOpenActionModal() {
        this.setState({
            actionCreatorModalOpen: true
        })
    }

    @OF.autobind
    onColumnClick(event: any, column: any) {
        const { columns } = this.state;
        let isSortedDescending = column.isSortedDescending;

        // If we've sorted this column, flip it.
        if (column.isSorted) {
            isSortedDescending = !isSortedDescending;
        }

        // Reset the items and columns to match the state.
        this.setState({
            columns: columns.map((col: any) => {
                col.isSorted = (col.key === column.key);

                if (col.isSorted) {
                    col.isSortedDescending = isSortedDescending;
                }

                return col;
            }),
            sortColumn: column
        });
    }

    @OF.autobind
    handleDefaultSelection() {
        // Look for a valid action
        let actionId = null
        const scoreResponse = this.props.scoreResponse
        if (scoreResponse.scoredActions && scoreResponse.scoredActions.length > 0) {
            actionId = scoreResponse.scoredActions[0].actionId;
        } else if (scoreResponse.unscoredActions) {
            for (const unscoredAction of scoreResponse.unscoredActions) {
                if (unscoredAction.reason === CLM.ScoreReason.NotScorable) {
                    actionId = unscoredAction.actionId;
                    break;
                }
            }
        }
        if (actionId) {
            this.handleActionSelection(actionId);
        }
    }

    @OF.autobind
    async handleActionSelection(actionId: string, scoredBase?: CLM.ScoredBase) {
        let scoredAction: CLM.ScoredAction | undefined
        if (scoredBase && actionId === Util.PLACEHOLDER_SET_ENTITY_ACTION_ID) {
            // TODO: Schema refactor
            const setEntityAction = new CLM.SetEntityAction(scoredBase as CLM.ActionBase)
            const action = Util.getSetEntityActionForEnumValue(setEntityAction.entityId, setEntityAction.enumValueId)
            const newAction = await (this.props.createActionThunkAsync(this.props.app.appId, action) as any as CLM.ActionBase)

            scoredAction = {
                actionId: newAction.actionId,
                payload: newAction.payload,
                isTerminal: newAction.isTerminal,
                actionType: newAction.actionType,
                score: undefined!
            }
        }
        else {
            const { scoredActions, unscoredActions } = this.props.scoreResponse
            scoredAction = scoredActions.find(a => a.actionId === actionId);
            if (!scoredAction) {
                const unscoredAction = unscoredActions.find(a => a.actionId === actionId);
                if (unscoredAction) {
                    const { reason, ...scoredBase } = unscoredAction
                    // This is hack to create scored action without a real score
                    scoredAction = {
                        ...scoredBase,
                        score: undefined!
                    }
                }
                // TODO: Modify handleActionSelection to be passed action instead of finding action again from list by ID
                // TODO: If score can be undefined on train dialog, what is the value in actually having the real score?
                // if it doesn't matter, then skip all this steps for scored, unscored, missing and just find action within props.actions
                else {
                    const responseActions = [...scoredActions, ...unscoredActions]
                    const otherActions = this.props.actions.filter(a => responseActions.every(sa => sa.actionId !== a.actionId))
                    const action = otherActions.find(a => a.actionId === actionId)
                    if (!action) {
                        throw new Error(`Could not find action with id: ${actionId} in list of actions`)
                    }

                    scoredAction = {
                        actionId: action.actionId,
                        payload: action.payload,
                        isTerminal: action.isTerminal,
                        actionType: action.actionType,
                        score: undefined!
                    }
                }
            }
        }

        if (!scoredAction) {
            throw new Error(`Scored action could not be found in list of available actions`)
        }

        const trainScorerStep: CLM.TrainScorerStep = {
            input: this.props.scoreInput,
            labelAction: scoredAction.actionId,
            logicResult: undefined,
            scoredAction: scoredAction
        };

        this.setState({ haveEdited: true });
        this.props.onActionSelected(trainScorerStep);
    }

    isConditionMet(condition: CLM.Condition): { match: boolean, name: string } {
        const entity = this.props.entities.filter(e => e.entityId === condition.entityId)[0];

        // If entity is null - there's a bug somewhere
        if (!entity) {
            return { match: false, name: 'ERROR' };
        }

        const enumValue = entity.enumValues && entity.enumValues.find(ev => ev.enumValueId === condition.valueId)
        const memory = this.props.memories.filter(m => m.entityName === entity.entityName)[0];
        const match = memory !== undefined
            && memory.entityValues[0]
            && memory.entityValues[0].enumValueId === condition.valueId
        return { match, name: `${entity.entityName} = ${enumValue ? enumValue.enumValue : "NOT FOUND"}` };
    }

    // Check if entity is in memory and return it's name 
    entityInMemory(entityId: string): { match: boolean, name: string } {
        const entity = this.props.entities.filter(e => e.entityId === entityId)[0];

        // If entity is null - there's a bug somewhere
        if (!entity) {
            return { match: false, name: 'ERROR' };
        }

        const memory = this.props.memories.filter(m => m.entityName === entity.entityName)[0];
        return { match: (memory !== undefined), name: entity.entityName };
    }

    renderEntityRequirements(actionId: string) {
        if (actionId === Util.PLACEHOLDER_SET_ENTITY_ACTION_ID) {
            return null
        }

        const action = this.props.actions.filter(a => a.actionId === actionId)[0];

        // If action is null - there's a bug somewhere
        if (!action) {
            return <div className={OF.FontClassNames.mediumPlus}>ERROR: Missing Action</div>
        }

        const items = [];
        for (const entityId of action.requiredEntities) {
            const found = this.entityInMemory(entityId)
            items.push({
                name: found.name,
                neg: false,
                type: found.match
                    ? 'cl-entity cl-entity--match'
                    : 'cl-entity cl-entity--mismatch',
            });
        }
        for (const entityId of action.negativeEntities) {
            const found = this.entityInMemory(entityId)
            items.push({
                name: found.name,
                neg: true,
                type: found.match
                    ? 'cl-entity cl-entity--mismatch'
                    : 'cl-entity cl-entity--match',
            });
        }
        if (action.requiredConditions) {
            for (const condition of action.requiredConditions) {
                const result = this.isConditionMet(condition)
                items.push({
                    name: result.name,
                    neg: false,
                    type: result.match
                        ? 'cl-entity cl-entity--match'
                        : 'cl-entity cl-entity--mismatch',
                });
            }
        }
        if (action.negativeConditions) {
            for (const condition of action.negativeConditions) {
                const result = this.isConditionMet(condition)
                items.push({
                    name: result.name,
                    neg: true,
                    type: result.match
                        ? 'cl-entity cl-entity--mismatch'
                        : 'cl-entity cl-entity--match',
                });
            }
        }
        return (
            <OF.List
                items={items}
                onRenderCell={(item, index) => {
                    return <span className={item.type}>{item.neg ? (<del>{item.name}</del>) : item.name}</span>
                }}
            />
        )
    }

    isUnscoredActionAvailable(action: CLM.UnscoredAction): boolean {
        // Can't add an end session action if one has already been added
        if (action.actionType === CLM.ActionTypes.END_SESSION && !this.props.isEndSessionAvailable) {

            // If selected action is EndSession, it's ok to replace it with another EndSession
            // If no selected actionId, first item is selected one
            const selectedActionId = this.props.selectedActionId || (this.state.scoredItems.length > 0 ? this.state.scoredItems[0].actionId : null)
            if (selectedActionId) {
                let selectedAction = this.props.actions.find(a => a.actionId === selectedActionId)
                if (selectedAction && selectedAction.actionType === CLM.ActionTypes.END_SESSION) {
                    return true
                }

            }
            return false
        }
        else if (action.reason === CLM.ScoreReason.NotAvailable) {
            return false
        }
        // actionId can be undefined for "fake" actions injected in the list
        // even though it was casted to UnscoredAction to lose type information
        else if (action.actionId === Util.PLACEHOLDER_SET_ENTITY_ACTION_ID) {
            return true
        } else {
            return this.isActionIdAvailable(action.actionId);
        }
    }

    // Returns true if ActionId is available in actions
    isActionIdAvailable(actionId: string): boolean {
        const action = this.props.actions.find(a => a.actionId === actionId);
        if (!action) {
            return false;
        }
        return this.isAvailable(action);
    }

    // Returns true if Action is available given Entities in Memory
    isAvailable(action: CLM.ActionBase): boolean {

        for (const entityId of action.requiredEntities) {
            const found = this.entityInMemory(entityId)
            if (!found.match) {
                return false
            }
        }
        for (const entityId of action.negativeEntities) {
            const found = this.entityInMemory(entityId)
            if (found.match) {
                return false
            }
        }
        if (action.requiredConditions) {
            for (const condition of action.requiredConditions) {
                const result = this.isConditionMet(condition)
                if (!result.match) {
                    return false
                }
            }
        }
        if (action.negativeConditions) {
            for (const condition of action.negativeConditions) {
                const result = this.isConditionMet(condition)
                if (result.match) {
                    return false
                }
            }
        }
        return true;
    }

    calculateReason(unscoredAction: CLM.UnscoredAction): CLM.ScoreReason {

        if (this.props.dialogType !== CLM.DialogType.TEACH
            || !unscoredAction.reason
            || unscoredAction.reason === CLM.ScoreReason.NotCalculated) {

            const action = this.props.actions.filter((a: CLM.ActionBase) => a.actionId === unscoredAction.actionId)[0];

            // If action is null - there's a bug somewhere
            if (!action) {
                return CLM.ScoreReason.NotAvailable;
            }

            const isAvailable = this.isAvailable(action);
            return isAvailable ? CLM.ScoreReason.NotScorable : CLM.ScoreReason.NotAvailable;
        }
        return unscoredAction.reason as CLM.ScoreReason;
    }

    isMasked(actionId: string): boolean {
        return (this.props.scoreInput.maskedActions && this.props.scoreInput.maskedActions.indexOf(actionId) > -1);
    }

    @OF.autobind
    renderItemColumn(action: CLM.ScoredBase, index: number, column: IRenderableColumn) {
        // Null is action create button
        if (action.actionId === ACTION_BUTTON) {
            if (column.key === 'select') {
                // Will focus on new action button if no scores
                const ref = (index === 0)
                    ? (r: OF.IButton) => { this.primaryScoreButton = r }
                    : undefined;
                return ( 
                    <OF.PrimaryButton
                        data-testid="action-scorer-add-action-button"
                        onClick={this.handleOpenActionModal}
                        ariaDescription='Create Action'
                        text='Action'
                        iconProps={{ iconName: 'CirclePlus' }}
                        componentRef={ref}
                    />
                )
            } else {
                return ''
            }
        }
        else if (action.actionId === STUB_BUTTON) {
            if (column.key === 'select') {
                // Will focus on new action button if no scores
                const ref = (index === 0)
                    ? ((r: any) => { this.primaryScoreButton = r })
                    : undefined;
                return ( 
                    <OF.PrimaryButton
                        data-testid="action-scorer-add-action-button"
                        onClick={this.props.onCreateAPIStub}
                        ariaDescription='Create API Stub'
                        text='API'
                        iconProps={{ iconName: 'EditSolid12' }}
                        componentRef={ref}
                    />
                )
            } else {
                return '';
            }
        }
        // Handle deleted actions
        else if (action.actionId === MISSING_ACTION) {
            if (column.key === 'select') {
                const buttonText = (this.props.dialogType !== CLM.DialogType.TEACH && index === 0) ? "Selected" : "Select";
                return (
                    <OF.PrimaryButton
                        disabled={true}
                        ariaDescription={buttonText}
                        text={buttonText}
                    />
                )
            } else if (column.key === 'actionResponse') {
                return <span className="cl-font--warning">MISSING ACTION</span>;
            }
            else if (column.key === 'actionScore') {
                return column.render(action as CLM.ScoredBase, this, index)
            }
            else {
                return ''
            }
        }

        return column.render(action as CLM.ScoredBase, this, index)
    }

    // Create dummy item for injecting non-actions into list
    makeDummyItem(dummyType: string, score: number): CLM.ScoredAction {
        return {
            actionId: dummyType,
            payload: dummyType,
            score: score,
            isTerminal: false,
            actionType: CLM.ActionTypes.TEXT
        }
    }

    getScoredItems(): CLM.ScoredBase[] {
        if (!this.props.scoreResponse) {
            return []
        }

        let scoredItems = [...this.props.scoreResponse.scoredActions as CLM.ScoredBase[], ...this.props.scoreResponse.unscoredActions]

        // Need to reassemble to scored item has full action info and reason
        scoredItems = scoredItems.map(scoredBase => {
            const action = this.props.actions.find(ee => ee.actionId === scoredBase.actionId);
            const score = (scoredBase as CLM.ScoredAction).score;
            const reason = score ? null : this.calculateReason(scoredBase as CLM.UnscoredAction);
            if (action) {
                return { ...action, reason: reason, score: score }
            }
            else {
                // Action that no longer exists (was deleted)
                return this.makeDummyItem(MISSING_ACTION, score);
            }
        });

        // Add any new actions that weren't included in scores
        // NOTE: This will go away when we always rescore the step
        const missingActions = this.props.actions.filter(a => scoredItems.find(si => si.actionId === a.actionId) == null)
        const missingItems = missingActions.map<CLM.ScoredBase>(action =>
            ({
                ...action,
                reason: CLM.ScoreReason.NotCalculated,
                score: 0
            }))

        scoredItems = [...scoredItems, ...missingItems]

        // Add any actions to set enum values that weren't already generated
        // Note: These actions don't have ID's because they don't exist
        const setEntityActions = this.props.entities
            .filter(e => e.entityType === CLM.EntityType.ENUM)
            .map(e => Util.getSetEntityActionsFromEnumEntity(e))
            .reduce((a, b) => [...a, ...b], [])

        // TODO: Schema Refactor
        // Need to convert these to access entityId and enumValueId
        const existingSetEntityActions = scoredItems
            .filter(si => si.actionType === CLM.ActionTypes.SET_ENTITY)
            .map(a => new CLM.SetEntityAction(a as CLM.ActionBase))

        const missingSetEntityActions = setEntityActions
            .filter(possibleAction => !existingSetEntityActions.find(existingAction =>
                existingAction.entityId === possibleAction.entityId
                && existingAction.enumValueId === possibleAction.enumValueId
            ))

        const missingSetEntityItems = missingSetEntityActions
            .map<CLM.ScoredBase>(action =>
                ({
                    ...action,
                    reason: CLM.ScoreReason.NotCalculated,
                    score: 0
                }))

        scoredItems = [...scoredItems, ...missingSetEntityItems]

        if (this.state.sortColumn) {
            const sortColumn = this.state.sortColumn
            // Sort the items.
            scoredItems = scoredItems.sort((a, b) => {
                const firstValue = sortColumn.getSortValue(a, this)
                const secondValue = sortColumn.getSortValue(b, this)

                let isFirstGreaterThanSecond = 0

                if (typeof firstValue === 'string' && typeof secondValue === 'string') {
                    isFirstGreaterThanSecond = firstValue.localeCompare(secondValue)
                }
                else if (typeof firstValue === 'number' && typeof secondValue === 'number') {
                    isFirstGreaterThanSecond = firstValue - secondValue
                }

                return sortColumn.isSortedDescending
                    ? isFirstGreaterThanSecond * -1
                    : isFirstGreaterThanSecond
            });
        }

        // If editing allowed add Action creation button
        if (!this.props.autoTeach && this.props.canEdit) {
            scoredItems.push(this.makeDummyItem(ACTION_BUTTON, 0));
            scoredItems.push(this.makeDummyItem(STUB_BUTTON, 0));
        }

        return scoredItems
    }

    render() {
        // In teach mode, hide scores after selection
        // so they can't be re-selected for non-terminal actions
        if (this.props.dialogType === CLM.DialogType.TEACH && this.state.haveEdited) {
            return null;
        }

        const { intl } = this.props
        let template: CLM.Template | undefined
        let renderedActionArguments: CLM.RenderedActionArgument[] = []
        if (this.state.cardViewerAction) {
            const cardAction = new CLM.CardAction(this.state.cardViewerAction)
            const entityMap = Util.getDefaultEntityMap(this.props.entities)
            template = this.props.botInfo.templates.find((t) => t.name === cardAction.templateName)
            renderedActionArguments = this.state.cardViewerShowOriginal
                ? cardAction.renderArguments(entityMap, { preserveOptionalNodeWrappingCharacters: true })
                : cardAction.renderArguments(Util.createEntityMapFromMemories(this.props.entities, this.props.memories), { fallbackToOriginal: true })
        }

        return (
            <div>
                {this.state.scoredItems.length === 1 && (!this.props.autoTeach && this.props.canEdit)
                    ? <div className="cl-action-scorer-placeholder">
                        <div className={`cl-action-scorer-placeholder__description`}>
                            <h1 className={OF.FontClassNames.xxLarge}>Create an Action</h1>
                            <p>You're bot does not have any actions.<br />It needs at least one action to continue building this training dialog.</p>
                        </div>
                        <div>
                            <OF.PrimaryButton
                                text="Create Action"
                                iconProps={{ iconName: 'Add' }}
                                onClick={this.handleOpenActionModal}
                            />
                        </div>
                    </div>
                    : <OF.DetailsList
                        className={OF.FontClassNames.mediumPlus}
                        items={this.state.scoredItems}
                        columns={this.state.columns}
                        checkboxVisibility={OF.CheckboxVisibility.hidden}
                        onRenderItemColumn={this.renderItemColumn}
                        onColumnHeaderClick={this.onColumnClick}
                        onRenderDetailsHeader={(
                            detailsHeaderProps: OF.IDetailsHeaderProps,
                            defaultRender: OF.IRenderFunction<OF.IDetailsHeaderProps>) =>
                            onRenderDetailsHeader(detailsHeaderProps, defaultRender)}
                    />
                }

                <ActionCreatorEditor
                    app={this.props.app}
                    editingPackageId={this.props.editingPackageId}
                    open={this.state.actionCreatorModalOpen}
                    action={null}
                    actions={this.props.actions}
                    newActionText={this.props.newActionText}
                    handleClose={() => this.onClickCancelActionEditor()}
                    // It is not possible to delete from this modal since you cannot select existing action so disregard implementation of delete 
                    handleDelete={action => { }}
                    handleEdit={action => this.onClickSubmitActionEditor(action)}
                />
                <AdaptiveCardViewer
                    open={this.state.cardViewerAction != null}
                    onDismiss={() => this.onCloseCardViewer()}
                    template={template}
                    actionArguments={renderedActionArguments}
                    hideUndefined={true}
                />
                <ConfirmCancelModal
                    data-testid="popup-already-selected"
                    open={this.state.isAlreadySelectedOpen}
                    onOk={this.onCloseAlreadySelectedPopUp}
                    title={Util.formatMessageId(intl, FM.LOGDIALOGS_ALREADYSELECTED)}
                />
            </div>
        )
    }

    @OF.autobind
    showAlreadySelectedPopUp() {
        this.setState({ isAlreadySelectedOpen: true })
    }

    @OF.autobind
    onCloseAlreadySelectedPopUp() {
        this.setState({ isAlreadySelectedOpen: false })
    }
}

export interface ReceivedProps {
    app: CLM.AppBase
    editingPackageId: string,
    historyItemSelected: boolean,
    dialogType: CLM.DialogType,  // LARS = make this not train dialog specific
    autoTeach: boolean,
    dialogMode: CLM.DialogMode,
    scoreResponse: CLM.ScoreResponse,
    scoreInput: CLM.ScoreInput,
    selectedActionId: string | undefined,
    memories: CLM.Memory[],
    canEdit: boolean,
    isEndSessionAvailable: boolean,
    newActionText?: string 
    onActionSelected: (trainScorerStep: CLM.TrainScorerStep) => void,
    onActionCreatorClosed: () => void
    onCreateAPIStub: () => void
}

const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        createActionThunkAsync,
        toggleAutoTeach,
    }, dispatch);
}
const mapStateToProps = (state: State, ownProps: any) => {
    if (!state.bot.botInfo) {
        throw new Error(`You attempted to render the ActionScorer which requires botInfo, but botInfo was not defined. This is likely a problem with higher level component. Please open an issue.`)
    }

    return {
        user: state.user.user,
        entities: state.entities,
        actions: state.actions,
        botInfo: state.bot.botInfo
    }
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(ActionScorer))