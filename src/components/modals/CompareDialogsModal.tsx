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
import * as TranscriptUtils from '../../Utils/transcriptUtils'
import actions from '../../actions'
import Webchat, { renderActivity } from '../Webchat'
import { Activity } from 'botframework-directlinejs'
import { State } from '../../types'
import { returntypeof } from 'react-redux-typescript'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { injectIntl, InjectedIntlProps } from 'react-intl'
import { EditDialogType } from '.';
import { FM } from '../../react-intl-messages'
import './CompareDialogsModal.css'

interface ComponentState {
    resultIndex: number
    webchatKey: number,
    history1: BotChat.Activity[] | undefined
    history2: BotChat.Activity[] | undefined
    selectedActivityIndex: number | null
    scrollPosition: number | null
}

const initialState: ComponentState = {
    webchatKey: 0,
    resultIndex: 0,
    history1: [],
    history2: [],
    selectedActivityIndex: null,
    scrollPosition: 0
}

class CompareDialogsModal extends React.Component<Props, ComponentState> {
    state = initialState

    async componentDidMount() {
        await this.onChangedDialog()
    }

    async componentDidUpdate(prevProps: Props, prevState: ComponentState) {
        if (this.state.resultIndex !== prevState.resultIndex) {
            await this.onChangedDialog()
        }
    }

    renderActivity(activityProps: BotChat.WrappedActivityProps, children: React.ReactNode, setRef: (div: HTMLDivElement | null) => void): JSX.Element {
        return renderActivity(activityProps, children, setRef, null, EditDialogType.IMPORT, this.state.selectedActivityIndex != null)
    }

    @OF.autobind
    onNext() {
        let resultIndex = this.state.resultIndex + 1
        if (resultIndex === this.props.transcriptValidationResults.length) {
            resultIndex = 0
        }
        this.setState({resultIndex})       
    }

    @OF.autobind
    onPrevious() {
        let resultIndex = this.state.resultIndex - 1
        if (resultIndex < 0) {
            resultIndex = this.props.transcriptValidationResults.length - 1
        }
        this.setState({resultIndex})
    }

