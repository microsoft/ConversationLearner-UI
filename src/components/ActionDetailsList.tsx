/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { connect } from 'react-redux';
import { ActionBase, ActionTypes, Template, RenderedActionArgument, CardAction, TextAction, ApiAction } from '@conversationlearner/models'
import { State } from '../types'
import * as OF from 'office-ui-fabric-react';
import { onRenderDetailsHeader } from './ToolTips'
import { injectIntl, InjectedIntl, InjectedIntlProps } from 'react-intl'
import { FM } from '../react-intl-messages'
import * as Util from '../util'
import AdaptiveCardViewer from './modals/AdaptiveCardViewer/AdaptiveCardViewer'
import * as ActionPayloadRenderers from './actionPayloadRenderers'

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
                return null;
            }
            case ActionTypes.API_LOCAL: {
                const apiAction = new ApiAction(action)
                return (!this.props.botInfo.callbacks || !this.props.botInfo.callbacks.find(t => t.name === apiAction.name))
            }
            case ActionTypes.CARD: {
                const cardAction = new CardAction(action)
                return (!this.props.botInfo.templates || !this.props.botInfo.templates.find(cb => cb.name === cardAction.templateName))
            }
            default: {
                console.warn(`Could not get validation for unknown action type: ${action.actionType}`)
                return true;
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

    onClickRow(item: any, index: number, ev: React.FocusEvent<HTMLElement>) {
        // Don't response to row click if it's button that was clicked
        if ((ev.target as any).type !== 'button') {
            let action = item as ActionBase;
            if (this.props.onSelectAction) {
                this.props.onSelectAction(action);
            }
        }
    }

    onCloseCardViewer = () => {
        this.setState({
            cardViewerAction: null
        })
    }

    render() {
        let sortedActions = this.sortActions();

        let template: Template = null;
        let renderedActionArguments: RenderedActionArgument[] = [];
        if (this.state.cardViewerAction) {
            const cardAction = new CardAction(this.state.cardViewerAction)
            const entityMap = Util.getDefaultEntityMap(this.props.entities)
            template = this.props.botInfo.templates.find((t) => t.name === cardAction.templateName);
            // TODO: This is hack to make adaptive card viewer accept action arguments with pre-rendered values
            renderedActionArguments = cardAction.renderArguments(entityMap)
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
                    open={this.state.cardViewerAction != null}
                    onDismiss={() => this.onCloseCardViewer()}
                    template={template}
                    actionArguments={renderedActionArguments}
                    hideUndefined={true}
                />
            </div>
        )
    }
}

const mapStateToProps = (state: State) => {
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

export default connect<typeof stateProps, {}, ReceivedProps>(mapStateToProps, null)(injectIntl(ActionDetailsList))

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
                const entityMap = Util.getDefaultEntityMap(component.props.entities)
                const isValidationError = component.validationError(action)

                if (action.actionType === ActionTypes.TEXT) {
                    const textAction = new TextAction(action)
                    return <ActionPayloadRenderers.TextPayloadRendererContainer
                        textAction={textAction}
                        entities={component.props.entities}
                        memories={null}
                    />
                }
                else if (action.actionType === ActionTypes.API_LOCAL) {
                    const apiAction = new ApiAction(action)
                    return <ActionPayloadRenderers.ApiPayloadRendererContainer
                        apiAction={apiAction}
                        entities={component.props.entities}
                        memories={null}
                    />
                }
                else if (action.actionType === ActionTypes.CARD) {
                    const cardAction = new CardAction(action)
                    return <ActionPayloadRenderers.CardPayloadRendererContainer
                        isValidationError={isValidationError}
                        cardAction={cardAction}
                        entities={component.props.entities}
                        memories={null}
                        onClickViewCard={() => component.onClickViewCard(action)}
                    />
                }

                return <span className={OF.FontClassNames.mediumPlus}>{ActionBase.GetPayload(action, entityMap)}</span>
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
                        <div className='ms-ListItem is-selectable' key={entityId}>
                            <span className='ms-ListItem-primaryText'>{entity.entityName}</span>
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
                        <div className='ms-ListItem is-selectable' key={entityId}>
                            <span className='ms-ListItem-primaryText'>{entity.entityName}</span>
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

                const expectedEntity = component.props.entities.find(e => e.entityId === action.suggestedEntity)
                return (
                    <div className='ms-ListItem is-selectable'>
                        <span className='ms-ListItem-primaryText'>{expectedEntity.entityName}</span>
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

interface ComponentState {
    columns: IRenderableColumn[]
    sortColumn: IRenderableColumn
    cardViewerAction: ActionBase
}