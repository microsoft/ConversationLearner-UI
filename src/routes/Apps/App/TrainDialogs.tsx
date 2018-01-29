import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as OF from 'office-ui-fabric-react';
import { State } from '../../../types'
import { BlisAppBase, Teach, TrainDialog, TeachWithHistory, AppDefinition, ActionBase } from 'blis-models'
import { TeachSessionModal, TrainDialogModal } from '../../../components/modals'
import { fetchHistoryThunkAsync, fetchApplicationTrainingStatusThunkAsync } from '../../../actions/fetchActions'
import { createTeachSessionThunkAsync, 
    createTeachSessionFromUndoThunkAsync, 
    createTeachSessionFromHistoryThunkAsync } from '../../../actions/createActions'
import { deleteTrainDialogThunkAsync } from '../../../actions/deleteActions';    
import { injectIntl, InjectedIntl, InjectedIntlProps, FormattedMessage } from 'react-intl'
import { FM } from '../../../react-intl-messages'
import { setErrorDisplay } from '../../../actions/displayActions';
import { ErrorType } from '../../../types/const';
import { Activity } from 'botframework-directlinejs';

interface IRenderableColumn extends OF.IColumn {
    render: (x: TrainDialog, component: TrainDialogs) => React.ReactNode
}

const returnStringWhenError = (s: string) => {
    return (f: Function) => {
        try {
            return f()
        }
        catch (err) {
            return s
        }
    }
}

const returnErrorStringWhenError = returnStringWhenError("ERR")

function getColumns(intl: InjectedIntl): IRenderableColumn[] {
    return [
        {
            key: 'firstInput',
            name: intl.formatMessage({
                id: FM.TRAINDIALOGS_FIRSTINPUT,
                defaultMessage: 'First Input'
            }),
            fieldName: 'firstInput',
            minWidth: 100,
            maxWidth: 500,
            isResizable: true,
            render: trainDialog => {
                if (trainDialog.rounds && trainDialog.rounds.length > 0) {
                    const text = trainDialog.rounds[0].extractorStep.textVariations[0].text
                    return <span className={OF.FontClassNames.mediumPlus}>{text}</span>
                }
                return <OF.Icon iconName="Remove" className="notFoundIcon" />
            }
        },
        {
            key: 'lastInput',
            name: intl.formatMessage({
                id: FM.TRAINDIALOGS_LASTINPUT,
                defaultMessage: 'Last Input'
            }),
            fieldName: 'lastInput',
            minWidth: 100,
            maxWidth: 500,
            isResizable: true,
            render: trainDialog => {
                if (trainDialog.rounds && trainDialog.rounds.length > 0) {
                    const text = trainDialog.rounds[trainDialog.rounds.length - 1].extractorStep.textVariations[0].text;
                    return <span className={OF.FontClassNames.mediumPlus}>{text}</span>
                }
                return <OF.Icon iconName="Remove" className="notFoundIcon" />
            }
        },
        {
            key: 'lastResponse',
            name: intl.formatMessage({
                id: FM.TRAINDIALOGS_LASTRESPONSE,
                defaultMessage: 'Last Response'
            }),
            fieldName: 'lastResponse',
            minWidth: 100,
            maxWidth: 500,
            isResizable: true,
            render: (trainDialog, component) => {
                // Find last action of last scorer step of last round
                // If found, return payload, otherwise return not found icon
                if (trainDialog.rounds && trainDialog.rounds.length > 0) {
                    let scorerSteps = trainDialog.rounds[trainDialog.rounds.length - 1].scorerSteps;
                    if (scorerSteps.length > 0) {
                        let actionId = scorerSteps[scorerSteps.length - 1].labelAction;
                        let action = component.props.actions.find(a => a.actionId == actionId);
                        if (action) {
                            return <span className={OF.FontClassNames.mediumPlus}>{ActionBase.GetPayload(action)}</span>;
                        }
                    }
                }

                return <OF.Icon iconName="Remove" className="notFoundIcon" />;
            }
        },
        {
            key: 'turns',
            name: intl.formatMessage({
                id: FM.TRAINDIALOGS_TURNS,
                defaultMessage: 'Turns'
            }),
            fieldName: 'dialog',
            minWidth: 50,
            maxWidth: 50,
            isResizable: true,
            render: trainDialog => {
                let count = trainDialog.rounds ? trainDialog.rounds.length : 0
                return <span className={OF.FontClassNames.mediumPlus}>{count}</span>
            }
        }
    ]
}

