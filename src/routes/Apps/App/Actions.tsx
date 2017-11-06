import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createActionAsync } from '../../../actions/createActions'
import { editActionAsync } from '../../../actions/updateActions'
import { deleteActionAsync } from '../../../actions/deleteActions'
import ActionDetailsList from '../../../components/ActionDetailsList'
import * as OF from 'office-ui-fabric-react';
import { BlisAppBase, ActionBase } from 'blis-models'
import { ActionEditor } from '../../../components/modals'
import { State } from '../../../types'
import { FM } from '../../../react-intl-messages'
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl'

interface ComponentState {
    actionSelected: ActionBase | null
    actionIDToDelete: string
    isConfirmDeleteActionModalOpen: boolean
    isActionEditorModalOpen: boolean
    searchValue: string
    isActionEditorOpen: boolean
    useNewActionEditor: boolean
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
            useNewActionEditor: false
        }

        this.onSelectAction = this.onSelectAction.bind(this)
        this.onChangeSearchString = this.onChangeSearchString.bind(this)
    }

    componentDidMount() {
        this.newActionButton.focus();
    }

    onSelectAction(action: ActionBase) {
        this.setState({
            actionSelected: action,
            isActionEditorOpen: true
        })
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
        })
    }

    onClickDeleteActionEditor(action: ActionBase) {
        this.setState({
            isActionEditorOpen: false,
            actionSelected: null
        }, () => {
            console.log(`Actions.onClickDeleteActionEditor`)
            this.props.deleteActionAsync(this.props.user.key, action.actionId, action, this.props.app.appId)
        })
    }

    onClickSubmitActionEditor(action: ActionBase) {
        const wasEditing = this.state.actionSelected

        this.setState({
            isActionEditorOpen: false,
            actionSelected: null
        }, () => {
            console.group(`Actions.onClickSubmitActionEditor`)
            if (wasEditing) {
                console.log(`editActionAsync`)
                this.props.editActionAsync(this.props.user.key, action, this.props.app.appId)
            }
            else {
                console.log(`createActionAsync`)
                this.props.createActionAsync(this.props.user.key, action, this.props.app.appId)
            }
            console.groupEnd()
        })
    }

    getFilteredActions(): ActionBase[] {
        //runs when user changes the text 
        let lcString = this.state.searchValue.toLowerCase();
        let filteredActions = this.props.actions.filter(a => {
            let nameMatch = a.payload.toLowerCase().includes(lcString);
            let typeMatch = a.metadata.actionType ? a.metadata.actionType.toLowerCase().includes(lcString) : true;
            let negativeEntities = a.negativeEntities.map(entityId => {
                let found = this.props.entities.find(e => e.entityId == entityId);
                return found.entityName;
            })
            let positiveEntities = a.requiredEntities.map(entityId => {
                let found = this.props.entities.find(e => e.entityId == entityId);
                return found.entityName;
            })
            let requiredEnts = positiveEntities.join('');
            let negativeEnts = negativeEntities.join('');
            let reqEntsMatch = requiredEnts.toLowerCase().includes(lcString);
            let negEntsMatch = negativeEnts.toLowerCase().includes(lcString);
            let match = nameMatch || typeMatch || reqEntsMatch || negEntsMatch
            return match;
        })

        return filteredActions;
    }

    onChangeSearchString(searchString: string) {
        this.setState({
            searchValue: searchString.toLowerCase()
        })
    }

    onChangedUseNewactionEditor = (useNewActionEditor: boolean) => {
        this.setState({
            useNewActionEditor
        })
    }

    render() {
        // TODO: Look to move this up to the set state calls instead of forcing it to be on every render
        const actions = this.getFilteredActions();
        return (
            <div className="blis-page">
                <span className="ms-font-xxl">
                    <FormattedMessage
                        id={FM.ACTIONS_TITLE}
                        defaultMessage="Actions"
                    />
                </span>
                <span className="ms-font-m-plus">
                    <FormattedMessage
                        id={FM.ACTIONS_SUBTITLE}
                        defaultMessage="Manage a list of actions that your application can take given it's state and user input..."
                    />
                </span>
                <div>
                    <OF.PrimaryButton
                        onClick={() => this.onClickOpenActionEditor()}
                        ariaDescription={this.props.intl.formatMessage({
                            id: FM.ACTIONS_CREATEBUTTONARIALDESCRIPTION,
                            defaultMessage: 'Create a New Action'
                        })}
                        text={this.props.intl.formatMessage({
                            id: FM.ACTIONS_CREATEBUTTONTITLE,
                            defaultMessage: 'New Action'
                        })}
                        componentRef={component => this.newActionButton = component}
                    />
                </div>
                <OF.SearchBox
                    className="ms-font-m-plus"
                    onChange={searchString => this.onChangeSearchString(searchString)}
                    onSearch={searchString => this.onChangeSearchString(searchString)}
                />
                <ActionDetailsList
                    actions={actions}
                    onSelectAction={this.onSelectAction}
                />

                <ActionEditor
                    app={this.props.app}
                    open={this.state.isActionEditorOpen}
                    action={this.state.actionSelected}
                    onClickCancel={() => this.onClickCancelActionEditor()}
                    onClickDelete={action => this.onClickDeleteActionEditor(action)}
                    onClickSubmit={action => this.onClickSubmitActionEditor(action)}
                />
            </div>
        );
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        createActionAsync,
        editActionAsync,
        deleteActionAsync
    }, dispatch)
}
const mapStateToProps = (state: State) => {
    return {
        user: state.user,
        actions: state.actions,
        entities: state.entities
    }
}

export interface ReceivedProps {
    app: BlisAppBase
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps;

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(Actions))
