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
import * as Test from '../../types/TestObjects'
import actions from '../../actions'
import Webchat, { renderActivity } from '../Webchat'
import { ActivityHeight } from '../../types/models'
import { autobind } from 'core-decorators'
import { State } from '../../types'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { injectIntl, InjectedIntlProps } from 'react-intl'
import { EditDialogType } from '../../types/const'
import { FM } from '../../react-intl-messages'
import './RateDialogsModal.css'

interface ComponentState {
    numberOfNeededRatings: number
    ratingPair: Test.RatingPair | undefined
    resultIndex: number
    webchatKey: number,
    activities1: BB.Activity[] | undefined
    activities2: BB.Activity[] | undefined
    missingLog: boolean,
    // Are webchat columns flipped (for test randomization)
    isFlipped: boolean,
    selectedActivityIndex: number | null
    scrollPosition: number | null
    haveActivityHeights: boolean
    activityHeights: ActivityHeight[]
}

const initialState: ComponentState = {
    numberOfNeededRatings: 0,
    ratingPair: undefined,
    webchatKey: 0,
    resultIndex: 0,
    activities1: undefined,
    activities2: undefined,
    missingLog: false,
    isFlipped: false,
    selectedActivityIndex: null,
    scrollPosition: 0,
    haveActivityHeights: false,
    activityHeights: []
}

interface RenderData {
    activities: BB.Activity[] | undefined,
    sourceName: string
}

class RateDialogsModal extends React.Component<Props, ComponentState> {

    state = initialState

    private sameButtonRef = React.createRef<OF.IButton>()

    async componentDidMount() {
        const numberOfNeededRatings = this.props.testSet.numRatingsNeeded()
        await Util.setStateAsync(this, { numberOfNeededRatings })
        await this.onChangedDialog()
    }

    async componentDidUpdate(prevProps: Props, prevState: ComponentState) {
        if (this.state.resultIndex !== prevState.resultIndex) {
            await this.onChangedDialog()
        }

        if (!this.state.haveActivityHeights) {
            // Check to see if all activity heights have been gathered
            const haveHeights = this.state.activityHeights.length > 0 && this.state.activityHeights.filter(ah => ah.height === undefined).length === 0
            
            if (haveHeights && this.state.activities1) {
                // If I have them calculate padding to align activity horizontally
                const activityHeights = [...this.state.activityHeights]
                const numActivities = this.state.activities1.length
                for (let index = 0; index < numActivities; index = index + 1) {
                    // Get max height for this index
                    const maxHeight = Math.max(...this.state.activityHeights
                        .filter(ah => ah.index === index) 
                        .map(ah => ah.height ?? 0))
                    
                    const itemHeights = activityHeights.filter(ah => ah.index === index)
                    for (const activityHeight of itemHeights) {
                        if (activityHeight.height) {
                            // Calcluate padding to make this activity the same height
                            activityHeight.padding = (maxHeight > activityHeight.height) 
                                ? maxHeight - activityHeight.height
                                : 0
                        }
                    }
                }
                this.setState({
                    activityHeights, 
                    scrollPosition: 0,
                    haveActivityHeights: true})  
            }
        }
    }

    renderActivity(activityProps: BotChat.WrappedActivityProps, children: React.ReactNode, setRef: (div: HTMLDivElement | null) => void): JSX.Element {

        // Pad activity to align the activities in chat window
        let padding = 0
        if (this.state.haveActivityHeights && activityProps.activity.id) {
            // Find height lookup
            const activityHeight = this.state.activityHeights.find(ah => ah.id === activityProps.activity.id)
            
            if (activityHeight?.padding) {
                padding = activityHeight.padding
            }
        }
        return renderActivity(activityProps, children, setRef, null, EditDialogType.IMPORT, this.state.selectedActivityIndex != null, padding, !this.state.haveActivityHeights)
    }

    @autobind
    async onRight() {
        if (this.state.ratingPair) {
            // Make copy so it can be edited
            const ratingPair = Util.deepCopy(this.state.ratingPair)
            if (this.state.isFlipped) {
                ratingPair.result = Test.RatingResult.FIRST
                this.props.onRate(ratingPair)
            }
            else {
                ratingPair.result = Test.RatingResult.SECOND
                this.props.onRate(ratingPair)
            }
        }
        this.onNext()

    }