interface ComponentState {
    columns: OF.IColumn[],
    teachSession: Teach,
    activities: Activity[]
    isTeachDialogModalOpen: boolean
    isTrainDialogModalOpen: boolean
    trainDialogId: string
    searchValue: string,
    dialogKey: number
}

class TrainDialogs extends React.Component<Props, ComponentState> {
    newTeachSessionButton: OF.IButton

    state: ComponentState = {
        columns: getColumns(this.props.intl),
        teachSession: null,
        activities: [],
        isTeachDialogModalOpen: false,
        isTrainDialogModalOpen: false,
        trainDialogId: null,
        searchValue: '',
        dialogKey: 0
    }

    componentDidMount() {
        this.newTeachSessionButton.focus();
    }

    componentWillReceiveProps(newProps: Props) {
        // If train dialogs have been updated, update selected trainDialog too
        if (this.props.trainDialogs !== newProps.trainDialogs) {
            if (this.state.trainDialogId) {
                let newTrainDialog = newProps.trainDialogs.find(t => t.trainDialogId === this.state.trainDialogId);
                this.setState({
                    trainDialogId: newTrainDialog ? newTrainDialog.trainDialogId : null
                })
            }
            this.newTeachSessionButton.focus();
        }
    }

    onClickNewTeachSession() {
        // TODO: Find cleaner solution for the types.  Thunks return functions but when using them on props they should be returning result of the promise.
        ((this.props.createTeachSessionThunkAsync(this.props.user.id, this.props.app.appId) as any) as Promise<Teach>)
            .then(teachSession => {
                this.setState({
                    teachSession,
                    isTeachDialogModalOpen: true
                })
            })
            .catch(error => {
                console.warn(`Error when attempting to create teach session: `, error)
            })
    }

    onCloseTeachSession() {
        this.setState({
            teachSession: null,
            isTeachDialogModalOpen: false,
            activities: null,
            dialogKey: this.state.dialogKey + 1
        })
    }

    onUndoTeachStep() {
        ((this.props.createTeachSessionFromUndoThunkAsync(this.props.app.appId, this.state.teachSession, this.props.user.name, this.props.user.id) as any) as Promise<TeachWithHistory>)
        .then(teachWithHistory => {
            if (teachWithHistory.discrepancies.length === 0) {
                this.setState({
                    teachSession: teachWithHistory.teach, 
                    activities: teachWithHistory.history,
                })
            }
            else {
                let unable = this.props.intl.formatMessage({
                    id: FM.VALIDATE_UNABLE_TO_UNDO,
                    defaultMessage: 'Unable to Undo'
                })
                let reason = this.props.intl.formatMessage({
                    id: FM.VALIDATE_ENTITY_REASON,
                    defaultMessage: `Entities don't match.`
                })
                this.props.setErrorDisplay(
                    ErrorType.Error, unable, 
                    [reason, ...teachWithHistory.discrepancies], null);             
            }
        })
        .catch(error => {
            console.warn(`Error when attempting to create teach session from undo: `, error)
        })
    }

    onDeleteTrainDialog() {
        
        this.props.deleteTrainDialogThunkAsync(this.props.user.id, this.props.app.appId, this.state.trainDialogId)
        this.props.fetchApplicationTrainingStatusThunkAsync(this.props.app.appId)
        this.onCloseTrainDialogModal();
    }

