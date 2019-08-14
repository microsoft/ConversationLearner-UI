/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import * as OF from 'office-ui-fabric-react'
import * as Util from '../Utils/util'
import * as ActionPayloadRenderers from './actionPayloadRenderers'
import * as moment from 'moment'
import * as CLM from '@conversationlearner/models'
import AdaptiveCardViewer from './modals/AdaptiveCardViewer/AdaptiveCardViewer'
import actionTypeRenderer from './ActionTypeRenderer'
import { returntypeof } from 'react-redux-typescript'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { State } from '../types'
import { onRenderDetailsHeader } from './ToolTips/ToolTips'
import { injectIntl, InjectedIntl, InjectedIntlProps } from 'react-intl'
import { FM } from '../react-intl-messages'
import './ActionDetailsList.css'
import { autobind } from 'core-decorators'

interface ComponentState {
    columns: IRenderableColumn[]
    sortColumn: IRenderableColumn
    cardViewerAction: CLM.ActionBase | null
}

class ActionDetailsList extends React.Component<Props, ComponentState> {
    constructor(p: any) {
        super(p);
        const columns = getColumns(this.props.intl)
        const defaultSortColumnName = "actionResponse"
        const defaultSortColumn = columns.find(c => c.key === defaultSortColumnName)
        if (!defaultSortColumn) {
            throw new Error(`Could not find column by name: ${defaultSortColumnName}`)
        }

        columns.forEach(col => {
            col.isSorted = false
            col.isSortedDescending = false

            if (col === defaultSortColumn) {
                col.isSorted = true
            }
        })

        this.state = {
            columns,
            sortColumn: defaultSortColumn,
            cardViewerAction: null
        }
    }

    validationError(action: CLM.ActionBase): boolean {
        switch (action.actionType) {
            case CLM.ActionTypes.TEXT: {
                // Make sure it renders
                try {
                    const entityMap = Util.getDefaultEntityMap(this.props.entities)
                    const textAction = new CLM.TextAction(action)
                    textAction.renderValue(entityMap, { preserveOptionalNodeWrappingCharacters: true })
                    return false
                }
                catch (error) {
                    return true
                }
            }
            case CLM.ActionTypes.API_LOCAL: {
                const apiAction = new CLM.ApiAction(action)
                // If placeholder not expecting action to exist
                if (apiAction.isPlaceholder) {
                    return false
                }
                // Otherwise make sure callback exists
                return !this.props.botInfo.callbacks.some(t => t.name === apiAction.name)
            }
            case CLM.ActionTypes.CARD: {
                const cardAction = new CLM.CardAction(action)
                return !this.props.botInfo.templates.some(cb => cb.name === cardAction.templateName)
            }
            case CLM.ActionTypes.END_SESSION: {
                return false
            }
            case CLM.ActionTypes.SET_ENTITY: {
                const entity = this.props.entities.find(e => e.entityId === action.entityId)
                return !entity
                    ? true
                    : entity.entityType !== CLM.EntityType.ENUM
            }
            case CLM.ActionTypes.DISPATCH: {
                // TODO: Could validate access to model, but don't have access to it within this model
                return false
            }
            default: {
                console.warn(`Could not get validation for unknown action type: ${action.actionType}`)
                return true
            }
        }
    }

    sortActions(): CLM.ActionBase[] {
        const actions = [...this.props.actions];
        // If column header selected sort the items
        if (this.state.sortColumn) {
            actions
                .sort((a, b) => {
                    const firstValue = this.state.sortColumn.getSortValue(a, this)
                    const secondValue = this.state.sortColumn.getSortValue(b, this)
                    const compareValue = firstValue.localeCompare(secondValue)
                    return this.state.sortColumn.isSortedDescending
                        ? compareValue
                        : compareValue * -1
                })
        }

        return actions;
    }

    @autobind
    onClickColumnHeader(event: any, clickedColumn: IRenderableColumn) {
        const sortColumn = this.state.columns.find(c => c.key === clickedColumn.key)!
        const columns = this.state.columns.map(column => {
            column.isSorted = false
            column.isSortedDescending = false
            if (column === sortColumn) {
                column.isSorted = true
                column.isSortedDescending = !clickedColumn.isSortedDescending
            }
            return column
        })

        // Reset the items and columns to match the state.
        this.setState({
            columns,
            sortColumn
        });
    }

    onClickViewCard(action: CLM.ActionBase) {
        this.setState({
            cardViewerAction: action
        })
    }