    @autobind
    async onSame() {
        if (this.state.ratingPair) {
            // Make copy so it can be edited
            const ratingPair = Util.deepCopy(this.state.ratingPair)
            ratingPair.result = Test.RatingResult.SAME
            this.props.onRate(ratingPair)
        }
        this.onNext()
    }

    @autobind
    async onLeft() {
        if (this.state.ratingPair) {
            // Make copy so it can be edited
            const ratingPair = Util.deepCopy(this.state.ratingPair)
            if (this.state.isFlipped) {
                ratingPair.result = Test.RatingResult.SECOND
                this.props.onRate(ratingPair)
            }
            else {
                ratingPair.result = Test.RatingResult.FIRST
                this.props.onRate(ratingPair)
            }
        }
        this.onNext()
    }

    @autobind
    closeModal() {
        this.props.onClose()
    }

    @autobind
    onNext() {
        let resultIndex = this.state.resultIndex + 1
        if (resultIndex === this.state.numberOfNeededRatings) {
            this.closeModal()
        }
        this.setState({resultIndex})
    }

    async onChangedDialog() {

        if (this.state.resultIndex >= this.state.numberOfNeededRatings) {
            console.log("INVALID INDEX:RateDialogModal")
            return
        }

        // Get a random pair that still needs rating
        const ratingPair = this.props.testSet.getNeededRating()

        // We're done
        if (!ratingPair) {
            this.closeModal()
            return
        }

        // Generate activities for rating
        const source1 = ratingPair.sourceNames[0]
        const source2 = ratingPair.sourceNames[1]
        const transcript1 = this.props.testSet.getTranscript(source1, ratingPair.conversationId)
        const transcript2 = this.props.testSet.getTranscript(source2, ratingPair.conversationId)
        let activities1: BB.Activity[] = []
        let activities2: BB.Activity[] = []

        let missingLog = false
        if (transcript1) {
            let trainDialog = await OBIUtils.trainDialogFromTranscriptImport(transcript1, null, this.props.entities, this.props.actions, this.props.app)
            trainDialog.definitions = {
                actions: this.props.actions,
                entities: this.props.entities,
                trainDialogs: []
            }
            const teachWithActivities = await ((this.props.fetchActivitiesThunkAsync(this.props.app.appId, trainDialog, this.props.user.name, this.props.user.id) as any) as Promise<CLM.TeachWithActivities>)
            activities1 = teachWithActivities.activities
        }

        if (transcript2) {
            let trainDialog = await OBIUtils.trainDialogFromTranscriptImport(transcript2, null, this.props.entities, this.props.actions, this.props.app)
            trainDialog.definitions = {
                actions: this.props.actions,
                entities: this.props.entities,
                trainDialogs: []
            }
            const teachWithActivities = await ((this.props.fetchActivitiesThunkAsync(this.props.app.appId, trainDialog, this.props.user.name, this.props.user.id) as any) as Promise<CLM.TeachWithActivities>)
            activities2 = teachWithActivities.activities
        }

        // Find turn with first inconsistency
        const maxLength = Math.max(activities1.length, activities2.length)
        const replayError = new CLM.ReplayErrorTranscriptValidation()
        for (let i = 0; i < maxLength; i = i + 1) {
            const activity1 = activities1[i]
            const activity2 = activities2[i]
            if (!OBIUtils.isSameActivity(activity1, activity2)) {
                if (activity1) {
                    activity1.channelData.clData = {...activity1.channelData.clData, replayError  }
                }
                if (activity2) {
                    activity2.channelData.clData = {...activity2.channelData.clData, replayError  }
                }
            }
        }

        // Trim any extra activities
        const minLength = Math.min(activities1.length, activities2.length)
        activities1.splice(minLength)
        activities2.splice(minLength)

        // Initialize activity heights for lookup
        const activityHeights: ActivityHeight[] = []
        for (const [index, activity] of Object.entries(activities1)) {
            if (activity.id) {
                const activityHeight: ActivityHeight = {
                    sourceName: ratingPair.sourceNames[0],
                    index: +index,  // Convert to number
                    id: activity.id,
                    height: undefined,
                    padding: undefined
                }
                activityHeights.push(activityHeight)
            }
        }
        for (const [index, activity] of Object.entries(activities2)) {
            if (activity.id) {
                const activityHeight: ActivityHeight = {
                    sourceName: ratingPair.sourceNames[1],
                    index: +index,  // Convert to number
                    id: activity.id,
                    height: undefined,
                    padding: undefined
                }
                activityHeights.push(activityHeight)
            }
        }

        // Focus same button (otherwise last choice will be active)
        this.focusSameButton()

        this.setState({
            ratingPair,
            activities1, 
            activities2,
            missingLog,
            webchatKey: this.state.webchatKey + 1,
            isFlipped: Math.random() >= 0.5,
            haveActivityHeights: false,
            activityHeights
        })
    }