    onBranchTrainDialog(turnIndex: number) {
        
        let trainDialog = this.props.trainDialogs.find(td => td.trainDialogId === this.state.trainDialogId);

        // Create new train dialog, removing turns above the branch
        let newTrainDialog = new TrainDialog({
            rounds: trainDialog.rounds.slice(0, turnIndex),
            definitions: new AppDefinition({
                entities: this.props.entities,
                actions: this.props.actions
            })
        });

        ((this.props.createTeachSessionFromHistoryThunkAsync(this.props.app.appId, newTrainDialog, this.props.user.name, this.props.user.id) as any) as Promise<TeachWithHistory>)
        .then(teachWithHistory => {
            if (teachWithHistory.discrepancies.length === 0) {
                this.setState({
                    teachSession: teachWithHistory.teach, 
                    activities: teachWithHistory.history,
                    trainDialogId: null,
                    isTrainDialogModalOpen: false,
                    isTeachDialogModalOpen: true
                })
            }
            else {
                let unable = this.props.intl.formatMessage({
                    id: FM.VALIDATE_UNABLE_TO_BRANCH,
                    defaultMessage: 'Unable to Branch'
                })
                let reason = this.props.intl.formatMessage({
                    id: FM.VALIDATE_ENTITY_REASON,
                    defaultMessage: `Entities don't match.`
                })
                this.props.setErrorDisplay(
                    ErrorType.Error, unable, 
                    [reason, ...teachWithHistory.discrepancies], null);            
            }
        })
        .catch(error => {
            console.warn(`Error when attempting to create teach session from branch: `, error)
        })
    }

    onEditTrainDialog(sourceTrainDialogId: string, newTrainDialog: TrainDialog) {
        
        this.props.deleteTrainDialogThunkAsync(this.props.user.id, this.props.app.appId,sourceTrainDialogId);
        
        ((this.props.createTeachSessionFromHistoryThunkAsync(this.props.app.appId, newTrainDialog, this.props.user.name, this.props.user.id) as any) as Promise<TeachWithHistory>)
        .then(teachWithHistory => {
            if (teachWithHistory.discrepancies.length === 0) {
                this.setState({
                    teachSession: teachWithHistory.teach, 
                    activities: teachWithHistory.history,
                    trainDialogId: null,
                    isTrainDialogModalOpen: false,
                    isTeachDialogModalOpen: true
                })
            }
            else {
                let unable = this.props.intl.formatMessage({
                    id: FM.VALIDATE_UNABLE_TO_EDIT,
                    defaultMessage: 'Unable to Edit'
                })
                let reason = this.props.intl.formatMessage({
                    id: FM.VALIDATE_ENTITY_REASON,
                    defaultMessage: `Entities don't match.`
                })
                this.props.setErrorDisplay(
                    ErrorType.Error, unable, 
                    [reason, ...teachWithHistory.discrepancies], null);
             }
        })
        .catch(error => {
            console.warn(`Error when attempting to create teach session from train dialog: `, error)
        })
    }

    onClickTrainDialogItem(trainDialog: TrainDialog) {

        let definitions = new AppDefinition({
            actions: this.props.actions,
            entities: this.props.entities
            })

        let trainDialogWithDefinitions = new TrainDialog({
            rounds: trainDialog.rounds,
            definitions: definitions
        });

        ((this.props.fetchHistoryThunkAsync(this.props.app.appId, trainDialogWithDefinitions, this.props.user.name, this.props.user.id) as any) as Promise<Activity[]>)
        .then(activities => {
            this.setState({
                activities: activities,
                trainDialogId: trainDialog.trainDialogId,
                isTrainDialogModalOpen: true
            })
        })
        .catch(error => {
            console.warn(`Error when attempting to create history: `, error)
        })
    }

    onCloseTrainDialogModal() {
        this.setState({
            isTrainDialogModalOpen: false,
            trainDialogId: null,
            activities: null,
            dialogKey: this.state.dialogKey + 1
        })
    }

    onChangeSearchString(newValue: string) {
        let lcString = newValue.toLowerCase();
        this.setState({
            searchValue: lcString
        })
    }

    renderTrainDialogItems(): TrainDialog[] {
        if (!this.state.searchValue) {
            return this.props.trainDialogs;
        }
        // TODO: Consider caching as not very efficient
        let filteredTrainDialogs = this.props.trainDialogs.filter((t: TrainDialog) => {

            let keys = [];
            for (let round of t.rounds) {
                for (let variation of round.extractorStep.textVariations) {
                    keys.push(variation.text);
                    for (let le of variation.labelEntities) {
                        keys.push(this.props.entities.find(e => e.entityId == le.entityId).entityName);
                    }
                }
                for (let ss of round.scorerSteps) {
                    keys.push(this.props.actions.find(a => a.actionId == ss.labelAction).payload);
                }
            }
            let searchString = keys.join(' ').toLowerCase();
            return searchString.indexOf(this.state.searchValue) > -1;
        })
        return filteredTrainDialogs;
    }

