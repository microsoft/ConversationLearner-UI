/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as React from 'react'
import * as CLM from '@conversationlearner/models'
import * as OF from 'office-ui-fabric-react'
import * as Util from '../../Utils/util'
import * as DialogUtils from '../../Utils/dialogUtils'
import { actionTypeRenderer, actionListViewRenderer } from '../ActionRenderers'
import AdaptiveCardViewer from './AdaptiveCardViewer/AdaptiveCardViewer'
import { autobind } from 'core-decorators'
import { connect } from 'react-redux'
import { State } from '../../types'
import { onRenderDetailsHeader } from '../ToolTips/ToolTips'
import { injectIntl, InjectedIntl, InjectedIntlProps } from 'react-intl'
import { FM } from '../../react-intl-messages'
import './ActionScorer.css'

interface IRenderableColumn extends OF.IColumn {
    getSortValue: (action: CLM.ActionBase, component: ActionSelector) => number | string
    render: (action: CLM.ActionBase, component: ActionSelector, index: number) => React.ReactNode
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
                const refFn = (index === 0)
                    ? component.primaryScoreButtonRef
                    : undefined
                
                return (
                    <OF.PrimaryButton
                        data-testid="action-scorer-button-clickable"
                        onClick={() => component.handleActionSelection(action)}
                        ariaDescription={Util.formatMessageId(intl, FM.BUTTON_SELECT)}
                        text={Util.formatMessageId(intl, FM.BUTTON_SELECT)}
                        componentRef={refFn}
                    />
                )
            }
        },
        {
            key: 'actionResponse',
            name: Util.formatMessageId(intl, FM.ACTIONLIST_COLUMNS_RESPONSE),
            fieldName: 'actionResponse',
            minWidth: 100,
            maxWidth: 500,
            isMultiline: true,
            isResizable: true,
            getSortValue: () => '',
            render: (action: CLM.ActionBase, component) => {
                return actionListViewRenderer(action,
                    component.props.entities,
                    [],
                    component.props.botInfo.callbacks,
                    component.onClickViewCard)
            }
        },
        {
            key: 'actionEntities',
            name: Util.formatMessageId(intl, FM.ACTIONLIST_COLUMNS_CONDITIONS),
            fieldName: 'entities',
            minWidth: 100,
            maxWidth: 300,
            isResizable: true,
            getSortValue: () => '',
            render: (action, component) => component.renderEntityRequirements(action.actionId)
        },
        {
            key: 'isTerminal',
            name: Util.formatMessageId(intl, FM.ACTIONLIST_COLUMNS_ISTERMINAL),
            fieldName: 'isTerminal',
            minWidth: 50,
            maxWidth: 50,
            isResizable: true,
            getSortValue: action => action.isTerminal ? 1 : -1,
            render: action => <OF.Icon
                iconName={(action.isTerminal ? "CheckMark" : "Remove")}
                className={`cl-icon${action.isTerminal ? " checkIcon" : " notFoundIcon"}`}
                data-testid="action-scorer-wait"
            />
        },
        {
            key: 'actionReprompt',
            name: Util.formatMessageId(intl, FM.ACTIONLIST_COLUMNS_REPROMPT),
            fieldName: 'actionReprompt',
            minWidth: 70,
            isResizable: false,
            getSortValue: action => action.repromptActionId !== undefined ? 'a' : 'b',
            render: action => <OF.Icon iconName={action.repromptActionId !== undefined ? 'CheckMark' : 'Remove'} className="cl-icon" data-testid="action-details-wait" />
        },
        {
            key: 'actionType',
            name: Util.formatMessageId(intl, FM.ACTIONLIST_COLUMNS_TYPE),
            fieldName: 'actionType',
            minWidth: 80,
            maxWidth: 80,
            isResizable: true,
            getSortValue: action => action.actionType.toLowerCase(),
            render: (scoredBase, component) => {
                let action = component.props.actions.find(a => a.actionId === scoredBase.actionId)
                return actionTypeRenderer(action)
            }
        },
    ]
}

interface ComponentState {
    columns: OF.IColumn[]
    cardViewerAction: CLM.ActionBase | null
    cardViewerShowOriginal: boolean
}

class ActionSelector extends React.Component<Props, ComponentState> {
    primaryScoreButtonRef = React.createRef<OF.IButton>()

    constructor(p: Props) {
        super(p)

        const columns = getColumns(this.props.intl)
        this.state = {
            columns,
            cardViewerAction: null,
            cardViewerShowOriginal: false
        }
    }

    @autobind
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

    @autobind
    focusPrimaryButton(): void {
        if (this.primaryScoreButtonRef.current) {
            this.primaryScoreButtonRef.current.focus()
        }
        else {
            setTimeout(this.focusPrimaryButton, 100)
        }
    }