    // Keep scroll position of two webchats in lockstep
    @autobind
    onScrollChange(scrollPosition: number) {
        this.setState({scrollPosition})
    }

    @autobind
    onSelectActivity(history: BB.Activity[] | undefined, activity: BB.Activity) {
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

    // Keep track of render height for each activity.  This allows us to
    // align acitivities across multiple webchat windows by adding padding
    @autobind
    onActivityHeight(sourceName: string, index: number, height: number): void {
    
        // Find height for this item
        let activityHeight = this.state.activityHeights.find(ac =>
            ac.sourceName === sourceName && ac.index === index)

        if (activityHeight) {
            // If height hasn't been set
            if (!activityHeight.height) {
                // Set state via function so events don't clobber each other
                this.setState(prevState => {
                     // Update height
                    activityHeight = prevState.activityHeights.find(ac =>
                        ac.sourceName === sourceName && ac.index === index)!
                    activityHeight.height = height
                    return {activityHeights: prevState.activityHeights}
                })
            } 
        }
    }

    getRenderData(): RenderData[] {

        const renderData: RenderData[] = []
        if (this.state.ratingPair) {
            if (this.state.isFlipped) {
                renderData.push({sourceName: this.state.ratingPair.sourceNames[1], activities: this.state.activities2})
                renderData.push({sourceName: this.state.ratingPair.sourceNames[0], activities: this.state.activities1})
            }
            else {
                renderData.push({sourceName: this.state.ratingPair.sourceNames[0], activities: this.state.activities1})
                renderData.push({sourceName: this.state.ratingPair.sourceNames[1], activities: this.state.activities2})
            }
        }
        return renderData
    }

    render() {

        const renderData = this.getRenderData()

        return (
            <div>
                <OF.Modal
                    isOpen={true}
                    isBlocking={true}
                    containerClassName="cl-modal cl-modal--rate-dialogs"
                >
                    <div className="cl-modal_body">
                        <div className="cl-rate-dialogs-modal">
                        {renderData.map(rd => {
                            return (
                                <div 
                                    className="cl-compare-dialogs-webchat"
                                    key={rd.sourceName}
                                >
                                    <Webchat 
                                        isOpen={rd.activities !== undefined}
                                        key={`${rd.sourceName}-${this.state.webchatKey}`}
                                        app={this.props.app}
                                        history={rd.activities ?? []}
                                        onPostActivity={() => {}}
                                        onSelectActivity={(activity) => this.onSelectActivity(rd.activities as any, activity)}
                                        onScrollChange={this.onScrollChange}
                                        hideInput={true}
                                        focusInput={false}
                                        renderActivity={(props, children, setRef) => this.renderActivity(props, children, setRef)}
                                        renderInput={() => null}
                                        onActivityHeight={(index, height) => this.onActivityHeight(rd.sourceName, index, height)}
                                        selectedActivityIndex={this.state.selectedActivityIndex}
                                        forceScrollPosition={this.state.scrollPosition}
                                        instantScroll={true}
                                        disableCardActions={true}
                                    />
                                </div>
                            )
                            })
                        }
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
                                {`${this.state.resultIndex + 1} of ${this.state.numberOfNeededRatings}`}
                            </div>
                            <OF.DefaultButton
                                onClick={this.closeModal}
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
        fetchLogDialogThunkAsync: actions.log.fetchLogDialogThunkAsync,
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
    testSet: Test.TestSet
    onRate: (ratingPair: Test.RatingPair) => Promise<void>
    onClose: () => void
}

// Props types inferred from mapStateToProps & dispatchToProps
type stateProps = ReturnType<typeof mapStateToProps>;
type dispatchProps = ReturnType<typeof mapDispatchToProps>;
type Props = stateProps & dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<stateProps, dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(RateDialogsModal))
