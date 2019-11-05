/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as React from 'react'
import * as CLM from '@conversationlearner/models'
import * as OF from 'office-ui-fabric-react'
import * as BotChat from '@conversationlearner/webchat'
import * as Util from '../../Utils/util'
import * as BB from 'botbuilder'
import * as DialogUtils from '../../Utils/dialogUtils'
import actions from '../../actions'
import IndexButtons from '../IndexButtons'
import Webchat, { renderActivity } from '../Webchat'
import { autobind } from 'core-decorators'
import { withRouter } from 'react-router-dom'
import { RouteComponentProps } from 'react-router'
import { State } from '../../types'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { injectIntl, InjectedIntlProps } from 'react-intl'
import { EditDialogType } from '../../types/const'
import { FM } from '../../react-intl-messages'
import './CompareDialogsModal.css'

interface ComponentState {
    dialogIndex: number
    webchatKey: number
    activities: BB.Activity[]
    selectedActivityIndex: number | null
    logDialogId: string | undefined
}

const initialState: ComponentState = {
    webchatKey: 0,
    dialogIndex: 0,
    activities: [],
    selectedActivityIndex: null,
    logDialogId: undefined
}

class ViewDialogsModal extends React.Component<Props, ComponentState> {
    state = initialState

    async componentDidMount() {
        await this.onChangedDialog()
    }

    async componentDidUpdate(prevProps: Props, prevState: ComponentState) {
        if (this.state.dialogIndex !== prevState.dialogIndex) {
            await this.onChangedDialog()
        }
    }

    renderActivity(activityProps: BotChat.WrappedActivityProps, children: React.ReactNode, setRef: (div: HTMLDivElement | null) => void): JSX.Element {
        return renderActivity(activityProps, children, setRef, null, EditDialogType.IMPORT, this.state.selectedActivityIndex != null)
    }

    @autobind
    onNext() {
        let dialogIndex = this.state.dialogIndex + 1
        if (dialogIndex === this.props.logDialogIds.length) {
            dialogIndex = 0
        }
        this.setState({ dialogIndex })
    }

    @autobind
    onPrevious() {
        let dialogIndex = this.state.dialogIndex - 1
        if (dialogIndex < 0) {
            dialogIndex = this.props.logDialogIds.length - 1
        }
        this.setState({ dialogIndex })
    }

    // LARS move to util class - shared in other files
    // Set from and recipient data for proper rendering
    cleanTranscript(activities: BB.Activity[]): void {
        const userAccount: BB.ChannelAccount = { id: this.props.user.id, name: this.props.user.name, role: "user", aadObjectId: '' }
        const botAccount: BB.ChannelAccount = { id: `BOT-${this.props.user.id}`, name: CLM.CL_USER_NAME_ID, role: "bot", aadObjectId: '' }

        for (let activity of activities) {
            if (!activity.recipient) {
                if (activity.from.role === "bot") {
                    activity.recipient = userAccount
                    activity.from = botAccount
                }
                else if (activity.from.role === 'user') {
                    activity.recipient = botAccount
                    activity.from = userAccount
                }
            }
            if (!activity.id) {
                activity.id = CLM.ModelUtils.generateGUID()
            }
        }
    }

    // User had changed dialog.  Generate appropriate activityMaps
    async onChangedDialog() {

        if (this.state.dialogIndex >= this.props.logDialogIds.length) {
            console.log("INVALID INDEX: ViewDialogsModal")
            return
        }

        const logDialogId = this.props.logDialogIds[this.state.dialogIndex]
        const logDialog = this.props.logDialogs.find(ld => ld.logDialogId === logDialogId)
        if (!logDialog) {
            throw new Error(`Can't find log dialog ${logDialogId}`)

        }

        const trainDialog = CLM.ModelUtils.ToTrainDialog(logDialog)
        trainDialog.definitions = {
            actions: this.props.actions,
            entities: this.props.entities,
            trainDialogs: []
        }
        const teachWithActivities = await ((this.props.fetchActivitiesThunkAsync(this.props.app.appId, trainDialog, this.props.user.name, this.props.user.id) as any) as Promise<CLM.TeachWithActivities>)

        this.setState({
            activities: teachWithActivities.activities,
            webchatKey: this.state.webchatKey + 1
        })
    }