    onClickRow(item: any, index: number | undefined, event: Event | undefined) {
        // Don't response to row click if it's button that was clicked
        if (event && (event.target as any).type !== 'button') {
            const action = item as CLM.ActionBase
            this.props.onSelectAction(action)
        }
    }

    onCloseCardViewer = () => {
        this.setState({
            cardViewerAction: null
        })
    }

    render() {
        const sortedActions = this.sortActions();

        let template: CLM.Template | undefined
        let renderedActionArguments: CLM.RenderedActionArgument[] = []
        if (this.state.cardViewerAction) {
            const cardAction = new CLM.CardAction(this.state.cardViewerAction)
            const entityMap = Util.getDefaultEntityMap(this.props.entities)
            template = this.props.botInfo.templates.find((t) => t.name === cardAction.templateName)
            // TODO: This is hack to make adaptive card viewer accept action arguments with pre-rendered values
            renderedActionArguments = cardAction.renderArguments(entityMap, { preserveOptionalNodeWrappingCharacters: true })
                .filter(aa => !Util.isNullOrWhiteSpace(aa.value))
        }

        return (
            <div>
                <OF.DetailsList
                    className={OF.FontClassNames.mediumPlus}
                    items={sortedActions}
                    columns={this.state.columns}
                    checkboxVisibility={OF.CheckboxVisibility.hidden}
                    onRenderRow={(props, defaultRender) => <div data-selection-invoke={true}>{defaultRender && defaultRender(props)}</div>}
                    onRenderItemColumn={(action: CLM.ActionBase, i, column: IRenderableColumn) => column.render(action, this)}
                    onItemInvoked={(item, index, ev) => this.onClickRow(item, index, ev)}
                    onColumnHeaderClick={this.onClickColumnHeader}
                    onRenderDetailsHeader={(detailsHeaderProps: OF.IDetailsHeaderProps,
                        defaultRender: OF.IRenderFunction<OF.IDetailsHeaderProps>) =>
                        onRenderDetailsHeader(detailsHeaderProps, defaultRender)}
                />
                <AdaptiveCardViewer
                    open={this.state.cardViewerAction !== null}
                    onDismiss={() => this.onCloseCardViewer()}
                    template={template}
                    actionArguments={renderedActionArguments}
                    hideUndefined={true}
                />
            </div>
        )
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
    }, dispatch);
}

const mapStateToProps = (state: State) => {
    if (!state.bot.botInfo) {
        throw new Error(`You attempted to render the ActionDetailsList which requires botInfo, but botInfo was not defined. This is likely a problem with higher level component. Please open an issue.`)
    }

    return {
        entities: state.entities,
        botInfo: state.bot.botInfo
    }
}

export interface ReceivedProps {
    actions: CLM.ActionBase[]
    onSelectAction: (action: CLM.ActionBase) => void
}

// Props types inferred from mapStateToProps 
const stateProps = returntypeof(mapStateToProps);
type Props = typeof stateProps & ReceivedProps & InjectedIntlProps

export default connect<typeof stateProps, {}, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(ActionDetailsList) as any)

function getActionPayloadRenderer(action: CLM.ActionBase, component: ActionDetailsList, isValidationError: boolean) {
    if (action.actionType === CLM.ActionTypes.TEXT) {
        const textAction = new CLM.TextAction(action)
        return (<ActionPayloadRenderers.TextPayloadRendererContainer
            textAction={textAction}
            entities={component.props.entities}
            memories={null}
        />)
    }
    else if (action.actionType === CLM.ActionTypes.API_LOCAL) {
        const apiAction = new CLM.ApiAction(action)
        const callback = component.props.botInfo.callbacks.find(t => t.name === apiAction.name)
        return (<ActionPayloadRenderers.ApiPayloadRendererContainer
            apiAction={apiAction}
            entities={component.props.entities}
            memories={null}
            callback={callback}
        />)
    }
    else if (action.actionType === CLM.ActionTypes.CARD) {
        const cardAction = new CLM.CardAction(action)
        return (<ActionPayloadRenderers.CardPayloadRendererContainer
            isValidationError={isValidationError}
            cardAction={cardAction}
            entities={component.props.entities}
            memories={null}
            onClickViewCard={() => component.onClickViewCard(action)}
        />)
    }
    else if (action.actionType === CLM.ActionTypes.END_SESSION) {
        const sessionAction = new CLM.SessionAction(action)
        return (<ActionPayloadRenderers.SessionPayloadRendererContainer
            sessionAction={sessionAction}
            entities={component.props.entities}
            memories={null}
        />)
    }
    else if (action.actionType === CLM.ActionTypes.SET_ENTITY) {
        const [name, value] = Util.setEntityActionDisplay(action, component.props.entities)
        return <span data-testid="actions-list-set-entity" className={OF.FontClassNames.mediumPlus}>{name}: {value}</span>
    }
    else if (action.actionType === CLM.ActionTypes.DISPATCH) {
        // TODO: Mismatch between fields in payload and actionBase (modelId and modelName vs only modelId)
        // Need to be able to load model by id to get name but need asynchronous functions etc
        const dispatchAction = new CLM.DispatchAction(action)
        return <span data-testid="actions-list-dispatch" className={OF.FontClassNames.mediumPlus}>Dispatch to model: {dispatchAction.modelName}</span>
    }

    return <span className={OF.FontClassNames.mediumPlus}>Unknown Action Type</span>
}

