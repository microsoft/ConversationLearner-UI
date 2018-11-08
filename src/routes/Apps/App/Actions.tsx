/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import actions from '../../../actions'
import ActionDetailsList from '../../../components/ActionDetailsList'
import * as OF from 'office-ui-fabric-react';
import * as Utils from '../../../Utils/util'
import { AppBase, ActionBase } from '@conversationlearner/models'
import { ActionCreatorEditor } from '../../../components/modals'
import { State } from '../../../types'
import { FM } from '../../../react-intl-messages'
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl'

interface ComponentState {
    actionSelected: ActionBase | null
    actionIDToDelete: string | null
    isConfirmDeleteActionModalOpen: boolean
    isActionEditorModalOpen: boolean
    searchValue: string
    isActionEditorOpen: boolean
}

class Actions extends React.Component<Props, ComponentState> {
    newActionButton: OF.IButton

    constructor(p: any) {
        super(p);
        this.state = {
            actionIDToDelete: null,
            actionSelected: null,
            searchValue: '',
            isConfirmDeleteActionModalOpen: false,
            isActionEditorModalOpen: false,
            isActionEditorOpen: false,
        }

        this.onSelectAction = this.onSelectAction.bind(this)
        this.onChangeSearchString = this.onChangeSearchString.bind(this)
    }

    componentDidMount() {
        this.newActionButton.focus();
    }

    onSelectAction(action: ActionBase) {
        if (this.props.editingPackageId === this.props.app.devPackageId) {
            this.setState({
                actionSelected: action,
                isActionEditorOpen: true
            })
        }
    }

    onClickOpenActionEditor() {
        this.setState({
            isActionEditorOpen: true,
            actionSelected: null
        })
    }

    onClickCancelActionEditor() {
        this.setState({
            isActionEditorOpen: false,
            actionSelected: null
        }, () => {
            setTimeout(() => this.newActionButton.focus(), 500)
        })
    }

    onClickDeleteActionEditor(action: ActionBase) {
        Utils.setStateAsync(this, {
            isActionEditorOpen: false,
            actionSelected: null
        })
        
        this.props.deleteActionThunkAsync(this.props.app.appId, action.actionId)
        setTimeout(() => this.newActionButton.focus(), 1000)
    }

    onClickSubmitActionEditor(action: ActionBase) {
        const wasEditing = this.state.actionSelected
        Utils.setStateAsync(this, {
            isActionEditorOpen: false,
            actionSelected: null
        })
        
        const apiFunc = wasEditing
            ? () => this.props.editActionThunkAsync(this.props.app.appId, action)
            : () => this.props.createActionThunkAsync(this.props.app.appId, action)
        apiFunc()
        setTimeout(() => this.newActionButton.focus(), 500)
    }

    getFilteredActions(): ActionBase[] {
        //runs when user changes the text 
        const searchStringLower = this.state.searchValue.toLowerCase()
        return this.props.actions.filter(a => {
            const nameMatch = a.payload.toLowerCase().includes(searchStringLower)
            const typeMatch = a.actionType.toLowerCase().includes(searchStringLower)
            const entities = this.props.entities
                .filter(e => [...a.requiredEntities, ...a.negativeEntities, ...(a.suggestedEntity ? [a.suggestedEntity] : [])].includes(e.entityId))
            const entityMatch = entities.some(e => e.entityName.toLowerCase().includes(searchStringLower))

            return nameMatch || typeMatch || entityMatch
        })
    }

    onChangeSearchString(searchString: string) {
        this.setState({
            searchValue: searchString.toLowerCase()
        })
    }

    render() {
        // TODO: Look to move this up to the set state calls instead of forcing it to be on every render
        const { actions } = this.props
        const computedActions = this.getFilteredActions()
        return (
            <div className="cl-page">
                <span data-testid="actions-title" className={OF.FontClassNames.xxLarge}>
                    <FormattedMessage
                        id={FM.ACTIONS_TITLE}
                        defaultMessage="Actions"
                    />
                </span>
                {this.props.editingPackageId === this.props.app.devPackageId
                    ? <span className={OF.FontClassNames.mediumPlus}>
                        <FormattedMessage
                            id={FM.ACTIONS_SUBTITLE}
                            defaultMessage="Actions are executed by the bot in response to user input"
                        />
                    </span>
                    : <span className="cl-errorpanel">Editing is only allowed in Master Tag</span>
                }
                <div>
                    <OF.PrimaryButton
                        data-testid="actions-button-create"
                        disabled={this.props.editingPackageId !== this.props.app.devPackageId}
                        onClick={() => this.onClickOpenActionEditor()}
                        ariaDescription={this.props.intl.formatMessage({
                            id: FM.ACTIONS_CREATEBUTTONARIADESCRIPTION,
                            defaultMessage: 'Create a New Action'
                        })}
                        text={this.props.intl.formatMessage({
                            id: FM.ACTIONS_CREATEBUTTONTITLE,
                            defaultMessage: 'New Action'
                        })}
                        componentRef={component => this.newActionButton = component!}
                    />
                </div>
                {actions.length === 0
                    ? <div className="cl-page-placeholder">
                        <div className="cl-page-placeholder__content">
                            <div className={`cl-page-placeholder__description ${OF.FontClassNames.xxLarge}`} data-testid="create-an-action-title">Create an Action</div>
                            <OF.PrimaryButton
                                iconProps={{
                                    iconName: "Add"
                                }}
                                disabled={this.props.editingPackageId !== this.props.app.devPackageId}
                                onClick={() => this.onClickOpenActionEditor()}
                                ariaDescription={this.props.intl.formatMessage({
                                    id: FM.ACTIONS_CREATEBUTTONARIADESCRIPTION,
                                    defaultMessage: 'Create a New Action'
                                })}
                                text={this.props.intl.formatMessage({
                                    id: FM.ACTIONS_CREATEBUTTONTITLE,
                                    defaultMessage: 'New Action'
                                })}
                            />
                        </div>
                    </div>
                    : <React.Fragment>
                        <div>
                            <OF.Label htmlFor="entities-input-search" className={OF.FontClassNames.medium}>
                                Search:
                            </OF.Label>
                            <OF.SearchBox
                                id="actions-input-search"
                                data-testid="actions-input-search"
                                className={OF.FontClassNames.mediumPlus}
                                onChange={searchString => this.onChangeSearchString(searchString)}
                                onSearch={searchString => this.onChangeSearchString(searchString)}
                            />
                        </div>
                        <ActionDetailsList
                            actions={computedActions}
                            onSelectAction={this.onSelectAction}
                        />
                    </React.Fragment>}

                <ActionCreatorEditor
                    app={this.props.app}
                    editingPackageId={this.props.editingPackageId}
                    open={this.state.isActionEditorOpen}
                    action={this.state.actionSelected}
                    handleClose={() => this.onClickCancelActionEditor()}
                    handleDelete={action => this.onClickDeleteActionEditor(action)}
                    handleEdit={action => this.onClickSubmitActionEditor(action)}
                />
            </div>
        );
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        createActionThunkAsync: actions.action.createActionThunkAsync,
        editActionThunkAsync: actions.action.editActionThunkAsync,
        deleteActionThunkAsync: actions.action.deleteActionThunkAsync,
        fetchApplicationTrainingStatusThunkAsync: actions.app.fetchApplicationTrainingStatusThunkAsync
    }, dispatch)
}
const mapStateToProps = (state: State) => {
    return {
        actions: state.actions,
        entities: state.entities
    }
}

export interface ReceivedProps {
    app: AppBase
    editingPackageId: string
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps;

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(Actions) as any)