    @autobind
    onEdit() {
        if (this.state.logDialogId) {
            const { history } = this.props
            let url = `/home/${this.props.app.appId}/logDialogs?${DialogUtils.DialogQueryParams.id}=${this.state.logDialogId}`
            history.push(url, { app: this.props.app })
        }
    }

    @autobind
    onSelectActivity(activities: BB.Activity[] | undefined, activity: BB.Activity) {
        if (!activities || activities.length === 0) {
            return
        }

        // Look up index
        const selectedActivityIndex = activities.findIndex(a => a.id === activity.id)
        if (selectedActivityIndex > -1) {
            this.setState({
                selectedActivityIndex
            })
        }
    }

    render() {

        return (
            <div>
                <OF.Modal
                    isOpen={true}
                    isBlocking={true}
                    containerClassName={`cl-modal cl-modal--compare-dialogs cl-compare-dialogs-small`}
                >
                    <div className={`cl-modal_body cl-compare-dialogs--bodysmall`}>
                        <div className="cl-compare-dialogs-modal">

                            <div
                                className="cl-compare-dialogs-channel"
                            >
                                <div className="cl-compare-dialogs-webchat">
                                    <Webchat
                                        isOpen={this.state.activities !== undefined}
                                        key={this.state.webchatKey}
                                        app={this.props.app}
                                        history={this.state.activities as any || []}
                                        onPostActivity={() => { }}
                                        onSelectActivity={(activity) => this.onSelectActivity(this.state.activities as any, activity)}
                                        hideInput={true}
                                        focusInput={false}
                                        renderActivity={(props, children, setRef) => this.renderActivity(props, children, setRef)}
                                        renderInput={() => null}
                                        selectedActivityIndex={this.state.selectedActivityIndex}
                                        instantScroll={true}
                                        disableCardActions={true}
                                    />
                                </div>
                            </div>
                            }
                        </div>
                    </div>
                    <div className="cl-modal_footer cl-modal_footer--border">
                        <div className="cl-modal-buttons">
                            <div className="cl-modal-buttons_primary">
                                <IndexButtons
                                    onPrevious={this.onPrevious}
                                    onNext={this.onNext}
                                    curIndex={this.state.dialogIndex}
                                    total={this.props.logDialogIds.length}
                                />
                            </div>
                            <div className="cl-modal-buttons_secondary">
                                <OF.DefaultButton
                                    disabled={!this.state.logDialogId}
                                    onClick={this.onEdit}
                                    ariaDescription={Util.formatMessageId(this.props.intl, FM.COMPAREDIALOGS_EDIT)}
                                    text={Util.formatMessageId(this.props.intl, FM.COMPAREDIALOGS_EDIT)}
                                    iconProps={{ iconName: 'ColumnRightTwoThirdsEdit' }}
                                />
                                <OF.DefaultButton
                                    onClick={this.props.onClose}
                                    ariaDescription={Util.formatMessageId(this.props.intl, FM.BUTTON_CLOSE)}
                                    text={Util.formatMessageId(this.props.intl, FM.BUTTON_CLOSE)}
                                    iconProps={{ iconName: 'Cancel' }}
                                />

                            </div>
                        </div>
                    </div>
                </OF.Modal>
            </div>
        )
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        fetchLogDialogAsync: actions.log.fetchLogDialogThunkAsync,
        fetchActivitiesThunkAsync: actions.train.fetchActivitiesThunkAsync,
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    if (!state.user.user) {
        throw new Error(`You attempted to render CompareDialogModels but the user was not defined. This is likely a problem with higher level component. Please open an issue.`)
    }
    return {
        user: state.user.user,
        entities: state.entities,
        actions: state.actions,
        logDialogs: state.logDialogs
    }
}

export interface ReceivedProps {
    app: CLM.AppBase
    logDialogIds: string[]
    onClose: () => void
}

// Props types inferred from mapStateToProps & dispatchToProps
type stateProps = ReturnType<typeof mapStateToProps>;
type dispatchProps = ReturnType<typeof mapDispatchToProps>;
type Props = stateProps & dispatchProps & ReceivedProps & InjectedIntlProps & RouteComponentProps<any>

export default connect<stateProps, dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(withRouter(injectIntl(ViewDialogsModal)))