function renderCondition(text: string, isRequired: boolean): JSX.Element {
    return (
        <div 
            className='ms-ListItem is-selectable ms-ListItem-primaryText' 
            key={text} 
            data-testid={isRequired ? "action-details-required-entities" : "action-details-disqualifying-entities"}
        >
                {text}
        </div>
    )
}
function renderConditions(entityIds: string[], conditions: CLM.Condition[], allEntities: CLM.EntityBase[], isRequired: boolean): JSX.Element[] {
    if (entityIds.length === 0 && (!conditions || conditions.length === 0)) {
        return ([
            <OF.Icon
                key="empty" 
                iconName="Remove" 
                className="cl-icon" 
                data-testid={isRequired ? "action-details-empty-required-entities" : "action-details-empty-disqualifying-entities"}
            /> 
        ])
    }
    
    const elements: JSX.Element[] = []
    entityIds.forEach(entityId => {
        const entity = allEntities.find(e => e.entityId === entityId)
        if (!entity) {
            elements.push(renderCondition(`Error - Missing Entity ID: ${entityId}`, isRequired))
        }
        else {
            elements.push(renderCondition(entity.entityName, isRequired))
        }
    })
    if (conditions) {
        conditions.forEach(condition => {
            const entity = allEntities.find(e => e.entityId === condition.entityId)
            if (!entity) {
                elements.push(renderCondition(`Error - Missing Entity ID: ${condition.entityId}`, isRequired))
            }
            else {
                const enumValue = entity.enumValues ? entity.enumValues.find(eid => eid.enumValueId === condition.valueId) : undefined
                if (!enumValue) {
                    elements.push(renderCondition(`Error - Missing Enum: ${condition.valueId}`, isRequired))
                }
                else {
                    elements.push(renderCondition(`${entity.entityName} = ${enumValue.enumValue}`, isRequired))
                }
            }
        })
    }
    return elements
}