    render() {
        const { intl } = this.props
        let trainDialogItems = this.renderTrainDialogItems()
        let trainDialog = this.props.trainDialogs.find((td) => td.trainDialogId === this.state.trainDialogId);
        return (
            <div className="blis-page">
                <div className={`blis-dialog-title blis-dialog-title--teach ${OF.FontClassNames.xxLarge}`}>
                    <FormattedMessage
                        id={FM.TRAINDIALOGS_TITLE}
                        defaultMessage="Train Dialogs"
                    />
                </div>
                <span className={OF.FontClassNames.mediumPlus}>
                    <FormattedMessage
                        id={FM.TRAINDIALOGS_SUBTITLE}
                        defaultMessage="Use this tool to train and improve the current versions of your application..."
                    />
                </span>
                <div>
                    <OF.PrimaryButton
                        onClick={() => this.onClickNewTeachSession()}
                        ariaDescription={intl.formatMessage({
                            id: FM.TRAINDIALOGS_CREATEBUTTONARIALDESCRIPTION,
                            defaultMessage: 'Create a New Teach Session'
                        })}
                        text={intl.formatMessage({
                            id: FM.TRAINDIALOGS_CREATEBUTTONTITLE,
                            defaultMessage: 'New Teach Session'
                        })}
                        componentRef={component => this.newTeachSessionButton = component}
                    />
                    <TeachSessionModal
                        app={this.props.app}
                        teachSession={this.props.teachSessions.current}
                        dialogMode={this.props.teachSessions.mode}
                        open={this.state.isTeachDialogModalOpen}
                        onClose={() => this.onCloseTeachSession()} 
                        onUndo={() => this.onUndoTeachStep()}
                        history={this.state.isTeachDialogModalOpen ? this.state.activities : null}
                        trainDialog={null}
                    />
                </div>
                <OF.SearchBox
                    className={OF.FontClassNames.mediumPlus}
                    onChange={(newValue) => this.onChangeSearchString(newValue)}
                    onSearch={(newValue) => this.onChangeSearchString(newValue)}
                />
                <OF.DetailsList
                    key={this.state.dialogKey}
                    className={OF.FontClassNames.mediumPlus}
                    items={trainDialogItems}
                    columns={this.state.columns}
                    checkboxVisibility={OF.CheckboxVisibility.hidden}
                    onRenderItemColumn={(trainDialog, i, column: IRenderableColumn) => returnErrorStringWhenError(() => column.render(trainDialog, this))}
                    onActiveItemChanged={trainDialog => this.onClickTrainDialogItem(trainDialog)}
                />
                <TrainDialogModal
                    app={this.props.app}
                    open={this.state.isTrainDialogModalOpen}
                    onClose={() => this.onCloseTrainDialogModal()}
                    onBranch={(turnIndex: number) => this.onBranchTrainDialog(turnIndex)}
                    onDelete={() => this.onDeleteTrainDialog()}
                    onEdit={(sourceTrainDialogId: string, editedTrainDialog: TrainDialog) => this.onEditTrainDialog(sourceTrainDialogId, editedTrainDialog)}
                    trainDialog={trainDialog}
                    history={this.state.isTrainDialogModalOpen ? this.state.activities : null}
                />
            </div>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        createTeachSessionThunkAsync,
        fetchHistoryThunkAsync,
        fetchApplicationTrainingStatusThunkAsync,
        deleteTrainDialogThunkAsync,
        createTeachSessionFromUndoThunkAsync,
        createTeachSessionFromHistoryThunkAsync,
        setErrorDisplay
    }, dispatch)
}
const mapStateToProps = (state: State) => {
    return {
        user: state.user,
        actions: state.actions,
        entities: state.entities,
        trainDialogs: state.trainDialogs,
        teachSessions: state.teachSessions
    }
}

export interface ReceivedProps {
    app: BlisAppBase
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps;

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(TrainDialogs))