    @autobind
    async handleActionSelection(action: CLM.ActionBase) {
        this.props.onClose(action.actionId)
    }

    renderEntityRequirements(actionId: string) {
        if (actionId === Util.PLACEHOLDER_SET_ENTITY_ACTION_ID) {
            return null
        }

        const action = this.props.actions.find(a => a.actionId === actionId)

        // If action is null - there's a bug somewhere
        if (!action) {
            return <div className={OF.FontClassNames.mediumPlus}>ERROR: Missing Action</div>
        }

        const items = []
        for (const entityId of action.requiredEntities) {
            const found = DialogUtils.entityInMemory(entityId, this.props.entities, [])
            items.push({name: found.name, neg: false
            })
        }
        for (const entityId of action.negativeEntities) {
            const found = DialogUtils.entityInMemory(entityId, this.props.entities, [])
            items.push({name: found.name, neg: true
            })
        }
        if (action.requiredConditions) {
            for (const condition of action.requiredConditions) {
                const result = DialogUtils.convertToScorerCondition(condition, this.props.entities, [])
                items.push({name: result.name, neg: false
                })
            }
        }
        if (action.negativeConditions) {
            for (const condition of action.negativeConditions) {
                const result = DialogUtils.convertToScorerCondition(condition, this.props.entities, [])
                items.push({name: result.name, neg: true
                })
            }
        }
        return (
            <OF.List
                items={items}
                onRenderCell={(item, index) => {
                    if (!item) {
                        return null
                    }

                    return <span className={'cl-entity cl-entity--match'} data-testid="action-scorer-entities">{item.neg ? (<del>{item.name}</del>) : item.name}</span>
                }}
            />
        )
    }

    @autobind
    renderItemColumn(action: CLM.ActionBase, index: number, column: IRenderableColumn) {
        return column.render(action, this, index)
    }

    render() {
        let template: CLM.Template | undefined
        let renderedActionArguments: CLM.RenderedActionArgument[] = []
        if (this.state.cardViewerAction) {
            const cardAction = new CLM.CardAction(this.state.cardViewerAction)
            const entityMap = Util.getDefaultEntityMap(this.props.entities)
            template = this.props.botInfo.templates.find((t) => t.name === cardAction.templateName)
            renderedActionArguments = this.state.cardViewerShowOriginal
                ? cardAction.renderArguments(entityMap, { preserveOptionalNodeWrappingCharacters: true })
                : cardAction.renderArguments(Util.createEntityMapFromMemories(this.props.entities, []), { fallbackToOriginal: true })
        }

        return (
            <OF.Modal
                isOpen={this.props.open}
                isBlocking={false}
                containerClassName="cl-modal cl-modal--medium"
            >
                <div className='cl-modal_header'>
                    <span className={OF.FontClassNames.xxLarge}>
                        {Util.formatMessageId(this.props.intl, FM.ACTIONSELECTOR_TITLE)}
                    </span>
                </div>
                <div>
                    <OF.DetailsList
                        className={OF.FontClassNames.mediumPlus}
                        items={this.props.actions}
                        columns={this.state.columns}
                        checkboxVisibility={OF.CheckboxVisibility.hidden}
                        onRenderItemColumn={this.renderItemColumn}
                        onRenderDetailsHeader={(
                            detailsHeaderProps: OF.IDetailsHeaderProps,
                            defaultRender: OF.IRenderFunction<OF.IDetailsHeaderProps>) =>
                            onRenderDetailsHeader(detailsHeaderProps, defaultRender)}
                    />
                </div>
                <AdaptiveCardViewer
                    open={this.state.cardViewerAction != null}
                    onDismiss={() => this.onCloseCardViewer()}
                    template={template}
                    actionArguments={renderedActionArguments}
                    hideUndefined={true}
                />
            </OF.Modal>
        )
    }
}

export interface ReceivedProps {
    open: boolean,
    actions: CLM.ActionBase[],
    onClose: (actionId: string | undefined) => void
}

const mapStateToProps = (state: State) => {
    if (!state.bot.botInfo) {
        throw new Error(`You attempted to render the ActionScorer which requires botInfo, but botInfo was not defined. This is likely a problem with higher level component. Please open an issue.`)
    }

    return {
        user: state.user.user,
        entities: state.entities,
        botInfo: state.bot.botInfo
    }
}

// Props types inferred from mapStateToProps & dispatchToProps
type stateProps = ReturnType<typeof mapStateToProps>
type Props = stateProps & ReceivedProps & InjectedIntlProps

export default connect<stateProps, {}, ReceivedProps>(mapStateToProps, {})(injectIntl(ActionSelector))