function getColumns(intl: InjectedIntl): IRenderableColumn[] {
    return [
        {
            key: 'actionResponse',
            name: Util.formatMessageId(intl, FM.ACTIONDETAILSLIST_COLUMNS_RESPONSE),
            fieldName: 'actionResponse',
            minWidth: 200,
            maxWidth: 400,
            isResizable: true,
            isMultiline: true,
            isSortedDescending: true,
            getSortValue: (action, component) => {
                const entityMap = Util.getDefaultEntityMap(component.props.entities)

                try {
                    switch (action.actionType) {
                        case CLM.ActionTypes.TEXT: {
                            const textAction = new CLM.TextAction(action)
                            return textAction.renderValue(entityMap, { preserveOptionalNodeWrappingCharacters: true })
                        }
                        case CLM.ActionTypes.API_LOCAL: {
                            const apiAction = new CLM.ApiAction(action)
                            return apiAction.name
                        }
                        case CLM.ActionTypes.CARD: {
                            const cardAction = new CLM.CardAction(action)
                            return cardAction.templateName
                        }
                        case CLM.ActionTypes.END_SESSION: {
                            const sessionAction = new CLM.SessionAction(action)
                            return sessionAction.renderValue(entityMap, { preserveOptionalNodeWrappingCharacters: true })
                        }
                        case CLM.ActionTypes.SET_ENTITY: {
                            return `set-${action.entityId}-${action.enumValueId}`
                        }
                        default: {
                            console.warn(`Could not get sort value for unknown action type: ${action.actionType}`)
                            return ''
                        }
                    }
                }
                catch (error) {
                    // Action has errors
                    return ''
                }
            },
            render: (action, component) => {
                const isValidationError = component.validationError(action)
                const payloadRenderer = getActionPayloadRenderer(action, component, isValidationError)
                return (
                    <span>
                        {isValidationError &&
                            <OF.Icon
                                className={`cl-icon cl-color-error`}
                                iconName="IncidentTriangle"
                            />
                        }
                        {payloadRenderer}
                    </span>
                )
            }
        },
        {
            key: 'actionType',
            name: Util.formatMessageId(intl, FM.ACTIONDETAILSLIST_COLUMNS_TYPE),
            fieldName: 'metadata',
            minWidth: 100,
            maxWidth: 100,
            isResizable: true,
            getSortValue: action => action.actionType.toLowerCase(),
            render: action => actionTypeRenderer(action)
        },
        {
            key: 'requiredEntities',
            name: Util.formatMessageId(intl, FM.ACTIONDETAILSLIST_COLUMNS_REQUIREDENTITIES),
            fieldName: 'requiredEntities',
            minWidth: 100,
            maxWidth: 200,
            isResizable: true,
            // TODO: Previous implementation returned arrays for these which is incorrect.
            // Should be action.negativeEntities.join('').toLowerCase(), but need entity names which requires lookup
            // This lookup should be done ahead of time instead of on every render
            getSortValue: action => '',
            render: (action, component) => renderConditions(action.requiredEntities, action.requiredConditions, component.props.entities, true)
        },
        {
            key: 'negativeEntities',
            name: Util.formatMessageId(intl, FM.ACTIONDETAILSLIST_COLUMNS_DISQUALIFYINGENTITIES),
            fieldName: 'negativeEntities',
            minWidth: 100,
            maxWidth: 200,
            isResizable: true,
            // TODO: Previous implementation returned arrays for these which is incorrect.
            // Should be action.negativeEntities.join('').toLowerCase(), but need entity names which requires lookup
            // This lookup should be done ahead of time instead of on every render
            getSortValue: action => '',
            render: (action, component) => renderConditions(action.negativeEntities, action.negativeConditions, component.props.entities, false)
        },
        {
            key: 'suggestedEntity',
            name: Util.formatMessageId(intl, FM.ACTIONDETAILSLIST_COLUMNS_SUGGESTEDENTITY),
            fieldName: 'suggestedEntity',
            minWidth: 100,
            maxWidth: 100,
            isResizable: true,
            getSortValue: action => '',
            render: (action, component) => {
                if (!action.suggestedEntity) {
                    return <OF.Icon iconName="Remove" className="cl-icon" data-testid="action-details-empty-expected-entity" />
                }

                const entityId = action.suggestedEntity
                const entity = component.props.entities.find(e => e.entityId === entityId)
                return (
                    <div className='ms-ListItem is-selectable ms-ListItem-primaryText' data-testid="action-details-expected-entity">
                        {entity
                            ? entity.entityName
                            : `Error - Entity ID: ${entityId}`}
                    </div>
                )
            }
        },
        {
            key: 'isTerminal',
            name: Util.formatMessageId(intl, FM.ACTIONDETAILSLIST_COLUMNS_ISTERMINAL),
            fieldName: 'isTerminal',
            minWidth: 50,
            isResizable: false,
            getSortValue: action => action.isTerminal ? 'a' : 'b',
            render: action => <OF.Icon iconName={action.isTerminal ? 'CheckMark' : 'Remove'} className="cl-icon" data-testid="action-details-wait"/>
        },
        {
            key: 'createdDateTime',
            name: Util.formatMessageId(intl, FM.ACTIONDETAILSLIST_COLUMNS_CREATED_DATE_TIME),
            fieldName: 'createdDateTime',
            minWidth: 100,
            isResizable: false,
            getSortValue: action => moment(action.createdDateTime).valueOf().toString(),
            render: action => <span className={OF.FontClassNames.mediumPlus}>{Util.earlierDateOrTimeToday(action.createdDateTime)}</span>
        }
    ]
}

interface IRenderableColumn extends OF.IColumn {
    render: (action: CLM.ActionBase, component: ActionDetailsList) => JSX.Element | JSX.Element[]
    getSortValue: (action: CLM.ActionBase, component: ActionDetailsList) => string
}
