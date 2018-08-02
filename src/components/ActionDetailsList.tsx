/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import { returntypeof } from 'react-redux-typescript'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { ActionBase, ActionTypes, Template, RenderedActionArgument, SessionAction, CardAction, TextAction, ApiAction, RenderAction } from '@conversationlearner/models'
import { State } from '../types'
import * as OF from 'office-ui-fabric-react'
import { onRenderDetailsHeader } from './ToolTips'
import { injectIntl, InjectedIntl, InjectedIntlProps } from 'react-intl'
import { FM } from '../react-intl-messages'
import * as Util from '../util'
import AdaptiveCardViewer from './modals/AdaptiveCardViewer/AdaptiveCardViewer'
import * as ActionPayloadRenderers from './actionPayloadRenderers'
import { Icon } from 'office-ui-fabric-react'
import './ActionDetailsList.css'

interface ComponentState {
    columns: IRenderableColumn[]
    sortColumn: IRenderableColumn
    cardViewerAction: ActionBase | null
}

class ActionDetailsList extends React.Component<Props, ComponentState> {
    constructor(p: any) {
        super(p);
        let columns = getColumns(this.props.intl)
        this.state = {
            columns: columns,
            sortColumn: columns[0],
            cardViewerAction: null
        }
        this.onClickColumnHeader = this.onClickColumnHeader.bind(this);
    }

    validationError(action: ActionBase): boolean {
        switch (action.actionType) {
            case ActionTypes.TEXT: {
                return false
            }
            case ActionTypes.API_LOCAL: {
                const apiAction = new ApiAction(action)
                return !this.props.botInfo.apiCallbacks.some(t => t.name === apiAction.name)
            }
            case ActionTypes.RENDER: {
                const renderAction = new RenderAction(action)
                return !this.props.botInfo.renderCallbacks.some(t => t.name === renderAction.name)
            }
            case ActionTypes.CARD: {
                const cardAction = new CardAction(action)
                return !this.props.botInfo.templates.some(cb => cb.name === cardAction.templateName)
            }
            case ActionTypes.END_SESSION: {
                return false
            }
            default: {
                console.warn(`Could not get validation for unknown action type: ${action.actionType}`)
                return true
            }
        }
    }

