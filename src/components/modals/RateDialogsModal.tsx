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
import * as OBIUtils from '../../Utils/obiUtils'
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
import './RateDialogsModal.css'
import { autobind } from 'core-decorators';

interface ComponentState {
    changedItems: CLM.TranscriptValidationResult[]
    resultIndex: number
    webchatKey: number,
    activities1: BotChat.Activity[] | undefined
    activities2: BotChat.Activity[] | undefined
    missingLog: boolean,
    // Are webchat columns flipped (for test randomization)
    isFlipped: boolean,
    selectedActivityIndex: number | null
    scrollPosition: number | null
    betterIds: string[],
    worseIds: string[],
    sameIds: string[]
}

const initialState: ComponentState = {
    changedItems: [],
    webchatKey: 0,
    resultIndex: 0,
    activities1: [],
    activities2: [],
    missingLog: false,
    isFlipped: false,
    selectedActivityIndex: null,
    scrollPosition: 0,
    betterIds: [],
    worseIds: [],
    sameIds: []
}

class RateDialogsModal extends React.Component<Props, ComponentState> {

    state = initialState

    private sameButtonRef = React.createRef<OF.IButton>()

    async componentDidMount() {
        const changedItems = this.props.transcriptValidationSet.transcriptValidationResults.filter(tr => tr.validity === CLM.TranscriptValidationResultType.CHANGED)
        await Util.setStateAsync(this, {changedItems})
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

    currentLogDialodId(): string {
        const logDialogId = this.state.changedItems[this.state.resultIndex].logDialogId
        if (!logDialogId) {
            throw new Error("Missing log dialog Id")
        }
        return logDialogId
    }

    @autobind
    async onRight() {
        const logDialogId = this.currentLogDialodId()
        if (this.state.isFlipped) {
            await Util.setStateAsync(this, {worseIds: [...this.state.worseIds, logDialogId]})
        }
        else {
            await Util.setStateAsync(this, {betterIds: [...this.state.betterIds, logDialogId]})
        }
        this.onNext()
    }

    @autobind
    async onSame() {
        const logDialogId = this.currentLogDialodId()
        await Util.setStateAsync(this, {sameIds: [...this.state.sameIds, logDialogId]})
        this.onNext()
    }

    @autobind
    async onLeft() {
        const logDialogId = this.currentLogDialodId()
        if (this.state.isFlipped) {
            await Util.setStateAsync(this, {betterIds: [...this.state.betterIds, logDialogId]})
        }
        else {
            await Util.setStateAsync(this, {worseIds: [...this.state.worseIds, logDialogId]})
        }
        this.onNext()
    }

    //--- SAVE ------
    @autobind
    saveResults() {
        const set = Util.deepCopy(this.props.transcriptValidationSet)

        this.state.betterIds.forEach(id => {
            const result = set.transcriptValidationResults.find(tr => tr.logDialogId === id)
            if (!result) {
                throw new Error("Can't find log dialog id")
            }
            result.rating = CLM.TranscriptRating.BETTER
        })

        this.state.worseIds.forEach(id => {
            const result = set.transcriptValidationResults.find(tr => tr.logDialogId === id)
            if (!result) {
                throw new Error("Can't find log dialog id")
            }
            result.rating = CLM.TranscriptRating.WORSE
        })

        this.state.sameIds.forEach(id => {
            const result = set.transcriptValidationResults.find(tr => tr.logDialogId === id)
            if (!result) {
                throw new Error("Can't find log dialog id")
            }
            result.rating = CLM.TranscriptRating.SAME
        })

        this.props.onClose(set)
    }

    @autobind
    onNext() {
        let resultIndex = this.state.resultIndex + 1
        if (resultIndex === this.state.changedItems.length) {
            this.saveResults()
        }
        this.setState({resultIndex})
    }

    async onChangedDialog() {

        if (this.state.resultIndex >= this.state.changedItems.length) {
            console.log("INVALID INDEX: CompareDialogModal")
            return
        }

        const validationResult = this.state.changedItems[this.state.resultIndex]

        let activities1: BotChat.Activity[] = []
        let activities2: BotChat.Activity[] = []
        let missingLog = false
        if (validationResult.sourceActivities) {
            let trainDialog = await OBIUtils.trainDialogFromTranscriptImport(validationResult.sourceActivities, null, this.props.entities, this.props.actions, this.props.app)
            trainDialog.definitions = {
                actions: this.props.actions,
                entities: this.props.entities,
                trainDialogs: []
            }
            const teachWithActivities = await ((this.props.fetchActivitiesThunkAsync(this.props.app.appId, trainDialog, this.props.user.name, this.props.user.id) as any) as Promise<CLM.TeachWithActivities>)
            activities1 = teachWithActivities.activities
        }
        if (validationResult.logDialogId) {
            const logDialog = await ((this.props.fetchLogDialogAsync(this.props.app.appId, validationResult.logDialogId, true, true) as any) as Promise<CLM.LogDialog>)
            if (!logDialog) {
                activities2 = []
                missingLog = true
            }
            else {
                const trainDialog = CLM.ModelUtils.ToTrainDialog(logDialog, this.props.actions, this.props.entities)
                const teachWithActivities = await ((this.props.fetchActivitiesThunkAsync(this.props.app.appId, trainDialog, this.props.user.name, this.props.user.id) as any) as Promise<CLM.TeachWithActivities>)
                activities2 = teachWithActivities.activities
            }
        }

        // Find turn with first inconsistency
        const maxLength = Math.max(activities1.length, activities2.length)
        let stopTurn = -1
        const replayError = new CLM.ReplayErrorTranscriptValidation()
        for (let i = 0; i < maxLength; i = i + 1) {
            const activity1 = activities1[i] as BB.Activity
            const activity2 = activities2[i] as BB.Activity
            if (!OBIUtils.isSameActivity(activity1, activity2)) {
                if (activity1) {
                    activity1.channelData.clData = {...activity1.channelData.clData, replayError  }
                }
                if (activity2) {
                    activity2.channelData.clData = {...activity2.channelData.clData, replayError  }
                }
                stopTurn = i + 1
                break
            }
        }

        // Cut off activities at first inconsistency
        activities1 = activities1.slice(0, stopTurn)
        activities2 = activities2.slice(0, stopTurn)

        // Focuse same button (otherwise last choise will be active)
        this.focusSameButton()

        this.setState({
            activities1,
            activities2,
            missingLog,
            webchatKey: this.state.webchatKey + 1,
            scrollPosition: 0,
            isFlipped: Math.random() >= 0.5
        })
    }

    // Keep scroll position of two webchats in lockstep
    @autobind
    onScrollChange(scrollPosition: number) {
        this.setState({scrollPosition})
    }

    @autobind
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
        const leftHistory = this.state.isFlipped ? this.state.activities2 : this.state.activities1
        const rightHistory = this.state.isFlipped ? this.state.activities1 : this.state.activities2

        return (
            <div>
                <OF.Modal
                    isOpen={true}
                    isBlocking={true}
                    containerClassName="cl-modal cl-modal--compare-dialogs"
                >
                    <div className="cl-modal_body">
                        <div className="cl-compare-dialogs-modal">
                            <div>
                                <div className="cl-compare-dialogs-webchat">
                                    <Webchat
                                        isOpen={leftHistory !== undefined}
                                        key={`A-${this.state.webchatKey}`}
                                        app={this.props.app}
                                        history={leftHistory || []}
                                        onPostActivity={() => {}}
                                        onSelectActivity={(activity) => this.onSelectActivity(leftHistory, activity)}
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
                                <div className="cl-compare-dialogs-webchat">
                                    <Webchat
                                        isOpen={rightHistory !== undefined}
                                        key={`B-${this.state.webchatKey}`}
                                        app={this.props.app}
                                        history={rightHistory || []}
                                        onPostActivity={() => {}}
                                        onSelectActivity={(activity) => this.onSelectActivity(rightHistory, activity)}
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
                    <div>
                        <div className="cl-rate-dialogs-vote-bar">
                            <OF.DefaultButton
                                onClick={this.onLeft}
                                className='cl-rate-dialogs-left-button'
                                iconProps={{ iconName: 'Trophy2'}}
                                ariaDescription={Util.formatMessageId(this.props.intl, FM.BUTTON_PREVIOUS)}
                                text={'Left Better'}
                            />
                            <OF.DefaultButton
                                className='cl-rate-dialogs-same-button'
                                onClick={this.onSame}
                                iconProps={{ iconName: 'Compare'}}
                                ariaDescription={Util.formatMessageId(this.props.intl, FM.BUTTON_NEXT)}
                                text={'Same'}
                                componentRef={this.sameButtonRef}
                            />
                            <OF.DefaultButton
                                onClick={this.onRight}
                                className='cl-rate-dialogs-right-button'
                                iconProps={{ iconName: 'Trophy2'}}
                                ariaDescription={Util.formatMessageId(this.props.intl, FM.BUTTON_NEXT)}
                                text={'Right Better'}
                            />
                        </div>
                        <div className="cl-rate-dialogs-button-bar">
                            <div className="cl-rate-dialogs-count">
                                {`${this.state.resultIndex + 1} of ${this.state.changedItems.length}`}
                            </div>
                            <OF.DefaultButton
                                onClick={this.saveResults}
                                className='cl-rate-dialogs-close-button'
                                ariaDescription={Util.formatMessageId(this.props.intl, FM.BUTTON_CLOSE)}
                                text={Util.formatMessageId(this.props.intl, FM.BUTTON_CLOSE)}
                                iconProps={{ iconName: 'Cancel' }}
                            />
                        </div>
                    </div>
                </OF.Modal>
            </div>
        )
    }

    private focusSameButton() {
        if (this.sameButtonRef.current) {
            this.sameButtonRef.current.focus()
        }
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
        actions: state.actions
    }
}

export interface ReceivedProps {
    app: CLM.AppBase
    transcriptValidationSet: CLM.TranscriptValidationSet
    onClose: (set: CLM.TranscriptValidationSet) => void
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(RateDialogsModal))