    // Set from and recipient data from proper rendering
    cleanTranscript(history: BB.Activity[]): void {
        const userAccount: BB.ChannelAccount = { id: this.props.user.id, name: this.props.user.name, role: "user", aadObjectId: '' }
        const botAccount: BB.ChannelAccount = { id: `BOT-${this.props.user.id}`, name: CLM.CL_USER_NAME_ID, role: "bot", aadObjectId: '' }

        for (let activity of history) {
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

    async onChangedDialog() {

        if (this.state.resultIndex >= this.props.transcriptValidationResults.length) {
            console.log("INVALID INDEX: CompareDialogModal")
            return
        }

        const validationResult = this.props.transcriptValidationResults[this.state.resultIndex]

        let history1: BotChat.Activity[] = []
        let history2: BotChat.Activity[] = []
        if (validationResult.sourceHistory) {
            let trainDialog = await TranscriptUtils.trainDialogFromTranscriptImport(validationResult.sourceHistory, this.props.entities, this.props.actions, this.props.app)
            trainDialog.definitions = {
                actions: this.props.actions,
                entities: this.props.entities,
                trainDialogs: []
            }
            const teachWithHistory = await ((this.props.fetchHistoryThunkAsync(this.props.app.appId, trainDialog, this.props.user.name, this.props.user.id) as any) as Promise<CLM.TeachWithHistory>)
            history1 = teachWithHistory.history
        }
        if (validationResult.logDialogId) {
            const logDialog = await ((this.props.fetchLogDialogAsync(this.props.app.appId, validationResult.logDialogId, true) as any) as Promise<CLM.LogDialog>)
            const trainDialog = CLM.ModelUtils.ToTrainDialog(logDialog, this.props.actions, this.props.entities)
            const teachWithHistory = await ((this.props.fetchHistoryThunkAsync(this.props.app.appId, trainDialog, this.props.user.name, this.props.user.id) as any) as Promise<CLM.TeachWithHistory>)
            history2 = teachWithHistory.history
        }
        
        // Mark turns that are not aligned
        const replayError = new CLM.ReplayErrorTranscriptValidation()
        const maxLength = Math.max(history1.length, history2.length)
        for (let i = 0; i < maxLength; i = i + 1) {
            const activity1 = history1[i] as BB.Activity
            const activity2 = history2[i] as BB.Activity
            if (!this.isSameActivity(activity1, activity2)) {
                if (activity1) {
                    activity1.channelData.clData = {...activity1.channelData.clData, replayError  }
                }
                if (activity2) {
                    activity2.channelData.clData = {...activity2.channelData.clData, replayError  }
                }
            }
        }
        this.setState({
            history1, 
            history2,
            webchatKey: this.state.webchatKey + 1,
            scrollPosition: 0
        })
    }

    isSameActivity(activity1: BB.Activity, activity2: BB.Activity): boolean {
        if ((activity1 && !activity2)
            || (activity2 && !activity1)
            || (activity1.text !== activity2.text)) {
            return false
        }
        const attachments1 = activity1.attachments ? JSON.stringify(activity1.attachments) : null
        const attachments2 = activity2.attachments ? JSON.stringify(activity2.attachments) : null
        if (attachments1 !== attachments2) {
            return false
        }
        return true
    }

    // Keep scroll position of two webchats in lockstep
    @OF.autobind
    onScrollChange(scrollPosition: number) {
        this.setState({scrollPosition})
    }

    @OF.autobind
    onSelectActivity(history: BotChat.Activity[] | undefined, activity: Activity) {
        if (!history || history.length === 0) {
            return
        }

        // Look up index
        const selectedActivityIndex = history.findIndex(a => a.id === activity.id)
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
                    containerClassName="cl-modal cl-modal--compare-dialogs cl-modal--teach"
                >
                    <div className="cl-modal_body">
                        <div className="cl-compare-dialogs-modal">
                            <div>
                                <div className="cl-compare-dialogs-title">
                                    Transcript
                                </div>
                                <div className="cl-compare-dialogs-webchat">
                                    <Webchat
                                        isOpen={this.state.history1 !== undefined}
                                        key={`A-${this.state.webchatKey}`}
                                        app={this.props.app}
                                        history={this.state.history1 || []}
                                        onPostActivity={() => {}}
                                        onSelectActivity={(activity) => this.onSelectActivity(this.state.history1, activity)}
                                        onScrollChange={this.onScrollChange}
                                        hideInput={true}
                                        focusInput={false}
                                        renderActivity={(props, children, setRef) => this.renderActivity(props, children, setRef)}
                                        renderInput={() => null}
                                        selectedActivityIndex={this.state.selectedActivityIndex}
                                        forceScrollPosition={this.state.scrollPosition}
                                        instantScroll={true}
                                        disableCardActions={true}
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="cl-compare-dialogs-title">
                                    Model Output
                                </div>
                                <div className="cl-compare-dialogs-webchat">
                                    <Webchat
                                        isOpen={this.state.history2 !== undefined}
                                        key={`B-${this.state.webchatKey}`}
                                        app={this.props.app}
                                        history={this.state.history2 || []}
                                        onPostActivity={() => {}}
                                        onSelectActivity={(activity) => this.onSelectActivity(this.state.history2, activity)}
                                        onScrollChange={this.onScrollChange}
                                        hideInput={true}
                                        focusInput={false}
                                        renderActivity={(props, children, setRef) => this.renderActivity(props, children, setRef)}
                                        renderInput={() => null}
                                        selectedActivityIndex={this.state.selectedActivityIndex}
                                        forceScrollPosition={this.state.scrollPosition}
                                        instantScroll={true}
                                        disableCardActions={true}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="cl-modal_footer cl-modal_footer--border">
                        <div className="cl-modal-buttons">
                            <div className="cl-modal-buttons_primary">
                                {this.props.transcriptValidationResults[this.state.resultIndex].fileName}
                            </div>
                            <div className="cl-modal-buttons_secondary">
                                <OF.DefaultButton
                                    onClick={this.onPrevious}
                                    iconProps={{ iconName: 'ChevronLeftSmall' }}
                                    ariaDescription={Util.formatMessageId(this.props.intl, FM.BUTTON_PREVIOUS)}
                                    text={Util.formatMessageId(this.props.intl, FM.BUTTON_PREVIOUS)}
                                />
                                <OF.DefaultButton
                                    onClick={this.onNext}
                                    iconProps={{ iconName: 'ChevronRightSmall' }}
                                    ariaDescription={Util.formatMessageId(this.props.intl, FM.BUTTON_NEXT)}
                                    text={Util.formatMessageId(this.props.intl, FM.BUTTON_NEXT)}
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
        fetchHistoryThunkAsync: actions.train.fetchHistoryThunkAsync,
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    if (!state.user.user) {
        throw new Error(`You attempted to render CompareDialogModels but the user was not defined. This is likely a problem with higher level component. Please open an issue.`)
    }
    return {
        user: state.user.user,
        entities: state.entities,
        actions: state.actions
    }
}

export interface ReceivedProps {
    app: CLM.AppBase
    transcriptValidationResults: CLM.TranscriptValidationResult[]
    onClose: () => void
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(CompareDialogsModal))
