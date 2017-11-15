import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as OF from 'office-ui-fabric-react';
import { State } from '../../../types'
import { BlisAppBase, Teach, TrainDialog } from 'blis-models'
import { TeachSessionWindow, TrainDialogWindow } from '../../../components/modals'
import { createTeachSessionThunkAsync } from '../../../actions/createActions'
import { injectIntl, InjectedIntl, InjectedIntlProps, FormattedMessage } from 'react-intl'
import { FM } from '../../../react-intl-messages'

function getColumns(intl: InjectedIntl): OF.IColumn[] {
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
            isResizable: true
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
            isResizable: true
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
            isResizable: true
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
            isResizable: true
        }
    ]
}

interface ComponentState {
    columns: OF.IColumn[],
    teachSession: Teach,
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
        isTeachDialogModalOpen: false,
        isTrainDialogModalOpen: false,
        trainDialogId: null,
        searchValue: '',
        dialogKey: 0
    }

    constructor(p: Props) {
        super(p)

        this.renderItemColumn = this.renderItemColumn.bind(this)
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
    firstUtterance(item: any) {
        try {
            if (item.rounds && item.rounds.length > 0) {
                let text = item.rounds[0].extractorStep.textVariations[0].text;
                return <span className='ms-font-m-plus'>{text}</span>;
            }
            return <span className="ms-Icon ms-Icon--Remove notFoundIcon" aria-hidden="true"></span>;
        }
        catch (err) {
            return "ERR";
        }
    }
    lastUtterance(item: any) {
        try {
            if (item.rounds && item.rounds.length > 0) {
                let text = item.rounds[item.rounds.length - 1].extractorStep.textVariations[0].text;
                return <span className='ms-font-m-plus'>{text}</span>;
            }
            return <span className="ms-Icon ms-Icon--Remove notFoundIcon" aria-hidden="true"></span>;
        }
        catch (err) {
            return "ERR";
        }
    }
    lastResponse(item: any) {
        try {
            if (item.rounds && item.rounds.length > 0) {
                let scorerSteps = item.rounds[item.rounds.length - 1].scorerSteps;
                if (scorerSteps.length > 0) {
                    let actionId = scorerSteps[scorerSteps.length - 1].labelAction;
                    let action = this.props.actions.find(a => a.actionId == actionId);
                    if (action) {
                        return <span className='ms-font-m-plus'>{action.payload}</span>;
                    }
                }
            }
            return <span className="ms-Icon ms-Icon--Remove notFoundIcon" aria-hidden="true"></span>;
        }
        catch (err) {
            return "ERR";
        }
    }
    renderItemColumn(item?: any, index?: number, column?: OF.IColumn) {
        let fieldContent = item[column.fieldName];
        switch (column.key) {
            case 'firstInput':
                return this.firstUtterance(item);
            case 'lastInput':
                return this.lastUtterance(item);
            case 'lastResponse':
                return this.lastResponse(item);
            case 'turns':
                let count = item.rounds ? item.rounds.length : 0;
                return <span className='ms-font-m-plus'>{count}</span>;
            default:
                return <span className='ms-font-m-plus'>{fieldContent}</span>;
        }
    }

    onClickNewTeachSession() {
        // TODO: Find cleaner solution for the types.  Thunks return functions but when using them on props they should be returning result of the promise.
        ((this.props.createTeachSessionThunkAsync(this.props.user.key, this.props.app.appId) as any) as Promise<Teach>)
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
            dialogKey: this.state.dialogKey + 1
        })
    }

    onClickTrainDialogItem(trainDialog: TrainDialog) {
        this.setState({
            isTrainDialogModalOpen: true,
            trainDialogId: trainDialog.trainDialogId
        })
    }

    onCloseTrainDialogWindow() {
        this.setState({
            isTrainDialogModalOpen: false,
            trainDialogId: null,
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
        // let lcString = this.state.searchValue.toLowerCase();
        let filteredTrainDialogs = this.props.trainDialogs.filter((t: TrainDialog) => {
            return true
        })
        return filteredTrainDialogs;
    }

    render() {
        const { intl } = this.props
        let trainDialogItems = this.renderTrainDialogItems()
        let trainDialog = this.props.trainDialogs.find((td) => td.trainDialogId === this.state.trainDialogId);
        return (
            <div className="blis-page">
                <div className="blis-dialog-title blis-dialog-title--teach ms-font-xxl">
                    <FormattedMessage
                        id={FM.TRAINDIALOGS_TITLE}
                        defaultMessage="Train Dialogs"
                    />
                </div>
                <span className="ms-font-m-plus">
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
                    <TeachSessionWindow
                        app={this.props.app}
                        open={this.state.isTeachDialogModalOpen}
                        onClose={() => this.onCloseTeachSession()}
                    />
                </div>
                <OF.SearchBox
                    className="ms-font-m-plus"
                    onChange={(newValue) => this.onChangeSearchString(newValue)}
                    onSearch={(newValue) => this.onChangeSearchString(newValue)}
                />
                <OF.DetailsList
                    key={this.state.dialogKey}
                    className="ms-font-m-plus"
                    items={trainDialogItems}
                    columns={this.state.columns}
                    checkboxVisibility={OF.CheckboxVisibility.hidden}
                    onRenderItemColumn={this.renderItemColumn}
                    onActiveItemChanged={trainDialog => this.onClickTrainDialogItem(trainDialog)}
                />
                <TrainDialogWindow
                    app={this.props.app}
                    open={this.state.isTrainDialogModalOpen}
                    onClose={() => this.onCloseTrainDialogWindow()}
                    trainDialog={trainDialog}
                />
            </div>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        createTeachSessionThunkAsync
    }, dispatch)
}
const mapStateToProps = (state: State) => {
    return {
        user: state.user,
        actions: state.actions,
        trainDialogs: state.trainDialogs
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