    sortActions(): ActionBase[] {
        let actions = [...this.props.actions];
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

    onClickColumnHeader(event: any, clickedColumn: IRenderableColumn) {
        let { columns } = this.state;
        let isSortedDescending = !clickedColumn.isSortedDescending;

        // Reset the items and columns to match the state.
        this.setState({
            columns: columns.map(column => {
                column.isSorted = (column.key === clickedColumn.key);
                column.isSortedDescending = isSortedDescending;
                return column;
            }),
            sortColumn: clickedColumn
        });
    }

    onClickViewCard(action: ActionBase) {
        this.setState({
            cardViewerAction: action
        })
    }

    onClickRow(item: any, index: number | undefined, event: React.FocusEvent<HTMLElement> | undefined) {
        // Don't response to row click if it's button that was clicked
        if (event && (event.target as any).type !== 'button') {
            const action = item as ActionBase
            this.props.onSelectAction(action)
        }
    }

    onCloseCardViewer = () => {
        this.setState({
            cardViewerAction: null
        })
    }

    render() {
        let sortedActions = this.sortActions();

        let template: Template | undefined = undefined
        let renderedActionArguments: RenderedActionArgument[] = []
        if (this.state.cardViewerAction) {
            const cardAction = new CardAction(this.state.cardViewerAction)
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
                    onRenderItemColumn={(action: ActionBase, i, column: IRenderableColumn) => column.render(action, this)}
                    onActiveItemChanged={(item, index, ev) => this.onClickRow(item, index, ev)}
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
    actions: ActionBase[]
    onSelectAction: (action: ActionBase) => void
}

// Props types inferred from mapStateToProps 
const stateProps = returntypeof(mapStateToProps);
type Props = typeof stateProps & ReceivedProps & InjectedIntlProps

export default connect<typeof stateProps, {}, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(ActionDetailsList))

function getActionPayloadRenderer(action: ActionBase, component: ActionDetailsList, isValidationError: boolean) {
    if (action.actionType === ActionTypes.TEXT) {
        const textAction = new TextAction(action)
        return (<ActionPayloadRenderers.TextPayloadRendererContainer
            textAction={textAction}
            entities={component.props.entities}
            memories={null}
        />)
    }
    else if (action.actionType === ActionTypes.API_LOCAL) {
        const apiAction = new ApiAction(action)
        return (<ActionPayloadRenderers.ApiPayloadRendererContainer
            apiAction={apiAction}
            entities={component.props.entities}
            memories={null}
        />)
    }
    // TODO: Consider consolidating to CODE ACTION
    else if (action.actionType === ActionTypes.RENDER) {
        const apiAction = new RenderAction(action)
        return (<ActionPayloadRenderers.ApiPayloadRendererContainer
            apiAction={apiAction}
            entities={component.props.entities}
            memories={null}
        />)
    }
    else if (action.actionType === ActionTypes.CARD) {
        const cardAction = new CardAction(action)
        return (<ActionPayloadRenderers.CardPayloadRendererContainer
            isValidationError={isValidationError}
            cardAction={cardAction}
            entities={component.props.entities}
            memories={null}
            onClickViewCard={() => component.onClickViewCard(action)}
        />)
    }
    else if (action.actionType === ActionTypes.END_SESSION) {
        const sessionAction = new SessionAction(action)
        return (<ActionPayloadRenderers.SessionPayloadRendererContainer
            sessionAction={sessionAction}
            entities={component.props.entities}
            memories={null}
        />)
    }

    return <span className={OF.FontClassNames.mediumPlus}>Unknown Action Type</span>
}

function getColumns(intl: InjectedIntl): IRenderableColumn[] {
    return [
        {
            key: 'actionResponse',
            name: intl.formatMessage({
                id: FM.ACTIONDETAILSLIST_COLUMNS_RESPONSE,
                defaultMessage: 'Response'
            }),
            fieldName: 'actionResponse',
            minWidth: 200,
            maxWidth: 400,
            isResizable: true,
            isMultiline: true,
            isSortedDescending: true,
            getSortValue: (action, component) => {
                const entityMap = Util.getDefaultEntityMap(component.props.entities)

                switch (action.actionType) {
                    case ActionTypes.TEXT: {
                        const textAction = new TextAction(action)
                        return textAction.renderValue(entityMap, { preserveOptionalNodeWrappingCharacters: true })
                    }
                    case ActionTypes.API_LOCAL: {
                        const apiAction = new ApiAction(action)
                        return apiAction.name
                    }
                    case ActionTypes.RENDER: {
                        const renderAction = new RenderAction(action)
                        return renderAction.name
                    }
                    case ActionTypes.CARD: {
                        const cardAction = new CardAction(action)
                        return cardAction.templateName
                    }
                    default: {
                        console.warn(`Could not get sort value for unknown action type: ${action.actionType}`)
                        return ''
                    }
                }
            },
            render: (action, component) => {
                const isValidationError = component.validationError(action)
                const payloadRenderer = getActionPayloadRenderer(action, component, isValidationError)

                return <div className="cl-action-error">
                    {payloadRenderer}
                    {isValidationError &&
                        <div className={OF.FontClassNames.mediumPlus}>
                            <Icon className="cl-icon" iconName="IncidentTriangle" />
                        </div>}
                </div>
            }
        },
        {
            key: 'actionType',
            name: intl.formatMessage({
                id: FM.ACTIONDETAILSLIST_COLUMNS_TYPE,
                defaultMessage: 'Action Type'
            }),
            fieldName: 'metadata',
            minWidth: 100,
            maxWidth: 100,
            isResizable: true,
            getSortValue: action => action.actionType.toLowerCase(),
            render: action => <span className={OF.FontClassNames.mediumPlus}>{action.actionType}</span>
        },
        {
            key: 'requiredEntities',
            name: intl.formatMessage({
                id: FM.ACTIONDETAILSLIST_COLUMNS_REQUIREDENTITIES,
                defaultMessage: 'Required Entities'
            }),
            fieldName: 'requiredEntities',
            minWidth: 100,
            maxWidth: 200,
            isResizable: true,
            // TODO: Previous implementation returned arrays for these which is incorrect.
            // Should be action.negativeEntities.join('').toLowerCase(), but need entity names which requires lookup
            // This lookup should be done ahead of time instead of on every render
            getSortValue: action => '',
            render: (action, component) => action.requiredEntities.length === 0
                ? <OF.Icon iconName="Remove" className="cl-icon" />
                : action.requiredEntities.map(entityId => {
                    const entity = component.props.entities.find(e => e.entityId === entityId)
                    return (
                        <div className='ms-ListItem is-selectable ms-ListItem-primaryText' key={entityId}>
                            {entity
                                ? entity.entityName
                                : `Error - Entity ID: ${entityId}`}
                        </div>
                    )
                })
        },
        {
            key: 'negativeEntities',
            name: intl.formatMessage({
                id: FM.ACTIONDETAILSLIST_COLUMNS_DISQUALIFYINGENTITIES,
                defaultMessage: 'Disqualifying Entities'
            }),
            fieldName: 'negativeEntities',
            minWidth: 100,
            maxWidth: 200,
            isResizable: true,
            // TODO: Previous implementation returned arrays for these which is incorrect.
            // Should be action.negativeEntities.join('').toLowerCase(), but need entity names which requires lookup
            // This lookup should be done ahead of time instead of on every render
            getSortValue: action => '',
            render: (action, component) => action.negativeEntities.length === 0
                ? <OF.Icon iconName="Remove" className="cl-icon" />
                : action.negativeEntities.map(entityId => {
                    const entity = component.props.entities.find(e => e.entityId == entityId)
                    return (
                        <div className='ms-ListItem is-selectable ms-ListItem-primaryText' key={entityId}>
                            {entity
                                ? entity.entityName
                                : `Error - Entity ID: ${entityId}`}
                        </div>
                    )
                })
        },
        {
            key: 'suggestedEntity',
            name: intl.formatMessage({
                id: FM.ACTIONDETAILSLIST_COLUMNS_SUGGESTEDENTITY,
                defaultMessage: 'Expected Entity'
            }),
            fieldName: 'suggestedEntity',
            minWidth: 100,
            maxWidth: 100,
            isResizable: true,
            getSortValue: action => '',
            render: (action, component) => {
                if (!action.suggestedEntity) {
                    return <OF.Icon iconName="Remove" className="cl-icon" />
                }

                const entityId = action.suggestedEntity
                const entity = component.props.entities.find(e => e.entityId === entityId)
                return (
                    <div className='ms-ListItem is-selectable ms-ListItem-primaryText'>
                        {entity
                            ? entity.entityName
                            : `Error - Entity ID: ${entityId}`}
                    </div>
                )
            }
        },
        {
            key: 'isTerminal',
            name: intl.formatMessage({
                id: FM.ACTIONDETAILSLIST_COLUMNS_ISTERMINAL,
                defaultMessage: 'Wait'
            }),
            fieldName: 'isTerminal',
            minWidth: 50,
            maxWidth: 50,
            isResizable: true,
            getSortValue: action => action.isTerminal ? 'a' : 'b',
            render: action => <OF.Icon iconName={action.isTerminal ? 'CheckMark' : 'Remove'} className="cl-icon" />
        }
    ]
}

interface IRenderableColumn extends OF.IColumn {
    render: (action: ActionBase, component: ActionDetailsList) => JSX.Element | JSX.Element[]
    getSortValue: (action: ActionBase, component: ActionDetailsList) => string
}
